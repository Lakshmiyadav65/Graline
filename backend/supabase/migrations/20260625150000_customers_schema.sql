-- Migration: Recreate customers table with UUID primary key referencing profiles.id
-- Plus add UPDATE policies for orders and order_items to allow frontend metadata decoration.

DROP TABLE IF EXISTS public.customers CASCADE;

CREATE TABLE public.customers (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Policies for customers table
CREATE POLICY "Users can read own customer record" ON public.customers FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own customer record" ON public.customers FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can manage customers" ON public.customers USING (public.is_admin());

-- Additional RLS policies for orders table to allow customer-driven updates of checkout metadata
DROP POLICY IF EXISTS "Customers can update own orders" ON public.orders;
CREATE POLICY "Customers can update own orders" ON public.orders FOR UPDATE USING (auth.uid() = customer_id);

-- Additional RLS policies for order_items table to allow customer-driven updates of denormalized item metadata
DROP POLICY IF EXISTS "Customers can update own order items" ON public.order_items;
CREATE POLICY "Customers can update own order items" ON public.order_items FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_id AND customer_id = auth.uid())
);
