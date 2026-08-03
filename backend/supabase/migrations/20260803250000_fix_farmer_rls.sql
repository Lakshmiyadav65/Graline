-- =============================================================================
-- Migration: Fix Farmer Dashboard RLS Policies
-- Fixes Phase 11 (Farmer Dashboard) and Phase 9 (Database Integrity):
--   1. Allows farmers to SELECT order_items that belong to them
--   2. Allows farmers to SELECT orders that contain their order_items
--   3. Allows farmers to SELECT customer profiles for their orders (to see names)
-- =============================================================================

-- ─── 1. Fix order_items policy for farmers ──────────────────────────────────
DROP POLICY IF EXISTS "Farmers can read own order items" ON public.order_items;
CREATE POLICY "Farmers can read own order items" ON public.order_items
FOR SELECT
USING (auth.uid() = farmer_id);

-- ─── 2. Fix orders policy for farmers ────────────────────────────────────────
DROP POLICY IF EXISTS "Farmers can read orders containing their items" ON public.orders;
CREATE POLICY "Farmers can read orders containing their items" ON public.orders
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.order_items
    WHERE order_items.order_id = orders.id 
      AND order_items.farmer_id = auth.uid()
  )
);

-- ─── 3. Fix profiles policy for farmers to see customer names ───────────────
DROP POLICY IF EXISTS "Farmers can read profiles of their customers" ON public.profiles;
CREATE POLICY "Farmers can read profiles of their customers" ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.order_items
    JOIN public.orders ON orders.id = order_items.order_id
    WHERE orders.customer_id = profiles.id
      AND order_items.farmer_id = auth.uid()
  )
);
