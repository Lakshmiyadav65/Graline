import { supabase } from "../supabase";
import type { 
  Api, ApiResult, ApiError, Role, 
  Listing, ListingFilters, ListingListResponse, 
  Village, VillageDetail, FarmerMini, 
  MandiCompare, Order, CreateOrderRequest, CreateOrderResponse, 
  VerifyPaymentRequest, CreateSampleRequest, CreateSampleResponse, 
  CustomerProfile, Address, FarmerDashboard, FarmerEnrollRequest, 
  ListingInputDTO, FarmerOrderAction, AdminKpis, PendingFarmer, 
  PendingVillage, RoutePlan, QcLogInput, PayoutBatch, MandiPriceRow, SessionResponse
} from "./types";

const ok = <T>(data: T): ApiResult<T> => ({ ok: true, data });
const fail = <T>(code: ApiError["code"], message: string, field?: string): ApiResult<T> => 
  ({ ok: false, error: { code, message, field } });

export const supabaseApi: Api = {
  auth: {
    async requestOtp(phone) {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) return fail("INTERNAL", error.message);
      return ok({ requestId: "req-" + Date.now() });
    },
    async verifyOtp(req) {
      const { data, error } = await supabase.auth.verifyOtp({ phone: req.phone, token: req.otp, type: 'sms' });
      if (error || !data.session) return fail("INVALID_INPUT", error?.message || "Invalid OTP");
      
      const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', data.user!.id).single();
      const role = (profile?.role as Role) || "customer";
      const name = profile?.full_name || "User";
      
      const redirectTo = role === "admin" ? "/admin" : role === "farmer" ? "/farmer-app" : "/";
      return ok({ role, redirectTo, user: { id: data.user!.id, phone: req.phone, name, role } });
    },
    async session() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return ok<SessionResponse>({ authenticated: false, user: null });
      
      const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', data.session.user.id).single();
      return ok<SessionResponse>({ 
        authenticated: true, 
        user: { 
          id: data.session.user.id, 
          phone: data.session.user.phone || "", 
          name: profile?.full_name || "User", 
          role: (profile?.role as Role) || "customer" 
        } 
      });
    },
    async logout() {
      await supabase.auth.signOut();
      return ok({ ok: true });
    }
  },

  listings: {
    async list(filters = {}) {
      let query = supabase.from('listings').select(`
        *,
        farmers:farmer_id ( id, name, photo_url, farming_since_year, villages:village_id (id, name, slug, district, state) ),
        listing_images (image_url)
      `, { count: 'exact' }).eq('is_active', true);
      
      if (filters.variety) query = query.eq('variety', filters.variety);
      if (filters.type) query = query.eq('type', filters.type);
      if (filters.organic) query = query.eq('is_organic', true);
      
      const page = filters.page || 1;
      const pageSize = filters.pageSize || 24;
      query = query.range((page - 1) * pageSize, page * pageSize - 1);
      
      const { data, count, error } = await query;
      if (error) return fail("INTERNAL", error.message);
      
      const listings = data.map((l: any) => ({
        id: l.id,
        variety: l.variety || l.rice_variety,
        variety_other: null,
        type: l.type || "raw",
        is_organic: l.is_organic,
        organic_certification: l.organic_certification,
        available_kg: l.stock_kg,
        price_per_kg: l.price_per_kg,
        pack_sizes: l.pack_sizes || [],
        harvest_year: l.harvest_year,
        harvest_season: l.harvest_season,
        is_milled: l.is_milled,
        milled_on: l.milled_on,
        photos: l.listing_images?.map((img: any) => img.image_url) || [],
        description: l.description,
        status: l.status || "active",
        created_at: l.created_at,
        retail_paise: l.retail_paise || (l.price_per_kg + 3000),
        farmer: {
          id: l.farmers?.id || "f1",
          name: l.farmers?.name || "Farmer",
          photo_url: l.farmers?.photo_url || "",
          land_acres: l.farmers?.farm_size_acres || null,
          farming_since_year: l.farmers?.farming_since_year || null,
          village: l.farmers?.villages || { id: "v1", name: "Village", slug: "village", district: "Dist", state: "State" }
        }
      }));
      
      return ok({ listings, total: count || 0 });
    },
    async get(id) {
      const { data, error } = await supabase.from('listings').select('*, farmers(*, villages(*)), listing_images(*)').eq('id', id).single();
      if (error || !data) return fail("NOT_FOUND", "Listing not found");
      // Mapped mock response for now to satisfy interface
      return ok(data as unknown as Listing); 
    },
    async featured(n = 3) {
      const res = await this.list({ pageSize: n });
      return res.ok ? ok(res.data.listings) : fail("INTERNAL", "Error fetching featured");
    }
  },

  villages: {
    async list() {
      const { data } = await supabase.from('villages').select('*');
      return ok((data || []) as unknown as Village[]);
    },
    async get(slug) {
      const { data } = await supabase.from('villages').select('*, farmers(*, listings(*))').eq('slug', slug).single();
      if (!data) return fail("NOT_FOUND", "Village not found");
      return ok(data as unknown as VillageDetail);
    }
  },

  mandi: {
    async compare(variety) {
      return ok({ variety, mandi_modal_paise: 2200, retail_modal_paise: 8500 });
    }
  },

  orders: {
    async create(req) {
      // 1. Get session
      const { data: auth } = await supabase.auth.getSession();
      if (!auth.session) return fail("UNAUTHORIZED", "Not signed in");
      
      // 2. Call RPC to safely deduct stock and create order items
      const itemsForRpc = req.items.map(it => ({ listing_id: it.listing_id, quantity_kg: it.pack_kg * it.qty }));
      
      const { data: orderId, error } = await supabase.rpc('create_order', {
        p_customer_id: auth.session.user.id,
        p_shipping_address: JSON.stringify(req.delivery_address),
        p_items: itemsForRpc
      });
      
      if (error) return fail("CONFLICT", error.message);
      
      // 3. Update extra metadata we added in schema extension
      const orderNumber = "GL-" + orderId.substring(0, 6).toUpperCase();
      await supabase.from('orders').update({
        order_number: orderNumber,
        fulfillment_type: req.fulfillment_type,
        delivery_address: req.delivery_address,
        payment_method: req.payment_method,
        payment_status: req.payment_method === 'cod' ? 'pending' : 'pending'
      }).eq('id', orderId);
      
      const amount = 10000; // Simplified for MVP adapter
      return ok({ 
        orderId, 
        orderNumber, 
        amount, 
        payment_method: req.payment_method,
        razorpayOrderId: req.payment_method !== 'cod' ? "rzp_" + orderId : undefined,
        razorpayKey: "rzp_test_mock" 
      });
    },
    async verifyPayment(req) {
      const { error } = await supabase.from('orders').update({ payment_status: 'paid', status: 'confirmed' }).eq('id', req.orderId);
      if (error) return fail("INTERNAL", error.message);
      return ok({ orderNumber: "GL-1234" });
    },
    async list() {
      const { data } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
      return ok((data || []) as unknown as Order[]);
    },
    async get(orderNumber) {
      const { data } = await supabase.from('orders').select('*, order_items(*)').eq('order_number', orderNumber).single();
      if (!data) return fail("NOT_FOUND", "Order not found");
      return ok(data as unknown as Order);
    }
  },

  samples: {
    async create(req) {
      const { data: auth } = await supabase.auth.getSession();
      const { data, error } = await supabase.from('samples').insert({
        listing_id: req.listing_id,
        address: req.address,
        amount: 5000
      }).select().single();
      if (error) return fail("INTERNAL", error.message);
      return ok({ sampleId: data.id, amount: 5000 });
    }
  },

  customer: {
    async profile() {
      const { data: auth } = await supabase.auth.getSession();
      if (!auth.session) return fail("UNAUTHORIZED", "Not signed in");
      const { data } = await supabase.from('profiles').select('*').eq('id', auth.session.user.id).single();
      return ok({
        id: data.id, phone: data.phone_number, name: data.full_name, email: null,
        addresses: [], default_address_idx: 0
      });
    },
    async addAddress(addr) {
      return this.profile();
    }
  },

  farmer: {
    async enroll(req) {
      return ok({ farmerId: "new-farmer" });
    },
    async me() {
      return fail("NOT_FOUND", "Not implemented in adapter yet");
    },
    async listings() {
      const { data: auth } = await supabase.auth.getSession();
      const { data } = await supabase.from('listings').select('*').eq('farmer_id', auth.session?.user.id);
      return ok((data || []) as unknown as Listing[]);
    },
    async createListing(input) {
      const { data: auth } = await supabase.auth.getSession();
      const { data } = await supabase.from('listings').insert({ farmer_id: auth.session?.user.id, ...input }).select().single();
      return ok(data as unknown as Listing);
    },
    async updateListing(id, input) {
      const { data } = await supabase.from('listings').update(input).eq('id', id).select().single();
      return ok(data as unknown as Listing);
    },
    async orderAction(orderNumber, action) {
      return ok({ status: "confirmed" });
    }
  },

  admin: {
    async kpis() { return ok({ orders_this_week: 0, gmv_paise: 0, active_farmers: 0, active_customers: 0, aov_paise: 0, repeat_rate_pct: 0, on_time_pct: 0, qc_reject_pct: 0 }); },
    async pendingFarmers() { return ok([]); },
    async pendingVillages() { return ok([]); },
    async verifyFarmer(id, approve) { return ok({ status: "active" }); },
    async verifyVillage(id, approve) { return ok({ status: "verified" }); },
    async routePlans() { return ok([]); },
    async routePlan(week) { return ok({} as RoutePlan); },
    async generateRoutePlan() { return ok({} as RoutePlan); },
    async confirmRoutePlan(week) { return ok({ status: "confirmed" }); },
    async logQc(input) { return ok({ ok: true }); },
    async payoutBatch(week) { return ok({ week_of: week, rows: [], total_net: 0 }); },
    async runPayouts(week) { return ok({ week_of: week, rows: [], total_net: 0 }); },
    async mandiPrices() { return ok([]); },
    async addMandiPrice(row) { return ok({ ...row, id: "new" }); }
  }
};
