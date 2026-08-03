-- =============================================================================
-- Migration: Create atomic, fully-transactional create_order RPC
-- Fixes Phase 10 (Order Creation Flow):
--   1. Ensures all order metadata, order items, stock decrement, and customer checks
--      run in a single atomic database transaction.
--   2. Prevents partial/incomplete orders due to client-side network failures.
--   3. Automatically registers customer record in the customers table if missing.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.create_order_atomic(
  p_customer_id UUID,
  p_order_number TEXT,
  p_fulfillment_type TEXT,
  p_delivery_address JSONB,
  p_payment_method TEXT,
  p_payment_status TEXT,
  p_phone TEXT,
  p_subtotal NUMERIC,      -- In Rupees
  p_delivery_fee NUMERIC,  -- In Rupees
  p_cod_fee NUMERIC,       -- In Rupees
  p_commission NUMERIC,    -- In Rupees
  p_total_amount NUMERIC,  -- In Rupees
  p_delivery_date TIMESTAMPTZ,
  p_items JSONB            -- Array of items containing listing details
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id UUID;
  v_item JSONB;
  v_listing RECORD;
  v_quantity_kg NUMERIC;
BEGIN
  -- 1. Ensure customer record exists in public.customers table
  IF NOT EXISTS (SELECT 1 FROM public.customers WHERE id = p_customer_id) THEN
    INSERT INTO public.customers (id) VALUES (p_customer_id);
  END IF;

  -- 2. Insert the main order record
  INSERT INTO public.orders (
    customer_id, 
    order_number, 
    fulfillment_type, 
    delivery_address, 
    payment_method, 
    payment_status, 
    subtotal, 
    delivery_fee, 
    cod_fee, 
    commission_amount, 
    total_amount, 
    delivery_date, 
    status, 
    status_history
  ) VALUES (
    p_customer_id, 
    p_order_number, 
    p_fulfillment_type, 
    p_delivery_address, 
    p_payment_method, 
    p_payment_status, 
    p_subtotal, 
    p_delivery_fee, 
    p_cod_fee, 
    p_commission, 
    p_total_amount, 
    p_delivery_date, 
    'placed',
    jsonb_build_array(
      jsonb_build_object(
        'status', 'placed',
        'at', NOW()::TEXT,
        'by', 'customer'
      )
    )
  )
  RETURNING id INTO v_order_id;

  -- 3. Process each item in the JSON array
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Calculate total weight for stock deduction
    v_quantity_kg := (v_item->>'pack_kg')::NUMERIC * (v_item->>'qty')::NUMERIC;

    -- Lock listing row for update to prevent concurrent stock modifications
    SELECT * INTO v_listing 
    FROM public.listings 
    WHERE id = (v_item->>'listing_id')::UUID 
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Listing % not found', v_item->>'listing_id';
    END IF;

    -- Validate stock availability
    IF v_listing.stock_kg < v_quantity_kg THEN
      RAISE EXCEPTION 'Insufficient stock for listing %', v_listing.title;
    END IF;

    -- Decrement stock in listings table
    UPDATE public.listings
    SET stock_kg = stock_kg - v_quantity_kg,
        updated_at = NOW()
    WHERE id = v_listing.id;

    -- Insert order item with denormalized fields
    INSERT INTO public.order_items (
      order_id, 
      listing_id, 
      farmer_id, 
      variety, 
      pack_kg, 
      qty, 
      quantity_kg, 
      price_per_kg, 
      subtotal_paise, 
      farmer_name, 
      village_name, 
      photo_url
    ) VALUES (
      v_order_id, 
      (v_item->>'listing_id')::UUID, 
      (v_item->>'farmer_id')::UUID, 
      v_item->>'variety', 
      (v_item->>'pack_kg')::NUMERIC, 
      (v_item->>'qty')::NUMERIC, 
      v_quantity_kg, 
      (v_item->>'price_per_kg')::NUMERIC,      -- Stored in Rupees
      (v_item->>'subtotal_paise')::NUMERIC,    -- Stored in Paise
      v_item->>'farmer_name', 
      v_item->>'village_name', 
      v_item->>'photo_url'
    );
  END LOOP;

  RETURN v_order_id;
END;
$$;
