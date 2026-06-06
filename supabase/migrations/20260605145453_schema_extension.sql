-- Villages Extension
ALTER TABLE public.villages
ADD COLUMN slug TEXT UNIQUE,
ADD COLUMN story TEXT,
ADD COLUMN photo_url TEXT,
ADD COLUMN hub_address TEXT,
ADD COLUMN status TEXT DEFAULT 'pending';

-- Farmers Extension
ALTER TABLE public.farmers
ADD COLUMN photo_url TEXT,
ADD COLUMN farming_since_year INT,
ADD COLUMN upi_id TEXT,
ADD COLUMN story TEXT,
ADD COLUMN status TEXT DEFAULT 'pending',
ADD COLUMN aadhaar_last4 TEXT;

-- Listings Extension
ALTER TABLE public.listings
ADD COLUMN type TEXT,
ADD COLUMN is_organic BOOLEAN DEFAULT false,
ADD COLUMN organic_certification TEXT,
ADD COLUMN harvest_year INT,
ADD COLUMN harvest_season TEXT,
ADD COLUMN is_milled BOOLEAN DEFAULT true,
ADD COLUMN milled_on TIMESTAMPTZ,
ADD COLUMN pack_sizes JSONB DEFAULT '[]'::jsonb,
ADD COLUMN retail_paise NUMERIC;

-- Orders Extension
ALTER TABLE public.orders
ADD COLUMN order_number TEXT UNIQUE,
ADD COLUMN fulfillment_type TEXT,
ADD COLUMN delivery_address JSONB,
ADD COLUMN delivery_date TIMESTAMPTZ,
ADD COLUMN subtotal NUMERIC,
ADD COLUMN delivery_fee NUMERIC,
ADD COLUMN cod_fee NUMERIC,
ADD COLUMN commission_amount NUMERIC,
ADD COLUMN payment_method TEXT,
ADD COLUMN payment_status TEXT DEFAULT 'pending',
ADD COLUMN status_history JSONB DEFAULT '[]'::jsonb;

-- Order Items Extension
ALTER TABLE public.order_items
ADD COLUMN farmer_id UUID REFERENCES public.farmers(id),
ADD COLUMN variety TEXT,
ADD COLUMN pack_kg NUMERIC,
ADD COLUMN qty NUMERIC,
ADD COLUMN subtotal_paise NUMERIC,
ADD COLUMN farmer_name TEXT,
ADD COLUMN village_name TEXT,
ADD COLUMN photo_url TEXT;

-- Samples Table
CREATE TABLE public.samples (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES public.listings(id),
    address JSONB NOT NULL,
    amount NUMERIC NOT NULL,
    razorpay_order_id TEXT,
    razorpay_key TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Mandi Prices Table
CREATE TABLE public.mandi_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    commodity TEXT NOT NULL,
    market TEXT NOT NULL,
    state TEXT NOT NULL,
    modal_price NUMERIC NOT NULL,
    date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Route Plans Table
CREATE TABLE public.route_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_of TEXT NOT NULL,
    vehicle TEXT,
    driver_name TEXT,
    driver_phone TEXT,
    status TEXT DEFAULT 'draft',
    pickups JSONB DEFAULT '[]'::jsonb,
    deliveries JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for new tables
ALTER TABLE public.samples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mandi_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_plans ENABLE ROW LEVEL SECURITY;

-- Policies for Samples (Public insert, admin read)
CREATE POLICY "Anyone can create samples" ON public.samples FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage samples" ON public.samples USING (public.is_admin());

-- Policies for Mandi Prices (Public read, admin write)
CREATE POLICY "Mandi prices are public" ON public.mandi_prices FOR SELECT USING (true);
CREATE POLICY "Admins can manage mandi prices" ON public.mandi_prices USING (public.is_admin());

-- Policies for Route Plans (Admin only)
CREATE POLICY "Admins can manage route plans" ON public.route_plans USING (public.is_admin());

-- Force regeneration of database types (Supabase CLI will do this later, but we note it here)
