// =====================================================================
// Grainline API contracts.
// Shared by the mock adapter (lib/api/mock.ts) and the real client (BE track).
// JSON-serializable: Dates are ISO strings, money is integer paise.
// Shapes mirror prisma/schema.prisma (which is fixed).
// =====================================================================

export type ApiErrorCode =
  | "INVALID_INPUT"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "PAYMENT_FAILED"
  | "INTERNAL";

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  field?: string;
}

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };

// ---- Roles & enums (mirror Prisma) ---------------------------------

export type Role = "customer" | "farmer" | "admin";

export type RiceVariety =
  | "sona_masuri" | "bpt_5204" | "basmati" | "jeera_samba"
  | "red_rice" | "brown_rice" | "hand_pounded_sona" | "other";

export type RiceType = "raw" | "boiled" | "brown" | "hand_pounded";
export type HarvestSeason = "kharif" | "rabi";
export type ListingStatus = "draft" | "active" | "paused" | "out_of_stock" | "archived";
export type FulfillmentType = "farm_pickup" | "city_pickup_point" | "home_delivery";
export type PaymentMethod = "upi" | "card" | "cod";
export type PaymentStatus = "pending" | "paid" | "refunded" | "failed";
export type OrderStatus =
  | "placed" | "confirmed" | "milling" | "ready"
  | "picked_up" | "in_transit" | "delivered" | "cancelled" | "disputed";
export type SampleStatus = "paid" | "shipped" | "delivered" | "redeemed";
export type FarmerStatus = "pending" | "active" | "paused" | "suspended";
export type VillageStatus = "pending" | "verified" | "suspended";
export type AdminRole = "super_admin" | "ops" | "field_rep";
export type VisualQuality = "excellent" | "good" | "acceptable" | "reject";
export type RoutePlanStatus = "draft" | "confirmed" | "in_progress" | "completed";
export type PayoutStatus = "pending" | "processing" | "paid" | "failed";

// ---- Shared value objects ------------------------------------------

export interface PackSize {
  kg: number;
  price_per_kg_paise: number;
}

export interface Address {
  label: string;
  line1: string;
  line2?: string;
  city: string;
  pincode: string;
  lat?: number;
  lng?: number;
}

// ---- Catalogue DTOs ------------------------------------------------

export interface VillageMini {
  id: string;
  name: string;
  slug: string;
  district: string;
  state: string;
}

export interface FarmerMini {
  id: string;
  name: string;
  photo_url: string | null;
  land_acres: number | null;
  farming_since_year: number | null;
  village: VillageMini;
}

export interface Listing {
  id: string;
  variety: RiceVariety;
  variety_other: string | null;
  type: RiceType;
  is_organic: boolean;
  organic_certification: string | null;
  available_kg: number;
  price_per_kg: number; // paise
  pack_sizes: PackSize[];
  harvest_year: number | null;
  harvest_season: HarvestSeason | null;
  is_milled: boolean;
  milled_on: string | null;
  photos: string[];
  description: string | null;
  status: ListingStatus;
  created_at: string;
  farmer: FarmerMini;
  /** Retail baseline for the "vs retail" compare line, paise/kg. */
  retail_paise: number;
}

export interface Village extends VillageMini {
  story: string | null;
  photo_url: string | null;
  hub_address: string | null;
  status: VillageStatus;
  farmer_count: number;
  variety_count: number;
  varieties: RiceVariety[];
}

export interface VillageDetail extends Village {
  farmers: FarmerMini[];
  listings: Listing[];
}

export interface MandiCompare {
  variety: RiceVariety;
  mandi_modal_paise: number; // local paddy rate
  retail_modal_paise: number; // branded retail baseline
}

export interface ListingFilters {
  variety?: RiceVariety;
  type?: RiceType;
  organic?: boolean;
  village_id?: string;
  search?: string;
  min_price?: number; // paise
  max_price?: number; // paise
  sort?: "price_asc" | "price_desc" | "newest";
  page?: number;
  pageSize?: number;
}

export interface ListingListResponse {
  listings: Listing[];
  total: number;
}

// ---- Auth ----------------------------------------------------------

export interface SessionUser {
  id: string;
  name: string;
  phone: string;
  role: Role;
}

export interface RequestOtpResponse {
  requestId: string;
  /** Dev convenience only — present in mock/dev, never in prod. */
  devOtp?: string;
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
  requestId: string;
}

export interface VerifyOtpResponse {
  role: Role;
  redirectTo: string;
  user: SessionUser;
}

export interface SessionResponse {
  authenticated: boolean;
  user: SessionUser | null;
}

// ---- Orders & checkout ---------------------------------------------

export interface OrderItemInput {
  listing_id: string;
  pack_kg: number;
  qty: number;
}

export interface CreateOrderRequest {
  items: OrderItemInput[];
  fulfillment_type: FulfillmentType;
  delivery_address?: Address;
  phone?: string;
  payment_method: PaymentMethod;
}

export interface OrderItem {
  listing_id: string;
  farmer_id: string;
  variety: RiceVariety;
  varietyName?: string;
  variety_other?: string | null;
  pack_kg: number;
  qty: number;
  price_per_kg_paise: number;
  subtotal_paise: number;
  // denormalized for display
  farmer_name: string;
  village_name: string;
  photo_url: string | null;
}

export interface StatusHistoryEntry {
  status: OrderStatus;
  at: string;
  by: string;
}

export interface Order {
  id: string;
  order_number: string;
  items: OrderItem[];
  fulfillment_type: FulfillmentType;
  delivery_address: Address | null;
  delivery_date: string;
  subtotal: number;
  delivery_fee: number;
  cod_fee: number;
  total: number;
  commission_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  status: OrderStatus;
  status_history: StatusHistoryEntry[];
  placed_at: string;
}

export interface CreateOrderResponse {
  orderId: string;
  orderNumber: string;
  amount: number; // paise
  payment_method: PaymentMethod;
  /** Present for upi/card — drives the Razorpay widget. */
  razorpayOrderId?: string;
  razorpayKey?: string;
}

export interface VerifyPaymentRequest {
  orderId: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// ---- Samples -------------------------------------------------------

export interface CreateSampleRequest {
  listing_id: string;
  address: Address;
}

export interface CreateSampleResponse {
  sampleId: string;
  amount: number; // paise (5000 = ₹50)
  razorpayOrderId?: string;
  razorpayKey?: string;
}

// ---- Customer ------------------------------------------------------

export interface CustomerProfile {
  id: string;
  phone: string;
  name: string;
  email: string | null;
  addresses: Address[];
  default_address_idx: number;
  preferred_language: string | null;
  delivery_address?: Address | null;
}

// ---- Farmer --------------------------------------------------------

export interface FarmerProfile extends FarmerMini {
  phone: string;
  upi_id: string;
  status: FarmerStatus;
  story: string | null;
  total_earned: number;
  total_kg_sold: number;
  total_orders: number;
  preferred_language: string | null;
}

export interface FarmerStats {
  earned_this_week: number; // paise
  kg_sold_this_week: number;
  avg_price_per_kg: number; // paise
  mandi_rate: number; // paise
  stock_remaining_kg: number;
  active_orders: number;
  delta_vs_last_week: number; // paise
}

export interface FarmerOrderRow {
  order_number: string;
  variety: RiceVariety;
  pack_kg: number;
  qty: number;
  customer_label: string;
  pickup_date: string;
  earnings_paise: number;
  status: OrderStatus;
}

export interface WeeklyEarning {
  week: string; // short label e.g. "5 May"
  paise: number;
}

export interface FarmerPayoutRow {
  week: string;
  net_amount: number;
  status: PayoutStatus;
}

export interface FarmerDashboard {
  profile: FarmerProfile;
  stats: FarmerStats;
  incoming_orders: FarmerOrderRow[];
  weekly_earnings: WeeklyEarning[];
  recent_payouts: FarmerPayoutRow[];
}

export interface FarmerEnrollRequest {
  phone: string;
  name: string;
  photo_url?: string;
  village_id?: string;
  village_request?: {
    name: string;
    district: string;
    state: string;
    pincode: string;
    head_name: string;
    head_phone: string;
  };
  land_acres?: number;
  story?: string;
  farming_since_year?: number;
  upi_id: string;
  aadhaar_last4?: string;
  first_listing: ListingInputDTO;
}

export interface ListingInputDTO {
  variety: RiceVariety;
  variety_other?: string;
  type: RiceType;
  is_organic: boolean;
  organic_certification?: string;
  available_kg: number;
  price_per_kg: number; // paise
  pack_sizes: PackSize[];
  harvest_year?: number;
  harvest_season?: HarvestSeason;
  is_milled: boolean;
  milled_on?: string;
  photos: string[];
  description?: string;
}

export type FarmerOrderAction = "pending" | "confirm" | "packed" | "out_for_delivery" | "delivered" | "cancel";

// ---- Admin ---------------------------------------------------------

export interface AdminKpis {
  orders_this_week: number;
  gmv_paise: number;
  active_farmers: number;
  active_customers: number;
  aov_paise: number;
  repeat_rate_pct: number;
  on_time_pct: number;
  qc_reject_pct: number;
}

export interface PendingFarmer {
  id: string;
  name: string;
  phone: string;
  village_name: string;
  land_acres: number | null;
  enrolled_at: string;
}

export interface PendingVillage {
  id: string;
  name: string;
  district: string;
  state: string;
  head_name: string;
  head_phone: string;
  created_at: string;
}

export interface RoutePlanPickup {
  village_id: string;
  village_name: string;
  hub_address: string | null;
  arrival_time: string;
  total_kg: number;
  farmer_orders: {
    farmer_id: string;
    farmer_name: string;
    order_numbers: string[];
    total_kg: number;
    qc_status: VisualQuality | "pending";
  }[];
}

export interface RoutePlanDelivery {
  type: FulfillmentType;
  label: string;
  order_numbers: string[];
  arrival_window: string;
}

export interface RoutePlan {
  id: string;
  week_of: string;
  vehicle: string | null;
  driver_name: string | null;
  driver_phone: string | null;
  status: RoutePlanStatus;
  pickups: RoutePlanPickup[];
  deliveries: RoutePlanDelivery[];
}

export interface QcLogInput {
  route_plan_id: string;
  farmer_id: string;
  order_numbers: string[];
  weight_kg: number;
  moisture_pct?: number;
  broken_grain_pct?: number;
  visual_quality: VisualQuality;
  photos: string[];
  notes?: string;
}

export interface PayoutRow {
  farmer_id: string;
  farmer_name: string;
  upi_id: string;
  gross_amount: number;
  commission_deducted: number;
  net_amount: number;
  status: PayoutStatus;
}

export interface PayoutBatch {
  week_of: string;
  rows: PayoutRow[];
  total_net: number;
}

export interface MandiPriceRow {
  id: string;
  commodity: string;
  market: string;
  state: string;
  modal_price: number; // paise/kg
  date: string;
}

// ---- The Api surface -----------------------------------------------

export interface Api {
  auth: {
    requestOtp(phone: string): Promise<ApiResult<RequestOtpResponse>>;
    verifyOtp(req: VerifyOtpRequest): Promise<ApiResult<VerifyOtpResponse>>;
    session(): Promise<ApiResult<SessionResponse>>;
    logout(): Promise<ApiResult<{ ok: true }>>;
  };
  listings: {
    list(filters?: ListingFilters): Promise<ApiResult<ListingListResponse>>;
    get(id: string): Promise<ApiResult<Listing>>;
    featured(n?: number): Promise<ApiResult<Listing[]>>;
  };
  villages: {
    list(): Promise<ApiResult<Village[]>>;
    get(slug: string): Promise<ApiResult<VillageDetail>>;
  };
  mandi: {
    compare(variety: RiceVariety): Promise<ApiResult<MandiCompare>>;
  };
  orders: {
    create(req: CreateOrderRequest): Promise<ApiResult<CreateOrderResponse>>;
    verifyPayment(req: VerifyPaymentRequest): Promise<ApiResult<{ orderNumber: string }>>;
    list(): Promise<ApiResult<Order[]>>;
    get(orderNumber: string): Promise<ApiResult<Order>>;
  };
  samples: {
    create(req: CreateSampleRequest): Promise<ApiResult<CreateSampleResponse>>;
  };
  customer: {
    profile(): Promise<ApiResult<CustomerProfile>>;
    addAddress(addr: Address): Promise<ApiResult<CustomerProfile>>;
    updateProfile(updates: { full_name?: string; phone_number?: string; preferred_language?: string; delivery_address?: Address }): Promise<ApiResult<CustomerProfile>>;
  };
  farmer: {
    enroll(req: FarmerEnrollRequest): Promise<ApiResult<{ farmerId: string }>>;
    me(): Promise<ApiResult<FarmerDashboard>>;
    listings(): Promise<ApiResult<Listing[]>>;
    createListing(input: ListingInputDTO): Promise<ApiResult<Listing>>;
    updateListing(id: string, input: Partial<ListingInputDTO>): Promise<ApiResult<Listing>>;
    deleteListing(id: string): Promise<ApiResult<{ ok: boolean }>>;
    orderAction(orderNumber: string, action: FarmerOrderAction): Promise<ApiResult<{ status: OrderStatus }>>;
  };
  admin: {
    kpis(): Promise<ApiResult<AdminKpis>>;
    pendingFarmers(): Promise<ApiResult<PendingFarmer[]>>;
    pendingVillages(): Promise<ApiResult<PendingVillage[]>>;
    verifyFarmer(id: string, approve: boolean, reason?: string): Promise<ApiResult<{ status: FarmerStatus }>>;
    verifyVillage(id: string, approve: boolean, reason?: string): Promise<ApiResult<{ status: VillageStatus }>>;
    routePlans(): Promise<ApiResult<RoutePlan[]>>;
    routePlan(week: string): Promise<ApiResult<RoutePlan>>;
    generateRoutePlan(): Promise<ApiResult<RoutePlan>>;
    confirmRoutePlan(week: string): Promise<ApiResult<{ status: RoutePlanStatus }>>;
    logQc(input: QcLogInput): Promise<ApiResult<{ ok: true }>>;
    payoutBatch(week: string): Promise<ApiResult<PayoutBatch>>;
    runPayouts(week: string): Promise<ApiResult<PayoutBatch>>;
    mandiPrices(): Promise<ApiResult<MandiPriceRow[]>>;
    addMandiPrice(row: Omit<MandiPriceRow, "id">): Promise<ApiResult<MandiPriceRow>>;
  };
}
