// =====================================================================
// Mock API adapter — implements the Api contract with seed-shaped fixtures.
// Drives the entire frontend before any server route exists.
// Adds artificial latency + a forceError control for exercising error states.
// =====================================================================

import { getNextSaturday, getMondayOfWeek, formatOrderNumber } from "@/lib/format";
import { deliveryFeePaise, codFeePaise } from "@/lib/pricing";
import type {
  Api, ApiResult, ApiErrorCode,
  Listing, ListingFilters, Village, VillageDetail, FarmerMini, VillageMini,
  MandiCompare, RiceVariety, PackSize,
  Order, OrderItem, CreateOrderRequest, CreateOrderResponse, VerifyPaymentRequest,
  CreateSampleRequest, CreateSampleResponse,
  SessionUser, VerifyOtpRequest, VerifyOtpResponse, RequestOtpResponse, SessionResponse,
  CustomerProfile, Address,
  FarmerDashboard, FarmerEnrollRequest, ListingInputDTO, FarmerOrderAction,
  AdminKpis, PendingFarmer, PendingVillage, RoutePlan, QcLogInput, PayoutBatch, MandiPriceRow,
} from "./types";

// ---- control surface (tests / error-state demos) -------------------

let _failNext: ApiErrorCode | null = null;
let _latencyMs = 280;

export const mockControl = {
  /** Force the very next api call to return this error code. */
  forceError(code: ApiErrorCode) { _failNext = code; },
  setLatency(ms: number) { _latencyMs = ms; },
};

function delay() {
  return new Promise<void>((r) => setTimeout(r, _latencyMs));
}

async function ok<T>(data: T): Promise<ApiResult<T>> {
  await delay();
  if (_failNext) {
    const code = _failNext;
    _failNext = null;
    return { ok: false, error: { code, message: mockErrorMessage(code) } };
  }
  return { ok: true, data };
}

async function fail<T>(code: ApiErrorCode, message: string, field?: string): Promise<ApiResult<T>> {
  await delay();
  _failNext = null;
  return { ok: false, error: { code, message, field } };
}

function mockErrorMessage(code: ApiErrorCode): string {
  switch (code) {
    case "RATE_LIMITED": return "Too many attempts. Try again in a minute.";
    case "PAYMENT_FAILED": return "Payment could not be completed.";
    case "UNAUTHORIZED": return "Please sign in to continue.";
    default: return "Something went wrong. Please try again.";
  }
}

// ---- fixtures (mirror prisma/seed.ts) ------------------------------

const RETAIL_BASELINE: Record<RiceVariety, number> = {
  sona_masuri: 8500,
  bpt_5204: 7500,
  basmati: 17500,
  jeera_samba: 12000,
  red_rice: 14000,
  brown_rice: 9000,
  hand_pounded_sona: 9500,
  other: 8000,
};

const MANDI_PADDY_PAISE = 2200;

function packs(base: number): PackSize[] {
  return [
    { kg: 1, price_per_kg_paise: base + 300 },
    { kg: 5, price_per_kg_paise: base + 100 },
    { kg: 10, price_per_kg_paise: base },
    { kg: 25, price_per_kg_paise: base - 200 },
  ];
}

const PHOTO = (s: string) =>
  `https://res.cloudinary.com/demo/image/upload/v1/grainline/seed/${s}.jpg`;

interface RawVillage extends VillageMini {
  story: string; photo_url: string; hub_address: string;
}
interface RawFarmer { id: string; village_id: string; name: string; phone: string; upi_id: string; land_acres: number; story: string; farming_since_year: number; }
interface RawListing {
  id: string; farmer_id: string; variety: RiceVariety; type: Listing["type"];
  is_organic: boolean; available_kg: number; base: number; harvest_year: number;
  harvest_season: Listing["harvest_season"]; description: string; photo: string;
}

const VILLAGES: RawVillage[] = [
  { id: "v1", name: "Konaipalli", slug: "konaipalli", district: "Karimnagar", state: "Telangana", story: "Black-cotton soil and bore-well irrigation. Three generations of paddy.", photo_url: PHOTO("konaipalli"), hub_address: "Old school building, near Hanuman temple, Konaipalli, 505186" },
  { id: "v2", name: "Pochampalli", slug: "pochampalli", district: "Yadadri", state: "Telangana", story: "Famous for ikat weaving, but the rice is just as careful.", photo_url: PHOTO("pochampalli"), hub_address: "Cooperative society building, Bus stand road, Pochampalli, 508284" },
  { id: "v3", name: "Bhupalpalli", slug: "bhupalpalli", district: "Bhupalpalli", state: "Telangana", story: "Tank-fed paddy on red loam. Long-grain basmati specialists.", photo_url: PHOTO("bhupalpalli"), hub_address: "MPDO office, Main road, Bhupalpalli, 506169" },
  { id: "v4", name: "Choutuppal", slug: "choutuppal", district: "Yadadri", state: "Telangana", story: "Aromatic Jeera Samba grown at the edge of the deccan plateau.", photo_url: PHOTO("choutuppal"), hub_address: "Gram panchayat office, Choutuppal, 508252" },
  { id: "v5", name: "Manthani", slug: "manthani", district: "Peddapalli", state: "Telangana", story: "On the banks of the Godavari. Hand-pounded rice still done here.", photo_url: PHOTO("manthani"), hub_address: "Old market square, Manthani, 505184" },
  { id: "v6", name: "Yadagiri", slug: "yadagiri", district: "Yadadri", state: "Telangana", story: "Hill-fed streams give a slightly mineral character to the rice.", photo_url: PHOTO("yadagiri"), hub_address: "Near Yadagirigutta temple road, Yadagiri, 508115" },
  { id: "v7", name: "Bhongir", slug: "bhongir", district: "Yadadri", state: "Telangana", story: "Granite hill villages with deep wells and disciplined sowing.", photo_url: PHOTO("bhongir"), hub_address: "Tehsil office, Fort road, Bhongir, 508116" },
  { id: "v8", name: "Husnabad", slug: "husnabad", district: "Siddipet", state: "Telangana", story: "Mixed-cropping village where paddy follows pulses every season.", photo_url: PHOTO("husnabad"), hub_address: "Anjaiah colony hall, Husnabad, 505467" },
];

const FARMERS: RawFarmer[] = [
  { id: "f1", village_id: "v1", name: "Ramesh Varma", phone: "+919876511111", upi_id: "ramesh.varma@upi", land_acres: 3.2, story: "Family land for three generations. Bore-well irrigation, mostly natural inputs.", farming_since_year: 2008 },
  { id: "f2", village_id: "v2", name: "Saritha Reddy", phone: "+919876522222", upi_id: "saritha@upi", land_acres: 2.5, story: "Switched to direct sales last year. Daughter helps with WhatsApp orders.", farming_since_year: 2012 },
  { id: "f3", village_id: "v3", name: "Nageshwar Rao", phone: "+919876533333", upi_id: "nageshwar@upi", land_acres: 6.0, story: "Specialist in long-grain basmati. Ages rice for two seasons before sale.", farming_since_year: 2002 },
  { id: "f4", village_id: "v2", name: "Lakshmi Devi", phone: "+919876544444", upi_id: "lakshmi.devi@upi", land_acres: 1.8, story: "Heirloom red rice grown on family land for 40+ years.", farming_since_year: 2010 },
  { id: "f5", village_id: "v4", name: "Vikram Singh", phone: "+919876555555", upi_id: "vikram@upi", land_acres: 4.5, story: "Aromatic Jeera Samba farmer. Mills in single pass for fragrance.", farming_since_year: 2015 },
  { id: "f6", village_id: "v5", name: "Yadagiri", phone: "+919876566666", upi_id: "yadagiri@upi", land_acres: 2.2, story: "Still hand-pounds rice the way his grandfather did.", farming_since_year: 2005 },
  { id: "f7", village_id: "v1", name: "Praveen Kumar", phone: "+919876577777", upi_id: "praveen.k@upi", land_acres: 5.0, story: "Practices system of rice intensification (SRI) since 2018.", farming_since_year: 2014 },
  { id: "f8", village_id: "v6", name: "Anjali Sharma", phone: "+919876588888", upi_id: "anjali@upi", land_acres: 3.0, story: "First-generation woman-led farm. Certified organic since 2022.", farming_since_year: 2019 },
  { id: "f9", village_id: "v7", name: "Srinivas Rao", phone: "+919876599999", upi_id: "srinivas.rao@upi", land_acres: 7.5, story: "Old hand at BPT 5204. Supplies hostels and home kitchens.", farming_since_year: 1998 },
  { id: "f10", village_id: "v8", name: "Suresh Babu", phone: "+919876600001", upi_id: "suresh.babu@upi", land_acres: 4.0, story: "Crop-rotation enthusiast. Paddy after green gram for soil health.", farming_since_year: 2011 },
  { id: "f11", village_id: "v7", name: "Kavitha Reddy", phone: "+919876600002", upi_id: "kavitha.reddy@upi", land_acres: 2.0, story: "Brown rice and unpolished varieties. Health-focused buyers.", farming_since_year: 2017 },
  { id: "f12", village_id: "v4", name: "Manohar", phone: "+919876600003", upi_id: "manohar@upi", land_acres: 3.5, story: "Half-acre experiment plot for revival of local short-grain varieties.", farming_since_year: 2009 },
];

const LISTINGS: RawListing[] = [
  { id: "l1", farmer_id: "f1", variety: "sona_masuri", type: "raw", is_organic: false, available_kg: 320, base: 5200, harvest_year: 2025, harvest_season: "rabi", description: "Slow-aged six months for a softer cook and a fuller fragrance. Single-pass milled, lightly polished, 0% broken grains. Best for everyday meals — biryani, pulao, plain rice.", photo: "sona-ramesh" },
  { id: "l2", farmer_id: "f7", variety: "sona_masuri", type: "raw", is_organic: true, available_kg: 180, base: 5400, harvest_year: 2025, harvest_season: "rabi", description: "SRI-grown Sona Masuri, pesticide-free, milled within 7 days of order. Soft cook, fluffy texture.", photo: "sona-praveen" },
  { id: "l3", farmer_id: "f10", variety: "sona_masuri", type: "raw", is_organic: false, available_kg: 250, base: 5100, harvest_year: 2024, harvest_season: "kharif", description: "Year-old Sona Masuri, aged in jute sacks. Drier grain that holds shape in pulao.", photo: "sona-suresh" },
  { id: "l4", farmer_id: "f2", variety: "sona_masuri", type: "raw", is_organic: false, available_kg: 140, base: 5300, harvest_year: 2025, harvest_season: "rabi", description: "Ikat-village Sona Masuri. Family land, well-water irrigation.", photo: "sona-saritha" },
  { id: "l5", farmer_id: "f11", variety: "sona_masuri", type: "boiled", is_organic: false, available_kg: 95, base: 5000, harvest_year: 2025, harvest_season: "rabi", description: "Parboiled Sona Masuri — stays separate, lower glycemic. Good for diabetic households.", photo: "sona-kavitha" },
  { id: "l6", farmer_id: "f8", variety: "sona_masuri", type: "raw", is_organic: true, available_kg: 60, base: 5800, harvest_year: 2025, harvest_season: "rabi", description: "Certified-organic Sona Masuri from Anjali's hill plot. Limited stock.", photo: "sona-anjali" },
  { id: "l7", farmer_id: "f2", variety: "bpt_5204", type: "raw", is_organic: false, available_kg: 180, base: 4800, harvest_year: 2025, harvest_season: "rabi", description: "Fresh harvest BPT 5204, slim grain that softens beautifully. Daily-meals workhorse.", photo: "bpt-saritha" },
  { id: "l8", farmer_id: "f9", variety: "bpt_5204", type: "raw", is_organic: false, available_kg: 420, base: 4700, harvest_year: 2025, harvest_season: "rabi", description: "BPT 5204 from a 25-year farmer. Bulk-friendly pricing, consistent quality.", photo: "bpt-srinivas" },
  { id: "l9", farmer_id: "f12", variety: "bpt_5204", type: "raw", is_organic: false, available_kg: 110, base: 4900, harvest_year: 2024, harvest_season: "kharif", description: "Aged BPT 5204. A familiar everyday rice with a clean finish.", photo: "bpt-manohar" },
  { id: "l10", farmer_id: "f1", variety: "bpt_5204", type: "boiled", is_organic: false, available_kg: 75, base: 4900, harvest_year: 2025, harvest_season: "rabi", description: "Parboiled BPT 5204 — stays firm, ideal for curd-rice and biryani.", photo: "bpt-ramesh" },
  { id: "l11", farmer_id: "f3", variety: "basmati", type: "raw", is_organic: false, available_kg: 90, base: 11800, harvest_year: 2023, harvest_season: "kharif", description: "Aged 2 years in Bhupalpalli. Long, fragrant grain — special-occasion biryani.", photo: "basmati-nageshwar" },
  { id: "l12", farmer_id: "f3", variety: "basmati", type: "raw", is_organic: false, available_kg: 60, base: 11500, harvest_year: 2024, harvest_season: "kharif", description: "1-year aged Basmati. Slightly milder fragrance, gentler price.", photo: "basmati-nageshwar-2" },
  { id: "l13", farmer_id: "f5", variety: "jeera_samba", type: "raw", is_organic: false, available_kg: 140, base: 7800, harvest_year: 2025, harvest_season: "kharif", description: "Aromatic short-grain. The traditional rice for Tamil-style biryani and pongal.", photo: "jeera-vikram" },
  { id: "l14", farmer_id: "f12", variety: "jeera_samba", type: "raw", is_organic: false, available_kg: 80, base: 7600, harvest_year: 2025, harvest_season: "kharif", description: "Choutuppal Jeera Samba, milled fresh. Fragrant when steamed.", photo: "jeera-manohar" },
  { id: "l15", farmer_id: "f4", variety: "red_rice", type: "raw", is_organic: false, available_kg: 60, base: 9000, harvest_year: 2025, harvest_season: "rabi", description: "Heirloom red rice with a nutty bite. High-fiber, high-iron — a complete grain.", photo: "red-lakshmi" },
  { id: "l16", farmer_id: "f8", variety: "red_rice", type: "raw", is_organic: true, available_kg: 40, base: 9500, harvest_year: 2025, harvest_season: "rabi", description: "Certified-organic red rice from Yadagiri's hill streams.", photo: "red-anjali" },
  { id: "l17", farmer_id: "f6", variety: "hand_pounded_sona", type: "hand_pounded", is_organic: false, available_kg: 75, base: 6200, harvest_year: 2025, harvest_season: "rabi", description: "Wood-mortar hand-pounded Sona. Bran lightly retained — earthy, nutty, slightly off-white.", photo: "handsona-yadagiri" },
  { id: "l18", farmer_id: "f6", variety: "hand_pounded_sona", type: "hand_pounded", is_organic: false, available_kg: 30, base: 6500, harvest_year: 2024, harvest_season: "rabi", description: "Last of last-season's hand-pounded stock. Aged on jute, fuller flavour.", photo: "handsona-yadagiri-2" },
];

// ---- builders ------------------------------------------------------

const villageById = new Map(VILLAGES.map((v) => [v.id, v]));
const farmerById = new Map(FARMERS.map((f) => [f.id, f]));

function villageMini(v: RawVillage): VillageMini {
  return { id: v.id, name: v.name, slug: v.slug, district: v.district, state: v.state };
}

function farmerMini(f: RawFarmer): FarmerMini {
  const v = villageById.get(f.village_id)!;
  return {
    id: f.id, name: f.name, photo_url: PHOTO(`farmer-${f.name.split(" ")[0].toLowerCase()}`),
    land_acres: f.land_acres, farming_since_year: f.farming_since_year, village: villageMini(v),
  };
}

function toListing(l: RawListing): Listing {
  const f = farmerById.get(l.farmer_id)!;
  return {
    id: l.id, variety: l.variety, variety_other: null, type: l.type,
    is_organic: l.is_organic, organic_certification: l.is_organic ? "Indian Organic (NPOP)" : null,
    available_kg: l.available_kg, price_per_kg: l.base, pack_sizes: packs(l.base),
    harvest_year: l.harvest_year, harvest_season: l.harvest_season, is_milled: true,
    milled_on: new Date(2025, 3, 1).toISOString(),
    photos: [PHOTO(l.photo), PHOTO(l.photo + "-2"), PHOTO(l.photo + "-3")],
    description: l.description, status: "active", created_at: new Date(2025, 3, 10).toISOString(),
    farmer: farmerMini(f), retail_paise: RETAIL_BASELINE[l.variety],
  };
}

function buildVillage(v: RawVillage): Village {
  const farmers = FARMERS.filter((f) => f.village_id === v.id);
  const listings = LISTINGS.filter((l) => farmers.some((f) => f.id === l.farmer_id));
  const varieties = Array.from(new Set(listings.map((l) => l.variety)));
  return {
    ...villageMini(v), story: v.story, photo_url: v.photo_url, hub_address: v.hub_address,
    status: "verified", farmer_count: farmers.length, variety_count: varieties.length, varieties,
  };
}

// ---- mutable in-memory state (per page-session) --------------------

// Session persists to localStorage so mock auth survives reloads
// (mirrors the iron-session cookie the real backend will set).
const SESSION_KEY = "gl_mock_session";
function loadSession(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}
function saveSession(s: SessionUser | null) {
  if (typeof window === "undefined") return;
  try {
    if (s) window.localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    else window.localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}

let _session: SessionUser | null = loadSession();
let _orderSeq = 1285; // seed used up to GL-1284
const _orders: Order[] = seedOrders();

function feePaise(fulfillment: CreateOrderRequest["fulfillment_type"], subtotal: number, method: CreateOrderRequest["payment_method"]) {
  return { delivery: deliveryFeePaise(fulfillment, subtotal), cod: codFeePaise(method) };
}

function resolveRole(phone: string): { role: SessionUser["role"]; id: string; name: string } {
  if (phone === "+919999999999") return { role: "admin", id: "a1", name: "Admin" };
  const farmer = FARMERS.find((f) => f.phone === phone);
  if (farmer) return { role: "farmer", id: farmer.id, name: farmer.name };
  return { role: "customer", id: "c-" + phone.slice(-4), name: "Customer " + phone.slice(-4) };
}

function seedOrders(): Order[] {
  const sat = getNextSaturday().toISOString();
  const sona = toListing(LISTINGS.find((l) => l.id === "l1")!);
  const red = toListing(LISTINGS.find((l) => l.id === "l15")!);
  const mkItem = (l: Listing, pack: number, ppk: number): OrderItem => ({
    listing_id: l.id, farmer_id: l.farmer.id, variety: l.variety, pack_kg: pack, qty: 1,
    price_per_kg_paise: ppk, subtotal_paise: ppk * pack,
    farmer_name: l.farmer.name, village_name: l.farmer.village.name, photo_url: l.photos[0],
  });
  return [
    {
      id: "o1", order_number: "GL-1278", items: [mkItem(sona, 10, 5200), mkItem(red, 5, 9000)],
      fulfillment_type: "home_delivery", delivery_address: { label: "Home", line1: "5-7-22, Trimulgherry", city: "Secunderabad", pincode: "500015" },
      delivery_date: sat, subtotal: 97000, delivery_fee: 12000, cod_fee: 0, total: 109000, commission_amount: 9700,
      payment_method: "upi", payment_status: "paid", status: "ready",
      status_history: [{ status: "placed", at: sat, by: "system" }, { status: "ready", at: sat, by: "f1" }],
      placed_at: new Date(2026, 4, 1).toISOString(),
    },
  ];
}

// ---- the adapter ---------------------------------------------------

export const mockApi: Api = {
  auth: {
    async requestOtp(phone) {
      if (!/^\+91[6-9]\d{9}$/.test(phone)) return fail("INVALID_INPUT", "Enter a valid Indian mobile number.", "phone");
      return ok<RequestOtpResponse>({ requestId: "mock-req-" + phone.slice(-4), devOtp: "123456" });
    },
    async verifyOtp(req: VerifyOtpRequest) {
      if (req.otp !== "123456") return fail("INVALID_INPUT", "Incorrect or expired OTP.", "otp");
      const r = resolveRole(req.phone);
      _session = { id: r.id, name: r.name, phone: req.phone, role: r.role };
      saveSession(_session);
      const redirectTo = r.role === "admin" ? "/admin" : r.role === "farmer" ? "/farmer-app" : "/";
      return ok<VerifyOtpResponse>({ role: r.role, redirectTo, user: _session });
    },
    async session() {
      if (!_session) _session = loadSession();
      return ok<SessionResponse>({ authenticated: !!_session, user: _session });
    },
    async logout() {
      _session = null;
      saveSession(null);
      return ok<{ ok: true }>({ ok: true });
    },
  },

  listings: {
    async list(filters: ListingFilters = {}) {
      let rows = LISTINGS.map(toListing).filter((l) => l.status === "active");
      if (filters.variety) rows = rows.filter((l) => l.variety === filters.variety);
      if (filters.type) rows = rows.filter((l) => l.type === filters.type);
      if (filters.organic) rows = rows.filter((l) => l.is_organic);
      if (filters.village_id) rows = rows.filter((l) => l.farmer.village.id === filters.village_id);
      if (typeof filters.min_price === "number") rows = rows.filter((l) => l.price_per_kg >= filters.min_price!);
      if (typeof filters.max_price === "number") rows = rows.filter((l) => l.price_per_kg <= filters.max_price!);
      if (filters.sort === "price_asc") rows.sort((a, b) => a.price_per_kg - b.price_per_kg);
      else if (filters.sort === "price_desc") rows.sort((a, b) => b.price_per_kg - a.price_per_kg);
      const total = rows.length;
      const page = filters.page ?? 1;
      const pageSize = filters.pageSize ?? 24;
      rows = rows.slice((page - 1) * pageSize, page * pageSize);
      return ok({ listings: rows, total });
    },
    async get(id) {
      const raw = LISTINGS.find((l) => l.id === id);
      if (!raw) return fail<Listing>("NOT_FOUND", "Listing not found.");
      return ok(toListing(raw));
    },
    async featured(n = 3) {
      return ok(["l1", "l4", "l15", "l11", "l13", "l17"].slice(0, n).map((id) => toListing(LISTINGS.find((l) => l.id === id)!)));
    },
  },

  villages: {
    async list() {
      return ok(VILLAGES.map(buildVillage));
    },
    async get(slug) {
      const raw = VILLAGES.find((v) => v.slug === slug);
      if (!raw) return fail<VillageDetail>("NOT_FOUND", "Village not found.");
      const farmers = FARMERS.filter((f) => f.village_id === raw.id).map(farmerMini);
      const listings = LISTINGS.filter((l) => farmers.some((f) => f.id === l.farmer_id)).map(toListing);
      return ok<VillageDetail>({ ...buildVillage(raw), farmers, listings });
    },
  },

  mandi: {
    async compare(variety) {
      return ok<MandiCompare>({ variety, mandi_modal_paise: MANDI_PADDY_PAISE, retail_modal_paise: RETAIL_BASELINE[variety] });
    },
  },

  orders: {
    async create(req: CreateOrderRequest) {
      if (!req.items.length) return fail<CreateOrderResponse>("INVALID_INPUT", "Your cart is empty.");
      let subtotal = 0;
      for (const it of req.items) {
        const raw = LISTINGS.find((l) => l.id === it.listing_id);
        if (!raw) return fail<CreateOrderResponse>("NOT_FOUND", "A cart item is no longer available.");
        const pk = packs(raw.base).find((p) => p.kg === it.pack_kg);
        if (!pk) return fail<CreateOrderResponse>("CONFLICT", "Pack size changed — please review your cart.");
        subtotal += pk.price_per_kg_paise * it.pack_kg * it.qty;
      }
      const { delivery, cod } = feePaise(req.fulfillment_type, subtotal, req.payment_method);
      const total = subtotal + delivery + cod;
      const orderNumber = formatOrderNumber(_orderSeq++);
      const items: OrderItem[] = req.items.map((it) => {
        const raw = LISTINGS.find((l) => l.id === it.listing_id)!;
        const f = farmerById.get(raw.farmer_id)!;
        const pk = packs(raw.base).find((p) => p.kg === it.pack_kg)!;
        return {
          listing_id: raw.id, farmer_id: raw.farmer_id, variety: raw.variety, pack_kg: it.pack_kg, qty: it.qty,
          price_per_kg_paise: pk.price_per_kg_paise, subtotal_paise: pk.price_per_kg_paise * it.pack_kg * it.qty,
          farmer_name: f.name, village_name: villageById.get(f.village_id)!.name, photo_url: PHOTO(raw.photo),
        };
      });
      const order: Order = {
        id: "o-" + orderNumber, order_number: orderNumber, items,
        fulfillment_type: req.fulfillment_type, delivery_address: req.delivery_address ?? null,
        delivery_date: getNextSaturday().toISOString(), subtotal, delivery_fee: delivery, cod_fee: cod, total,
        commission_amount: Math.floor(subtotal * 0.1), payment_method: req.payment_method,
        payment_status: req.payment_method === "cod" ? "pending" : "pending", status: "placed",
        status_history: [{ status: "placed", at: new Date().toISOString(), by: "system" }],
        placed_at: new Date().toISOString(),
      };
      _orders.unshift(order);
      const res: CreateOrderResponse = { orderId: order.id, orderNumber, amount: total, payment_method: req.payment_method };
      if (req.payment_method !== "cod") {
        res.razorpayOrderId = "order_mock_" + orderNumber;
        res.razorpayKey = "rzp_test_mock";
      }
      return ok(res);
    },
    async verifyPayment(req: VerifyPaymentRequest) {
      const order = _orders.find((o) => o.id === req.orderId);
      if (!order) return fail<{ orderNumber: string }>("NOT_FOUND", "Order not found.");
      if (!req.razorpay_payment_id) return fail<{ orderNumber: string }>("PAYMENT_FAILED", "Payment was not completed.");
      order.payment_status = "paid";
      return ok({ orderNumber: order.order_number });
    },
    async list() {
      return ok([..._orders]);
    },
    async get(orderNumber) {
      const o = _orders.find((x) => x.order_number === orderNumber);
      if (!o) return fail<Order>("NOT_FOUND", "Order not found.");
      return ok(o);
    },
  },

  samples: {
    async create(req: CreateSampleRequest) {
      const raw = LISTINGS.find((l) => l.id === req.listing_id);
      if (!raw) return fail<CreateSampleResponse>("NOT_FOUND", "Listing not found.");
      return ok<CreateSampleResponse>({ sampleId: "sample-" + raw.id, amount: 5000, razorpayOrderId: "order_mock_sample", razorpayKey: "rzp_test_mock" });
    },
  },

  customer: {
    async profile() {
      if (!_session) return fail<CustomerProfile>("UNAUTHORIZED", "Please sign in.");
      return ok<CustomerProfile>({
        id: _session.id, phone: _session.phone, name: _session.name, email: null,
        addresses: [{ label: "Home", line1: "Flat 304, Aspen Heights", line2: "Gachibowli", city: "Hyderabad", pincode: "500032" }],
        default_address_idx: 0,
      });
    },
    async addAddress(addr: Address) {
      if (!_session) return fail<CustomerProfile>("UNAUTHORIZED", "Please sign in.");
      return ok<CustomerProfile>({
        id: _session.id, phone: _session.phone, name: _session.name, email: null, addresses: [addr], default_address_idx: 0,
      });
    },
  },

  farmer: {
    async enroll(_req: FarmerEnrollRequest) {
      return ok({ farmerId: "f-new-" + Date.now() });
    },
    async me() {
      const f = farmerById.get("f1")!;
      const stockListings = LISTINGS.filter((l) => l.farmer_id === f.id);
      return ok<FarmerDashboard>({
        profile: {
          ...farmerMini(f), phone: f.phone, upi_id: f.upi_id, status: "active", story: f.story,
          total_earned: 1482000, total_kg_sold: 640, total_orders: 38,
        },
        stats: {
          earned_this_week: 1482000, kg_sold_this_week: 42, avg_price_per_kg: 5200, mandi_rate: MANDI_PADDY_PAISE,
          stock_remaining_kg: stockListings.reduce((s, l) => s + l.available_kg, 0), active_orders: 3, delta_vs_last_week: 320000,
        },
        incoming_orders: [
          { order_number: "GL-1284", variety: "sona_masuri", pack_kg: 10, qty: 1, customer_label: "Priya M. · Hyderabad", pickup_date: getNextSaturday().toISOString(), earnings_paise: 46800, status: "placed" },
          { order_number: "GL-1281", variety: "sona_masuri", pack_kg: 25, qty: 1, customer_label: "Arjun K. · Hyderabad", pickup_date: getNextSaturday().toISOString(), earnings_paise: 112500, status: "confirmed" },
          { order_number: "GL-1278", variety: "sona_masuri", pack_kg: 5, qty: 1, customer_label: "Sneha R. · Secunderabad", pickup_date: getNextSaturday().toISOString(), earnings_paise: 23900, status: "ready" },
        ],
        weekly_earnings: [
          { week: "Wk 1", paise: 982000 }, { week: "Wk 2", paise: 1124000 },
          { week: "Wk 3", paise: 1043000 }, { week: "Wk 4", paise: 1268000 },
          { week: "Wk 5", paise: 1162000 }, { week: "Wk 6", paise: 1390000 },
          { week: "Wk 7", paise: 1182000 }, { week: "Wk 8", paise: 1482000 },
        ],
        recent_payouts: [
          { week: "Wk 7", net_amount: 1063800, status: "paid" },
          { week: "Wk 6", net_amount: 1251000, status: "paid" },
          { week: "Wk 5", net_amount: 1045800, status: "paid" },
        ],
      });
    },
    async listings() {
      return ok(LISTINGS.filter((l) => l.farmer_id === "f1").map(toListing));
    },
    async createListing(input: ListingInputDTO) {
      const base = input.price_per_kg;
      const synthetic: RawListing = {
        id: "l-new-" + Date.now(), farmer_id: "f1", variety: input.variety, type: input.type,
        is_organic: input.is_organic, available_kg: input.available_kg, base, harvest_year: input.harvest_year ?? 2025,
        harvest_season: input.harvest_season ?? "rabi", description: input.description ?? "", photo: "sona-ramesh",
      };
      return ok(toListing(synthetic));
    },
    async updateListing(id, _input) {
      const raw = LISTINGS.find((l) => l.id === id) ?? LISTINGS[0];
      return ok(toListing(raw));
    },
    async orderAction(_orderNumber, action: FarmerOrderAction) {
      const status = action === "confirm" ? "confirmed" : action === "decline" ? "cancelled" : "ready";
      return ok({ status: status as Order["status"] });
    },
  },

  admin: {
    async kpis() {
      return ok<AdminKpis>({
        orders_this_week: 47, gmv_paise: 28_45_000, active_farmers: 12, active_customers: 134,
        aov_paise: 60_500, repeat_rate_pct: 38, on_time_pct: 94, qc_reject_pct: 2,
      });
    },
    async pendingFarmers() {
      return ok<PendingFarmer[]>([
        { id: "fp1", name: "Geeta Bai", phone: "+919812300011", village_name: "Husnabad", land_acres: 2.4, enrolled_at: new Date().toISOString() },
        { id: "fp2", name: "Mohan Reddy", phone: "+919812300012", village_name: "Bhongir", land_acres: 5.1, enrolled_at: new Date().toISOString() },
      ]);
    },
    async pendingVillages() {
      return ok<PendingVillage[]>([
        { id: "vp1", name: "Jangaon", district: "Jangaon", state: "Telangana", head_name: "Ravi Teja", head_phone: "+919812300021", created_at: new Date().toISOString() },
      ]);
    },
    async verifyFarmer(_id, approve) {
      return ok({ status: (approve ? "active" : "suspended") as FarmerDashboard["profile"]["status"] });
    },
    async verifyVillage(_id, approve) {
      return ok({ status: (approve ? "verified" : "suspended") as Village["status"] });
    },
    async routePlans() {
      return ok([await mockRoutePlan()]);
    },
    async routePlan(_week) {
      return ok(await mockRoutePlan());
    },
    async generateRoutePlan() {
      return ok(await mockRoutePlan());
    },
    async confirmRoutePlan(_week) {
      return ok({ status: "confirmed" as RoutePlan["status"] });
    },
    async logQc(_input: QcLogInput) {
      return ok({ ok: true } as const);
    },
    async payoutBatch(week) {
      return ok(mockPayoutBatch(week));
    },
    async runPayouts(week) {
      const b = mockPayoutBatch(week);
      b.rows.forEach((r) => (r.status = "paid"));
      return ok(b);
    },
    async mandiPrices() {
      return ok<MandiPriceRow[]>([
        { id: "m1", commodity: "rice_paddy", market: "Karimnagar APMC", state: "Telangana", modal_price: MANDI_PADDY_PAISE, date: new Date().toISOString() },
        { id: "m2", commodity: "retail_sona_masuri", market: "Hyderabad retail (avg)", state: "Telangana", modal_price: 8500, date: new Date().toISOString() },
      ]);
    },
    async addMandiPrice(row) {
      return ok<MandiPriceRow>({ ...row, id: "m-new-" + Date.now() });
    },
  },
};

async function mockRoutePlan(): Promise<RoutePlan> {
  const week = getMondayOfWeek().toISOString();
  return {
    id: "rp-" + week, week_of: week, vehicle: "Tata Ace · TS07 UB 4421", driver_name: "Imran", driver_phone: "+919812355555",
    status: "draft",
    pickups: [
      { village_id: "v1", village_name: "Konaipalli", hub_address: VILLAGES[0].hub_address, arrival_time: "07:00", total_kg: 40, farmer_orders: [{ farmer_id: "f1", farmer_name: "Ramesh Varma", order_numbers: ["GL-1278", "GL-1281", "GL-1284"], total_kg: 40, qc_status: "pending" }] },
      { village_id: "v2", village_name: "Pochampalli", hub_address: VILLAGES[1].hub_address, arrival_time: "08:30", total_kg: 15, farmer_orders: [{ farmer_id: "f4", farmer_name: "Lakshmi Devi", order_numbers: ["GL-1278"], total_kg: 5, qc_status: "pending" }] },
    ],
    deliveries: [
      { type: "home_delivery", label: "Gachibowli, Hyderabad", order_numbers: ["GL-1284"], arrival_window: "Sat 12–6pm" },
      { type: "city_pickup_point", label: "Hyderabad pickup point", order_numbers: ["GL-1281"], arrival_window: "Sat 5pm" },
    ],
  };
}

function mockPayoutBatch(week: string): PayoutBatch {
  const rows = [
    { farmer_id: "f1", farmer_name: "Ramesh Varma", upi_id: "ramesh.varma@upi", gross_amount: 182000, commission_deducted: 18200, net_amount: 163800, status: "pending" as const },
    { farmer_id: "f4", farmer_name: "Lakshmi Devi", upi_id: "lakshmi.devi@upi", gross_amount: 45000, commission_deducted: 4500, net_amount: 40500, status: "pending" as const },
  ];
  return { week_of: week, rows, total_net: rows.reduce((s, r) => s + r.net_amount, 0) };
}
