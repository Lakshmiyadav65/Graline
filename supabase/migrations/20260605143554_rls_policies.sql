-- Helper function to efficiently check if the current user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.villages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- PROFILES
-- Customers access their own. Farmer profiles are public so listings can display farmer names.
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Farmer profiles are public" ON public.profiles FOR SELECT USING (role = 'farmer');
CREATE POLICY "Admins can read all profiles" ON public.profiles FOR SELECT USING (public.is_admin());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- VILLAGES
CREATE POLICY "Villages are public" ON public.villages FOR SELECT USING (true);
CREATE POLICY "Admins can manage villages" ON public.villages USING (public.is_admin());

-- FARMERS
-- Farmer records are public so listings can display farm bios.
CREATE POLICY "Farmers are public" ON public.farmers FOR SELECT USING (true);
CREATE POLICY "Farmers can update own record" ON public.farmers FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage farmers" ON public.farmers USING (public.is_admin());

-- LISTINGS
CREATE POLICY "Active listings are public" ON public.listings FOR SELECT USING (is_active = true);
CREATE POLICY "Farmers can read all their own listings" ON public.listings FOR SELECT USING (auth.uid() = farmer_id);
CREATE POLICY "Farmers can manage own listings" ON public.listings FOR INSERT WITH CHECK (auth.uid() = farmer_id);
CREATE POLICY "Farmers can update own listings" ON public.listings FOR UPDATE USING (auth.uid() = farmer_id);
CREATE POLICY "Farmers can delete own listings" ON public.listings FOR DELETE USING (auth.uid() = farmer_id);
CREATE POLICY "Admins can manage listings" ON public.listings USING (public.is_admin());

-- LISTING IMAGES
CREATE POLICY "Listing images are public" ON public.listing_images FOR SELECT USING (true);
CREATE POLICY "Farmers can manage own listing images" ON public.listing_images USING (
  EXISTS (SELECT 1 FROM public.listings WHERE id = listing_id AND farmer_id = auth.uid())
);
CREATE POLICY "Admins can manage listing images" ON public.listing_images USING (public.is_admin());

-- ORDERS
CREATE POLICY "Customers can read own orders" ON public.orders FOR SELECT USING (auth.uid() = customer_id);
-- Insert is primarily handled by the RPC function (SECURITY DEFINER), but we allow it explicitly:
CREATE POLICY "Customers can insert own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Admins can manage orders" ON public.orders USING (public.is_admin());

-- ORDER ITEMS
CREATE POLICY "Customers can read own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND customer_id = auth.uid())
);
CREATE POLICY "Admins can manage order items" ON public.order_items USING (public.is_admin());

-- PAYOUTS
CREATE POLICY "Farmers can read own payouts" ON public.payouts FOR SELECT USING (auth.uid() = farmer_id);
CREATE POLICY "Admins can manage payouts" ON public.payouts USING (public.is_admin());
