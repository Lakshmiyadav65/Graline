import { supabase } from "../supabase";
import type { 
  Api, ApiResult, ApiError, Role, 
  Listing, ListingFilters, ListingListResponse, 
  Village, VillageDetail, FarmerMini, 
  MandiCompare, Order, OrderItem, CreateOrderRequest, CreateOrderResponse, 
  VerifyPaymentRequest, CreateSampleRequest, CreateSampleResponse, 
  CustomerProfile, Address, FarmerDashboard, FarmerEnrollRequest, 
  ListingInputDTO, FarmerOrderAction, AdminKpis, PendingFarmer, 
  PendingVillage, RoutePlan, QcLogInput, PayoutBatch, MandiPriceRow, SessionResponse,
  RiceVariety, RiceType, HarvestSeason, ListingStatus, VillageStatus,
  FarmerOrderRow, OrderStatus, PayoutStatus
} from "./types";

const ok = <T>(data: T): ApiResult<T> => ({ ok: true, data });
const fail = <T>(code: ApiError["code"], message: string, field?: string): ApiResult<T> => 
  ({ ok: false, error: { code, message, field } });

// Helper to map DB Listing record to TS Listing interface
const mapListing = (l: any): Listing => ({
  id: l.id,
  variety: (l.variety || l.rice_variety) as RiceVariety,
  variety_other: l.rice_variety_other || l.variety_other || null,
  type: (l.type || "raw") as RiceType,
  is_organic: l.is_organic,
  organic_certification: l.organic_certification,
  available_kg: Number(l.stock_kg),
  price_per_kg: Number(l.price_per_kg),
  pack_sizes: l.pack_sizes || [],
  harvest_year: l.harvest_year,
  harvest_season: l.harvest_season as HarvestSeason | null,
  is_milled: l.is_milled,
  milled_on: l.milled_on,
  photos: l.listing_images?.map((img: any) => img.image_url) || [],
  description: l.description,
  status: (l.status || "active") as ListingStatus,
  created_at: l.created_at,
  retail_paise: Number(l.retail_paise || (Number(l.price_per_kg) + 3000)),
  farmer: {
    id: l.farmers?.id || "f1",
    name: l.farmers?.profiles?.full_name || "Farmer",
    photo_url: l.farmers?.photo_url || "",
    land_acres: l.farmers?.farm_size_acres || null,
    farming_since_year: l.farmers?.farming_since_year || null,
    village: l.farmers?.villages ? {
      id: l.farmers.villages.id,
      name: l.farmers.villages.name,
      slug: l.farmers.villages.slug || "",
      district: l.farmers.villages.district,
      state: l.farmers.villages.state
    } : { id: "v1", name: "Village", slug: "village", district: "Dist", state: "State" }
  }
});

// Helper to restore stock of a cancelled order
const restoreOrderStockByNumber = async (orderNumber: string) => {
  const { data: order } = await supabase
    .from('orders')
    .select('id')
    .eq('order_number', orderNumber)
    .single();

  if (!order) return;

  const { data: items } = await supabase
    .from('order_items')
    .select('listing_id, quantity_kg')
    .eq('order_id', order.id);

  if (!items) return;

  for (const item of items) {
    if (item.listing_id && item.quantity_kg) {
      const { data: listing } = await supabase
        .from('listings')
        .select('stock_kg')
        .eq('id', item.listing_id)
        .single();
      if (listing) {
        await supabase
          .from('listings')
          .update({ stock_kg: Number(listing.stock_kg) + Number(item.quantity_kg) })
          .eq('id', item.listing_id);
      }
    }
  }
};

export const supabaseApi: Api = {
  auth: {
    async requestOtp(phone) {
      if (process.env.NODE_ENV === "development") {
        return ok({ requestId: "dev-req-" + Date.now(), devOtp: "123456" });
      }
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) return fail("INTERNAL", error.message);
      return ok({ requestId: "req-" + Date.now() });
    },
    async verifyOtp(req) {
      if (process.env.NODE_ENV === "development" && req.otp === "123456") {
        try {
          const res = await fetch("/api/auth/dev-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: req.phone }),
          });
          const devLoginData = await res.json();
          if (!res.ok || devLoginData.error) {
            return fail("INTERNAL", devLoginData.error || "Development login failed");
          }

          const { error: sessionError } = await supabase.auth.setSession({
            access_token: devLoginData.session.access_token,
            refresh_token: devLoginData.session.refresh_token,
          });

          if (sessionError) {
            return fail("INTERNAL", `Set session failed: ${sessionError.message}`);
          }

          const { data: profile } = await supabase
            .from("profiles")
            .select("role, full_name")
            .eq("id", devLoginData.session.user.id)
            .single();

          const role = (profile?.role as Role) || "customer";
          const name = profile?.full_name || "User";
          const redirectTo = role === "admin" ? "/admin" : role === "farmer" ? "/farmer-app" : "/";

          return ok({
            role,
            redirectTo,
            user: { id: devLoginData.session.user.id, phone: req.phone, name, role },
          });
        } catch (err: any) {
          return fail("INTERNAL", err.message || "Development login error");
        }
      }

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
      
      const { data: profile } = await supabase.from('profiles').select('role, full_name, phone_number').eq('id', data.session.user.id).single();
      return ok<SessionResponse>({ 
        authenticated: true, 
        user: { 
          id: data.session.user.id, 
          phone: profile?.phone_number || data.session.user.phone || "", 
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
      const selectStr = `
        *,
        farmers:farmer_id${filters.village_id ? '!inner' : ''} ( 
          id, 
          photo_url, 
          farm_size_acres,
          farming_since_year, 
          profiles:profiles!farmers_id_fkey ( full_name ), 
          villages:village_id (id, name, slug, district, state) 
        ),
        listing_images (image_url)
      `;
      let query = supabase.from('listings').select(selectStr, { count: 'exact' }).eq('is_active', true);
      
      if (filters.variety) query = query.eq('rice_variety', filters.variety);
      if (filters.type) query = query.eq('type', filters.type);
      if (filters.organic) query = query.eq('is_organic', true);
      if (filters.village_id) query = query.eq('farmers.village_id', filters.village_id);
      
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,rice_variety.ilike.%${filters.search}%`);
      }
      
      if (filters.sort === 'price_asc') {
        query = query.order('price_per_kg', { ascending: true });
      } else if (filters.sort === 'price_desc') {
        query = query.order('price_per_kg', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }
      
      const page = filters.page || 1;
      const pageSize = filters.pageSize || 24;
      query = query.range((page - 1) * pageSize, page * pageSize - 1);
      
      const { data, count, error } = await query;
      if (error) return fail("INTERNAL", error.message);
      
      const listings = (data || []).map(mapListing);
      return ok({ listings, total: count || 0 });
    },
    async get(id) {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          farmers:farmer_id ( 
            id, 
            photo_url, 
            farm_size_acres,
            farming_since_year, 
            profiles:profiles!farmers_id_fkey ( full_name ), 
            villages:village_id (id, name, slug, district, state) 
          ),
          listing_images (image_url)
        `)
        .eq('id', id)
        .single();
        
      if (error || !data) return fail("NOT_FOUND", "Listing not found");
      return ok(mapListing(data)); 
    },
    async featured(n = 3) {
      const res = await this.list({ pageSize: n });
      return res.ok ? ok(res.data.listings) : fail("INTERNAL", "Error fetching featured");
    }
  },

  villages: {
    async list() {
      const { data, error } = await supabase.from('villages').select(`
        *,
        farmers ( 
          id,
          listings ( rice_variety )
        )
      `);
      if (error) return fail("INTERNAL", error.message);
      
      const villages = (data || []).map((v: any) => {
        const farmers = v.farmers || [];
        const listings = farmers.flatMap((f: any) => f.listings || []);
        const varieties: RiceVariety[] = Array.from(new Set(listings.map((l: any) => l.rice_variety as RiceVariety)));
        return {
          id: v.id,
          name: v.name,
          slug: v.slug || "",
          district: v.district,
          state: v.state,
          story: v.story,
          photo_url: v.photo_url,
          hub_address: v.hub_address,
          status: (v.status || "verified") as VillageStatus,
          farmer_count: farmers.length,
          variety_count: varieties.length,
          varieties
        };
      });
      return ok(villages);
    },
    async get(slug) {
      // 1. Fetch village details
      const { data: v, error: vErr } = await supabase
        .from('villages')
        .select('*')
        .eq('slug', slug)
        .single();
        
      if (vErr || !v) return fail("NOT_FOUND", "Village not found");
      
      // 2. Fetch all farmers in this village
      const { data: farmersData, error: fErr } = await supabase
        .from('farmers')
        .select(`
          id,
          photo_url,
          farm_size_acres,
          farming_since_year,
          profiles:profiles!farmers_id_fkey ( full_name ),
          villages:village_id (id, name, slug, district, state)
        `)
        .eq('village_id', v.id);
        
      if (fErr) return fail("INTERNAL", fErr.message);
      
      const farmers: FarmerMini[] = (farmersData || []).map((f: any) => ({
        id: f.id,
        name: f.profiles?.full_name || "Farmer",
        photo_url: f.photo_url || "",
        land_acres: f.farm_size_acres || null,
        farming_since_year: f.farming_since_year || null,
        village: {
          id: v.id,
          name: v.name,
          slug: v.slug || "",
          district: v.district,
          state: v.state
        }
      }));
      
      // 3. Fetch all active listings in this village
      const farmerIds = farmers.map(f => f.id);
      let listings: Listing[] = [];
      if (farmerIds.length > 0) {
        const { data: listingsData, error: lErr } = await supabase
          .from('listings')
          .select(`
            *,
            farmers:farmer_id ( 
              id, 
              photo_url, 
              farm_size_acres,
              farming_since_year, 
              profiles:profiles!farmers_id_fkey ( full_name ), 
              villages:village_id (id, name, slug, district, state) 
            ),
            listing_images (image_url)
          `)
          .in('farmer_id', farmerIds)
          .eq('is_active', true);
          
        if (lErr) return fail("INTERNAL", lErr.message);
        listings = (listingsData || []).map(mapListing);
      }
      
      const varieties = Array.from(new Set(listings.map(l => l.variety)));
      
      const villageDetail: VillageDetail = {
        id: v.id,
        name: v.name,
        slug: v.slug || "",
        district: v.district,
        state: v.state,
        story: v.story,
        photo_url: v.photo_url,
        hub_address: v.hub_address,
        status: (v.status || "verified") as VillageStatus,
        farmer_count: farmers.length,
        variety_count: varieties.length,
        varieties,
        farmers,
        listings
      };
      
      return ok(villageDetail);
    }
  },

  mandi: {
    async compare(variety) {
      const { data: mandiData } = await supabase
        .from('mandi_prices')
        .select('*')
        .eq('commodity', 'rice_paddy')
        .order('date', { ascending: false })
        .limit(1);
        
      const { data: retailData } = await supabase
        .from('mandi_prices')
        .select('*')
        .eq('commodity', `retail_${variety}`)
        .order('date', { ascending: false })
        .limit(1);
        
      const mandi_modal_paise = mandiData && mandiData.length > 0 ? Number(mandiData[0].modal_price) : 2200;
      const retail_modal_paise = retailData && retailData.length > 0 ? Number(retailData[0].modal_price) : 8500;
      
      return ok({ variety, mandi_modal_paise, retail_modal_paise });
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
      
      // Fetch details for the listings to denormalize into order_items
      const listingIds = req.items.map(it => it.listing_id);
      const { data: listings } = await supabase
        .from('listings')
        .select(`
          id,
          rice_variety,
          rice_variety_other,
          price_per_kg,
          photos,
          farmers:farmer_id (
            id,
            profiles:id ( full_name ),
            villages:village_id ( name )
          )
        `)
        .in('id', listingIds);
        
      const listingsMap = (listings || []).reduce((acc: any, l: any) => {
        acc[l.id] = l;
        return acc;
      }, {});

      // Calculate total subtotal and populate order items
      let totalSubtotalPaise = 0;
      
      // Get created order items
      const { data: createdItems } = await supabase
        .from('order_items')
        .select('id, listing_id')
        .eq('order_id', orderId);
        
      for (const item of (createdItems || [])) {
        const inputItem = req.items.find(it => it.listing_id === item.listing_id);
        const listing = listingsMap[item.listing_id];
        if (inputItem && listing) {
          const packKg = inputItem.pack_kg;
          const qty = inputItem.qty;
          const pricePerKg = Number(listing.price_per_kg);
          const subtotalPaise = Math.round(pricePerKg * packKg * qty * 100);
          totalSubtotalPaise += subtotalPaise;
          
          await supabase
            .from('order_items')
            .update({
              farmer_id: listing.farmers?.id,
              variety: listing.rice_variety,
              pack_kg: packKg,
              qty: qty,
              subtotal_paise: subtotalPaise,
              farmer_name: listing.farmers?.profiles?.full_name || "Farmer",
              village_name: listing.farmers?.villages?.name || "Village",
              photo_url: (listing.photos && listing.photos[0]) || null,
            })
            .eq('id', item.id);
        }
      }
      
      const subtotalRupees = totalSubtotalPaise / 100;
      // Calculate delivery fee, cod fee, commission, etc. in Rupees
      const deliveryFeeRupees = req.fulfillment_type === 'farm_pickup' ? 0 : 30; // standard delivery fee in Rupees
      const codFeeRupees = req.payment_method === 'cod' ? 30 : 0; // standard COD fee in Rupees
      const commissionRupees = subtotalRupees * 0.1; // 10% commission
      const totalRupees = subtotalRupees + deliveryFeeRupees + codFeeRupees;

      await supabase.from('orders').update({
        order_number: orderNumber,
        fulfillment_type: req.fulfillment_type,
        delivery_address: req.delivery_address,
        payment_method: req.payment_method,
        payment_status: req.payment_method === 'cod' ? 'pending' : 'pending',
        subtotal: subtotalRupees,
        delivery_fee: deliveryFeeRupees,
        cod_fee: codFeeRupees,
        commission_amount: commissionRupees,
        total_amount: totalRupees,
        delivery_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days from now
      }).eq('id', orderId);
      
      const amount = totalSubtotalPaise + (deliveryFeeRupees + codFeeRupees) * 100;
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
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*, listings(*))')
        .order('created_at', { ascending: false });
      
      const mapOrderItem = (it: any): OrderItem => {
        const listing = it.listings;
        return {
          listing_id: it.listing_id,
          farmer_id: it.farmer_id || "",
          variety: (it.variety || listing?.rice_variety || "other") as RiceVariety,
          varietyName: listing?.rice_variety_other || undefined,
          variety_other: listing?.rice_variety_other || null,
          pack_kg: Number(it.pack_kg || 0),
          qty: Number(it.qty || 0),
          price_per_kg_paise: Number(it.price_per_kg || 0) * 100,
          subtotal_paise: Number(it.subtotal_paise || 0),
          farmer_name: it.farmer_name || "",
          village_name: it.village_name || "",
          photo_url: it.photo_url || null,
        };
      };

      const mapOrder = (o: any): Order => ({
        id: o.id,
        order_number: o.order_number,
        fulfillment_type: o.fulfillment_type || "home_delivery",
        delivery_address: o.delivery_address || null,
        delivery_date: o.delivery_date || o.created_at,
        subtotal: Number(o.subtotal || o.total_amount || 0) * 100,
        delivery_fee: Number(o.delivery_fee || 0) * 100,
        cod_fee: Number(o.cod_fee || 0) * 100,
        total: Number(o.total_amount || 0) * 100,
        commission_amount: Number(o.commission_amount || 0) * 100,
        payment_method: o.payment_method || "cod",
        payment_status: o.payment_status || "pending",
        status: o.status || "pending",
        status_history: o.status_history || [],
        placed_at: o.created_at,
        items: (o.order_items || []).map(mapOrderItem),
      });

      return ok((data || []).map(mapOrder));
    },
    async get(orderNumber) {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*, listings(*))')
        .eq('order_number', orderNumber)
        .single();
      
      if (!data) return fail("NOT_FOUND", "Order not found");
      
      const mapOrderItem = (it: any): OrderItem => {
        const listing = it.listings;
        return {
          listing_id: it.listing_id,
          farmer_id: it.farmer_id || "",
          variety: (it.variety || listing?.rice_variety || "other") as RiceVariety,
          varietyName: listing?.rice_variety_other || undefined,
          variety_other: listing?.rice_variety_other || null,
          pack_kg: Number(it.pack_kg || 0),
          qty: Number(it.qty || 0),
          price_per_kg_paise: Number(it.price_per_kg || 0) * 100,
          subtotal_paise: Number(it.subtotal_paise || 0),
          farmer_name: it.farmer_name || "",
          village_name: it.village_name || "",
          photo_url: it.photo_url || null,
        };
      };

      const mapOrder = (o: any): Order => ({
        id: o.id,
        order_number: o.order_number,
        fulfillment_type: o.fulfillment_type || "home_delivery",
        delivery_address: o.delivery_address || null,
        delivery_date: o.delivery_date || o.created_at,
        subtotal: Number(o.subtotal || o.total_amount || 0) * 100,
        delivery_fee: Number(o.delivery_fee || 0) * 100,
        cod_fee: Number(o.cod_fee || 0) * 100,
        total: Number(o.total_amount || 0) * 100,
        commission_amount: Number(o.commission_amount || 0) * 100,
        payment_method: o.payment_method || "cod",
        payment_status: o.payment_status || "pending",
        status: o.status || "pending",
        status_history: o.status_history || [],
        placed_at: o.created_at,
        items: (o.order_items || []).map(mapOrderItem),
      });

      return ok(mapOrder(data));
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
      const { data, error } = await supabase.from('profiles').select('*').eq('id', auth.session.user.id).single();
      if (error) return fail("INTERNAL", error.message);
      const addr = data.delivery_address as any;
      return ok({
        id: data.id, 
        phone: data.phone_number || "", 
        name: data.full_name || "", 
        email: auth.session.user.email || null,
        addresses: addr ? [addr] : [], 
        default_address_idx: 0,
        preferred_language: data.preferred_language,
        delivery_address: addr || null
      });
    },
    async addAddress(addr) {
      const { data: auth } = await supabase.auth.getSession();
      if (!auth.session) return fail("UNAUTHORIZED", "Not signed in");
      const { data, error } = await supabase.from('profiles').update({ delivery_address: addr }).eq('id', auth.session.user.id).select().single();
      if (error) return fail("INTERNAL", error.message);
      const savedAddr = data.delivery_address as any;
      return ok({
        id: data.id, 
        phone: data.phone_number || "", 
        name: data.full_name || "", 
        email: auth.session.user.email || null,
        addresses: savedAddr ? [savedAddr] : [], 
        default_address_idx: 0,
        preferred_language: data.preferred_language,
        delivery_address: savedAddr || null
      });
    },
    async updateProfile(updates) {
      const { data: auth } = await supabase.auth.getSession();
      if (!auth.session) return fail("UNAUTHORIZED", "Not signed in");
      const { data, error } = await supabase.from('profiles').update(updates).eq('id', auth.session.user.id).select().single();
      if (error) return fail("INTERNAL", error.message);
      const addr = data.delivery_address as any;
      return ok({
        id: data.id, 
        phone: data.phone_number || "", 
        name: data.full_name || "", 
        email: auth.session.user.email || null,
        addresses: addr ? [addr] : [], 
        default_address_idx: 0,
        preferred_language: data.preferred_language,
        delivery_address: addr || null
      });
    }
  },

  farmer: {
    async enroll(req) {
      const { data: auth } = await supabase.auth.getSession();
      if (!auth.session) return fail("UNAUTHORIZED", "Not signed in");
      const userId = auth.session.user.id;

      // 1. Update profiles role and info
      const { error: profileErr } = await supabase
        .from('profiles')
        .update({
          full_name: req.name,
          phone_number: req.phone,
          role: 'farmer'
        })
        .eq('id', userId);
      if (profileErr) return fail("INTERNAL", profileErr.message);

      // 2. Village handling
      let villageId = req.village_id;
      if (req.village_request) {
        const slug = req.village_request.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const { data: newVillage, error: villageErr } = await supabase
          .from('villages')
          .insert({
            name: req.village_request.name,
            district: req.village_request.district,
            state: req.village_request.state,
            head_name: req.village_request.head_name,
            head_phone: req.village_request.head_phone,
            slug: slug,
            status: 'pending'
          })
          .select()
          .single();
        if (villageErr) return fail("INTERNAL", villageErr.message);
        villageId = newVillage.id;
      }

      // 3. Create farmer record
      const { error: farmerErr } = await supabase
        .from('farmers')
        .insert({
          id: userId,
          village_id: villageId,
          bio: req.story || "",
          farm_size_acres: req.land_acres || 0,
          farming_since_year: req.farming_since_year || new Date().getFullYear(),
          upi_id: req.upi_id,
          photo_url: req.photo_url || null,
          story: req.story || "",
          status: 'pending',
          aadhaar_last4: req.aadhaar_last4 || ""
        });
      if (farmerErr) return fail("INTERNAL", farmerErr.message);

      // 4. Create first listing
      const { data: newListing, error: listingErr } = await supabase
        .from('listings')
        .insert({
          farmer_id: userId,
          title: `${req.name}'s Rice`,
          description: req.first_listing.description || "",
          rice_variety: req.first_listing.variety,
          price_per_kg: req.first_listing.price_per_kg / 100, // DB stores unit price in Rupees
          stock_kg: req.first_listing.available_kg,
          is_active: true,
          type: req.first_listing.type,
          is_organic: req.first_listing.is_organic,
          organic_certification: req.first_listing.organic_certification || null,
          harvest_year: req.first_listing.harvest_year || new Date().getFullYear(),
          harvest_season: req.first_listing.harvest_season || 'kharif',
          is_milled: req.first_listing.is_milled,
          milled_on: req.first_listing.milled_on || null,
          pack_sizes: req.first_listing.pack_sizes
        })
        .select()
        .single();
      if (listingErr) return fail("INTERNAL", listingErr.message);

      // 5. Listing images registration
      if (req.first_listing.photos && req.first_listing.photos.length > 0) {
        const imagesData = req.first_listing.photos.map((url, index) => ({
          listing_id: newListing.id,
          image_url: url,
          is_primary: index === 0
        }));
        const { error: imagesErr } = await supabase
          .from('listing_images')
          .insert(imagesData);
        if (imagesErr) return fail("INTERNAL", imagesErr.message);
      }

      return ok({ farmerId: userId });
    },
    async me() {
      const { data: auth } = await supabase.auth.getSession();
      if (!auth.session) return fail("UNAUTHORIZED", "Not signed in");
      const farmerId = auth.session.user.id;
      
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('*, farmers(*, villages(*))')
        .eq('id', farmerId)
        .single();
        
      if (profileErr) return fail("INTERNAL", profileErr.message);

      const { count: listingsCount } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('farmer_id', farmerId)
        .eq('is_active', true);

      const { data: listings } = await supabase
        .from('listings')
        .select('stock_kg')
        .eq('farmer_id', farmerId);
        
      const totalStock = listings?.reduce((sum, l) => sum + Number(l.stock_kg), 0) || 0;

      const { data: orderItems, error: itemsErr } = await supabase
        .from('order_items')
        .select(`
          id,
          quantity_kg,
          price_per_kg,
          pack_kg,
          qty,
          variety,
          order_id,
          orders (
            order_number,
            status,
            created_at,
            delivery_date,
            customer_id,
            profiles:customer_id (
              full_name
            )
          )
        `)
        .eq('farmer_id', farmerId);

      if (itemsErr) return fail("INTERNAL", itemsErr.message);

      const nonCancelledItems = (orderItems || []).filter((item: any) => item.orders?.status !== 'cancelled');
      const totalRevenue = nonCancelledItems.reduce((sum, item) => {
        const totalItemRupees = Number(item.quantity_kg) * Number(item.price_per_kg);
        const commissionAmount = totalItemRupees * 0.10;
        const earningsPaise = Math.round((totalItemRupees - commissionAmount) * 100);
        return sum + earningsPaise;
      }, 0);

      const uniqueOrderIds = new Set((orderItems || []).map(item => item.order_id));

      const formattedOrders: FarmerOrderRow[] = (orderItems || []).map((item: any) => {
        const order = item.orders;
        const customerName = order?.profiles?.full_name || "Customer";
        const totalItemRupees = Number(item.quantity_kg) * Number(item.price_per_kg);
        const commissionAmount = totalItemRupees * 0.10;
        const earningsPaise = Math.round((totalItemRupees - commissionAmount) * 100);
        
        return {
          order_number: order?.order_number || "GL-XXXXXX",
          variety: item.variety as RiceVariety,
          pack_kg: Number(item.pack_kg) || 10,
          qty: Number(item.qty) || 1,
          customer_label: customerName,
          pickup_date: order?.delivery_date || new Date().toISOString(),
          earnings_paise: earningsPaise,
          status: order?.status || "pending"
        };
      });

      return ok({
        profile: {
          id: profile.id,
          phone: profile.phone_number || "",
          name: profile.full_name || "",
          photo_url: profile.farmers?.photo_url || null,
          land_acres: profile.farmers?.farm_size_acres || null,
          farming_since_year: profile.farmers?.farming_since_year || null,
          village: profile.farmers?.villages ? {
            id: profile.farmers.villages.id,
            name: profile.farmers.villages.name,
            slug: profile.farmers.villages.slug || "",
            district: profile.farmers.villages.district,
            state: profile.farmers.villages.state
          } : { id: "v1", name: "Village", slug: "village", district: "Dist", state: "State" },
          upi_id: profile.farmers?.upi_id || "",
          status: profile.farmers?.status || "pending",
          story: profile.farmers?.story || null,
          total_earned: totalRevenue,
          total_kg_sold: nonCancelledItems.reduce((sum, it) => sum + Number(it.quantity_kg), 0),
          total_orders: uniqueOrderIds.size,
          preferred_language: profile.preferred_language || null
        },
        stats: {
          earned_this_week: totalRevenue,
          kg_sold_this_week: nonCancelledItems.reduce((sum, it) => sum + Number(it.quantity_kg), 0),
          avg_price_per_kg: 0,
          mandi_rate: 2200,
          stock_remaining_kg: totalStock,
          active_orders: uniqueOrderIds.size,
          delta_vs_last_week: 0
        },
        incoming_orders: formattedOrders,
        weekly_earnings: [],
        recent_payouts: []
      });
    },
    async listings() {
      const { data: auth } = await supabase.auth.getSession();
      if (!auth.session) return fail("UNAUTHORIZED", "Not signed in");
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          farmers:farmer_id ( 
            id, 
            photo_url, 
            farm_size_acres,
            farming_since_year, 
            profiles:profiles!farmers_id_fkey ( full_name ), 
            villages:village_id (id, name, slug, district, state) 
          ),
          listing_images (image_url)
        `)
        .eq('farmer_id', auth.session.user.id);
      if (error) return fail("INTERNAL", error.message);
      return ok((data || []).map(mapListing));
    },
    async createListing(input) {
      const { data: auth } = await supabase.auth.getSession();
      if (!auth.session) return fail("UNAUTHORIZED", "Not signed in");
      
      const insertData = {
        farmer_id: auth.session.user.id,
        title: input.variety.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        description: input.description,
        rice_variety: input.variety,
        price_per_kg: input.price_per_kg / 100, // convert paise to Rupees
        stock_kg: input.available_kg,
        type: input.type,
        is_organic: input.is_organic,
        organic_certification: input.organic_certification,
        harvest_year: input.harvest_year,
        harvest_season: input.harvest_season,
        is_milled: input.is_milled,
        milled_on: input.milled_on || new Date().toISOString(),
        pack_sizes: input.pack_sizes,
        retail_paise: input.price_per_kg + 3000,
        is_active: true
      };

      const { data, error } = await supabase.from('listings').insert(insertData).select().single();
      if (error) return fail("INTERNAL", error.message);

      if (input.photos && input.photos.length > 0) {
        const imageInserts = input.photos.map((url, idx) => ({
          listing_id: data.id,
          image_url: url,
          is_primary: idx === 0
        }));
        await supabase.from('listing_images').insert(imageInserts);
      }

      return ok(mapListing(data));
    },
    async updateListing(id, input) {
      const updateData: any = {};
      if (input.variety) {
        updateData.rice_variety = input.variety;
        updateData.title = input.variety.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      }
      if (input.description !== undefined) updateData.description = input.description;
      if (input.price_per_kg !== undefined) {
        updateData.price_per_kg = input.price_per_kg / 100;
        updateData.pack_sizes = input.pack_sizes;
      }
      if (input.available_kg !== undefined) updateData.stock_kg = input.available_kg;
      if (input.type !== undefined) updateData.type = input.type;
      if (input.is_organic !== undefined) updateData.is_organic = input.is_organic;
      if (input.harvest_year !== undefined) updateData.harvest_year = input.harvest_year;
      if (input.harvest_season !== undefined) updateData.harvest_season = input.harvest_season;
      
      const { data, error } = await supabase.from('listings').update(updateData).eq('id', id).select().single();
      if (error) return fail("INTERNAL", error.message);

      if (input.photos) {
        await supabase.from('listing_images').delete().eq('listing_id', id);
        const imageInserts = input.photos.map((url, idx) => ({
          listing_id: id,
          image_url: url,
          is_primary: idx === 0
        }));
        await supabase.from('listing_images').insert(imageInserts);
      }

      return ok(mapListing(data));
    },
    async deleteListing(id) {
      const { error } = await supabase.from('listings').delete().eq('id', id);
      if (error) return fail("INTERNAL", error.message);
      return ok({ ok: true });
    },
    async orderAction(orderNumber, action) {
      let statusStr: string = "pending";
      if (action === "confirm") statusStr = "confirmed";
      else if (action === "packed") statusStr = "packed";
      else if (action === "out_for_delivery") statusStr = "out_for_delivery";
      else if (action === "delivered") statusStr = "delivered";
      else if (action === "cancel") statusStr = "cancelled";

      const { data, error } = await supabase
        .from("orders")
        .update({ status: statusStr, updated_at: new Date().toISOString() })
        .eq("order_number", orderNumber)
        .select()
        .single();

      if (error) return fail("INTERNAL", error.message);
      
      if (statusStr === "cancelled") {
        await restoreOrderStockByNumber(orderNumber);
      }
      
      return ok({ status: data.status as OrderStatus });
    },
  },

  admin: {
    async kpis() {
      try {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        // 1. Orders this week
        const { count: ordersThisWeek } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', oneWeekAgo.toISOString());
          
        // 2. All orders for GMV and AOV
        const { data: allOrders } = await supabase
          .from('orders')
          .select('total_amount, customer_id');
          
        const totalOrders = allOrders || [];
        const gmvPaise = totalOrders.reduce((sum, o) => sum + Math.round(Number(o.total_amount) * 100), 0);
        const aovPaise = totalOrders.length > 0 ? Math.round(gmvPaise / totalOrders.length) : 0;
        
        // 3. Active farmers
        const { count: activeFarmers } = await supabase
          .from('farmers')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');
          
        // 4. Active customers
        const { count: activeCustomers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'customer');
          
        // 5. Repeat customer percentage
        const customerCounts: Record<string, number> = {};
        totalOrders.forEach(o => {
          customerCounts[o.customer_id] = (customerCounts[o.customer_id] || 0) + 1;
        });
        const totalCustCount = Object.keys(customerCounts).length;
        const repeatCustCount = Object.values(customerCounts).filter(c => c > 1).length;
        const repeatRatePct = totalCustCount > 0 ? Math.round((repeatCustCount / totalCustCount) * 100) : 0;
        
        return ok({
          orders_this_week: ordersThisWeek || 0,
          gmv_paise: gmvPaise,
          active_farmers: activeFarmers || 0,
          active_customers: activeCustomers || 0,
          aov_paise: aovPaise,
          repeat_rate_pct: repeatRatePct,
          on_time_pct: 100,
          qc_reject_pct: 0
        });
      } catch (err: any) {
        return fail("INTERNAL", err.message || "Failed to calculate KPIs");
      }
    },
    async pendingFarmers() {
      const { data, error } = await supabase
        .from('farmers')
        .select(`
          id,
          farm_size_acres,
          created_at,
          profiles:id (full_name, phone_number),
          villages:village_id (name)
        `)
        .eq('status', 'pending');
      
      if (error) return fail("INTERNAL", error.message);
      
      const mapped = (data || []).map((row: any) => ({
        id: row.id,
        name: row.profiles?.full_name || "Unknown Farmer",
        phone: row.profiles?.phone_number || "",
        village_name: row.villages?.name || "Unknown Village",
        land_acres: row.farm_size_acres ? Number(row.farm_size_acres) : null,
        enrolled_at: row.created_at
      }));
      return ok(mapped);
    },
    async pendingVillages() {
      const { data, error } = await supabase
        .from('villages')
        .select('*')
        .eq('status', 'pending');
        
      if (error) return fail("INTERNAL", error.message);
      
      const mapped = (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        district: row.district,
        state: row.state,
        head_name: row.head_name || "N/A",
        head_phone: row.head_phone || "N/A",
        created_at: row.created_at
      }));
      return ok(mapped);
    },
    async verifyFarmer(id, approve) {
      const status = approve ? "active" : "suspended";
      const { error } = await supabase
        .from('farmers')
        .update({ status })
        .eq('id', id);
        
      if (error) return fail("INTERNAL", error.message);
      return ok({ status: status as any });
    },
    async verifyVillage(id, approve) {
      const status = approve ? "verified" : "suspended";
      const { error } = await supabase
        .from('villages')
        .update({ status })
        .eq('id', id);
        
      if (error) return fail("INTERNAL", error.message);
      return ok({ status: status as any });
    },
    async routePlans() {
      const { data, error } = await supabase.from('route_plans').select('*').order('created_at', { ascending: false });
      if (error) return fail("INTERNAL", error.message);
      return ok((data || []).map(row => ({
        id: row.id,
        week_of: row.week_of,
        vehicle: row.vehicle,
        driver_name: row.driver_name,
        driver_phone: row.driver_phone,
        status: row.status as any,
        pickups: row.pickups || [],
        deliveries: row.deliveries || []
      })));
    },
    async routePlan(week) {
      const { data, error } = await supabase.from('route_plans').select('*').eq('week_of', week).single();
      if (error) return fail("INTERNAL", error.message);
      return ok({
        id: data.id,
        week_of: data.week_of,
        vehicle: data.vehicle,
        driver_name: data.driver_name,
        driver_phone: data.driver_phone,
        status: data.status as any,
        pickups: data.pickups || [],
        deliveries: data.deliveries || []
      });
    },
    async generateRoutePlan() {
      // 1. Fetch all confirmed orders
      const { data: orders, error: ordersErr } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          delivery_address,
          delivery_date,
          fulfillment_type,
          order_items (
            id,
            farmer_id,
            variety,
            pack_kg,
            qty,
            farmer_name,
            village_name
          )
        `)
        .eq('status', 'confirmed');
        
      if (ordersErr) return fail("INTERNAL", ordersErr.message);
      if (!orders || orders.length === 0) {
        return fail("NOT_FOUND", "No confirmed orders found to generate a route plan.");
      }
      
      // 2. Fetch all farmers and their villages to get hub addresses
      const { data: farmers, error: farmersErr } = await supabase
        .from('farmers')
        .select('id, village_id, villages(name, hub_address)');
        
      if (farmersErr) return fail("INTERNAL", farmersErr.message);
      
      // Create farmer mapping
      const farmerMap: Record<string, { village_id: string; village_name: string; hub_address: string }> = {};
      (farmers || []).forEach((f: any) => {
        if (f.id && f.villages) {
          farmerMap[f.id] = {
            village_id: f.village_id || "",
            village_name: f.villages.name || "",
            hub_address: f.villages.hub_address || ""
          };
        }
      });
      
      // 3. Group order items by village for pickups
      const pickupsMap: Record<string, {
        village_id: string;
        village_name: string;
        hub_address: string;
        farmer_orders_map: Record<string, {
          farmer_id: string;
          farmer_name: string;
          order_numbers: Set<string>;
          total_kg: number;
        }>;
      }> = {};
      
      orders.forEach(order => {
        const items = order.order_items || [];
        items.forEach((item: any) => {
          const farmerId = item.farmer_id;
          const farmerInfo = farmerMap[farmerId];
          const villageId = farmerInfo?.village_id || "v-unknown";
          const villageName = farmerInfo?.village_name || item.village_name || "Unknown Village";
          const hubAddress = farmerInfo?.hub_address || "Village Hub";
          
          if (!pickupsMap[villageId]) {
            pickupsMap[villageId] = {
              village_id: villageId,
              village_name: villageName,
              hub_address: hubAddress,
              farmer_orders_map: {}
            };
          }
          
          if (!pickupsMap[villageId].farmer_orders_map[farmerId]) {
            pickupsMap[villageId].farmer_orders_map[farmerId] = {
              farmer_id: farmerId,
              farmer_name: item.farmer_name || "Unknown Farmer",
              order_numbers: new Set<string>(),
              total_kg: 0
            };
          }
          
          pickupsMap[villageId].farmer_orders_map[farmerId].order_numbers.add(order.order_number);
          pickupsMap[villageId].farmer_orders_map[farmerId].total_kg += (Number(item.pack_kg) || 0) * (Number(item.qty) || 0);
        });
      });
      
      // Convert pickupsMap to array
      const pickups = Object.values(pickupsMap).map(p => {
        const farmerOrders = Object.values(p.farmer_orders_map).map(fo => ({
          farmer_id: fo.farmer_id,
          farmer_name: fo.farmer_name,
          order_numbers: Array.from(fo.order_numbers),
          total_kg: fo.total_kg,
          qc_status: "pending"
        }));
        
        const totalKg = farmerOrders.reduce((sum, fo) => sum + fo.total_kg, 0);
        
        return {
          village_id: p.village_id,
          village_name: p.village_name,
          hub_address: p.hub_address,
          arrival_time: "Friday 09:00 AM",
          total_kg: totalKg,
          farmer_orders: farmerOrders
        };
      });
      
      // 4. Construct deliveries
      const deliveries = orders.map(order => {
        const addr = order.delivery_address as any;
        const addressLabel = addr 
          ? `${addr.line1 || ""}, ${addr.city || ""} (${addr.pincode || ""})`
          : "Delivery Hub";
          
        return {
          type: order.fulfillment_type || "home_delivery",
          label: addressLabel,
          order_numbers: [order.order_number],
          arrival_window: "Saturday 10:00 AM - 04:00 PM"
        };
      });
      
      const weekStr = new Date().toISOString().substring(0, 10);
      const newPlan = {
        week_of: weekStr,
        vehicle: "Tata Ace (TS 08 UB 4210)",
        driver_name: "Gopal Yadav",
        driver_phone: "+919848022134",
        status: "draft",
        pickups,
        deliveries
      };
      
      const { data, error } = await supabase.from('route_plans').insert(newPlan).select().single();
      if (error) return fail("INTERNAL", error.message);
      
      return ok({
        id: data.id,
        week_of: data.week_of,
        vehicle: data.vehicle,
        driver_name: data.driver_name,
        driver_phone: data.driver_phone,
        status: data.status as any,
        pickups: data.pickups || [],
        deliveries: data.deliveries || []
      });
    },
    async confirmRoutePlan(week) {
      const { data, error } = await supabase.from('route_plans').update({ status: 'confirmed' }).eq('week_of', week).select().single();
      if (error) return fail("INTERNAL", error.message);
      return ok({ status: data.status as any });
    },
    async logQc(input) {
      const { data: routePlan, error: getErr } = await supabase
        .from('route_plans')
        .select('*')
        .eq('id', input.route_plan_id)
        .single();
        
      if (getErr || !routePlan) return fail("NOT_FOUND", "Route plan not found");
      
      const pickups = (routePlan.pickups as any[]) || [];
      const updatedPickups = pickups.map(p => {
        const updatedFarmerOrders = p.farmer_orders.map((fo: any) => {
          if (fo.farmer_id === input.farmer_id) {
            return {
              ...fo,
              qc_status: input.visual_quality,
              weight_kg: input.weight_kg,
              moisture_pct: input.moisture_pct,
              broken_grain_pct: input.broken_grain_pct,
              notes: input.notes
            };
          }
          return fo;
        });
        return {
          ...p,
          farmer_orders: updatedFarmerOrders
        };
      });
      
      const { error: updateErr } = await supabase
        .from('route_plans')
        .update({ pickups: updatedPickups })
        .eq('id', input.route_plan_id);
        
      if (updateErr) return fail("INTERNAL", updateErr.message);
      
      // Update the status of the associated orders and restore inventory on reject
      if (input.visual_quality === 'reject') {
        for (const orderNum of input.order_numbers) {
          await supabase
            .from('orders')
            .update({ status: 'cancelled' })
            .eq('order_number', orderNum);
          await restoreOrderStockByNumber(orderNum);
        }
      } else {
        for (const orderNum of input.order_numbers) {
          await supabase
            .from('orders')
            .update({ status: 'ready' })
            .eq('order_number', orderNum);
        }
      }
      
      return ok({ ok: true });
    },
    async payoutBatch(week) {
      const { data, error } = await supabase
        .from('payouts')
        .select(`
          id,
          farmer_id,
          amount,
          status,
          created_at,
          farmers:farmer_id (
            upi_id,
            profiles:id (
              full_name
            )
          )
        `);
        
      if (error) return fail("INTERNAL", error.message);
      
      const rows = (data || []).map((p: any) => {
        const net = Math.round(Number(p.amount) * 100);
        const gross = Math.round((Number(p.amount) / 0.95) * 100);
        const commission = gross - net;
        return {
          farmer_id: p.farmer_id,
          farmer_name: p.farmers?.profiles?.full_name || "Unknown Farmer",
          upi_id: p.farmers?.upi_id || "UPI not set",
          gross_amount: gross,
          commission_deducted: commission,
          net_amount: net,
          status: p.status as PayoutStatus
        };
      });
      
      const totalNet = rows.reduce((sum, r) => sum + r.net_amount, 0);
      
      return ok({
        week_of: week,
        rows,
        total_net: totalNet
      });
    },
    async runPayouts(week) {
      const { error } = await supabase
        .from('payouts')
        .update({ status: 'paid', processed_at: new Date().toISOString() })
        .eq('status', 'pending');
        
      if (error) return fail("INTERNAL", error.message);
      
      return this.payoutBatch(week);
    },
    async mandiPrices() {
      const { data, error } = await supabase
        .from('mandi_prices')
        .select('*')
        .order('date', { ascending: false });
      if (error) return fail("INTERNAL", error.message);
      return ok((data || []).map((row: any) => ({
        id: row.id,
        commodity: row.commodity,
        market: row.market,
        state: row.state,
        modal_price: Number(row.modal_price),
        date: row.date
      })));
    },
    async addMandiPrice(row) {
      const { data, error } = await supabase
        .from('mandi_prices')
        .insert({
          commodity: row.commodity,
          market: row.market,
          state: row.state,
          modal_price: row.modal_price,
          date: row.date || new Date().toISOString()
        })
        .select()
        .single();
      if (error) return fail("INTERNAL", error.message);
      return ok({
        id: data.id,
        commodity: data.commodity,
        market: data.market,
        state: data.state,
        modal_price: Number(data.modal_price),
        date: data.date
      });
    }
  }
};
