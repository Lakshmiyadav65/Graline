-- Farmers need to read order_items for their own orders (via farmer_id column added in schema extension)
CREATE POLICY "Farmers can read own order items" ON public.order_items FOR SELECT USING (
  auth.uid() = farmer_id
);

-- The create_order RPC runs with SECURITY DEFINER so it bypasses RLS for INSERT/UPDATE on order_items.
-- But the frontend supabase.ts client updates order_items directly after order creation.
-- We need to allow customers to update order_items for their own orders:
CREATE POLICY "Customers can update own order items" ON public.order_items FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND customer_id = auth.uid())
);
