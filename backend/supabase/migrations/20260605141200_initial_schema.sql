-- Enums
CREATE TYPE user_role AS ENUM ('customer', 'farmer', 'admin');

-- Profiles
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'customer',
    full_name TEXT,
    phone_number TEXT UNIQUE,
    preferred_language TEXT CHECK (preferred_language IN ('English', 'Telugu', 'Hindi', 'Tamil')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Villages
CREATE TABLE villages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    pincode TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Farmers
CREATE TABLE farmers (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    village_id UUID REFERENCES villages(id) ON DELETE SET NULL,
    bio TEXT,
    farm_size_acres NUMERIC,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Listings
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    rice_variety TEXT NOT NULL,
    price_per_kg NUMERIC NOT NULL,
    stock_kg NUMERIC NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Listing Images
CREATE TABLE listing_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    total_amount NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, shipped, delivered, cancelled
    payment_id TEXT,
    shipping_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES listings(id),
    quantity_kg NUMERIC NOT NULL,
    price_per_kg NUMERIC NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payouts
CREATE TABLE payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, processed, failed
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Specific Indexes as requested
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_listings_farmer_id ON listings(farmer_id);
CREATE INDEX idx_payouts_farmer_id ON payouts(farmer_id);
CREATE INDEX idx_listing_images_listing_id ON listing_images(listing_id);
CREATE INDEX idx_order_items_listing_id ON order_items(listing_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

CREATE INDEX idx_profiles_created_at ON profiles(created_at);
CREATE INDEX idx_listings_created_at ON listings(created_at);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_payouts_created_at ON payouts(created_at);
