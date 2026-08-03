-- =============================================================================
-- Migration: Fix existing orders with wrong status and update create_order RPC
-- Fixes:
--   1. Existing orders with status='pending' → status='placed' (with status_history)
--   2. Updates create_order RPC to set initial status='placed' + populate status_history
-- =============================================================================

-- ─── 1. Fix existing orders: pending → placed ────────────────────────────────
-- Orders that were created but got stuck at 'pending' (the RPC default)
-- should be 'placed' which is the correct initial customer-visible state.
UPDATE public.orders
SET 
  status = 'placed',
  status_history = jsonb_build_array(
    jsonb_build_object(
      'status', 'placed',
      'at', created_at,
      'by', 'system_migration'
    )
  )
WHERE status = 'pending'
  AND order_number IS NOT NULL;  -- Only fix properly created orders (with order_number)

-- ─── 2. Update create_order RPC to set initial status = 'placed' ─────────────
CREATE OR REPLACE FUNCTION public.create_order(
  p_customer_id UUID,
  p_shipping_address TEXT,
  p_items JSONB
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id UUID;
  v_total_amount NUMERIC := 0;
  v_item JSONB;
  v_listing RECORD;
  v_item_price NUMERIC;
BEGIN
  -- Insert the order with initial status='placed' (customer-visible state)
  INSERT INTO public.orders (customer_id, total_amount, shipping_address, status, status_history)
  VALUES (
    p_customer_id, 
    0, 
    p_shipping_address, 
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

  -- Process each item in the JSON array
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Lock the listing row for update to prevent concurrent stock modifications
    SELECT * INTO v_listing 
    FROM public.listings 
    WHERE id = (v_item->>'listing_id')::UUID 
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Listing % not found', v_item->>'listing_id';
    END IF;

    -- Validate stock
    IF v_listing.stock_kg < (v_item->>'quantity_kg')::NUMERIC THEN
      RAISE EXCEPTION 'Insufficient stock for listing %', v_listing.title;
    END IF;

    -- Decrement stock
    UPDATE public.listings
    SET stock_kg = stock_kg - (v_item->>'quantity_kg')::NUMERIC,
        updated_at = NOW()
    WHERE id = v_listing.id;

    -- Calculate item cost (price_per_kg is in RUPEES in DB)
    v_item_price := v_listing.price_per_kg * (v_item->>'quantity_kg')::NUMERIC;
    v_total_amount := v_total_amount + v_item_price;

    -- Insert order item
    INSERT INTO public.order_items (order_id, listing_id, quantity_kg, price_per_kg)
    VALUES (
      v_order_id, 
      v_listing.id, 
      (v_item->>'quantity_kg')::NUMERIC, 
      v_listing.price_per_kg  -- RUPEES
    );
  END LOOP;

  -- Update order with final total amount (in RUPEES, will be updated again by app layer)
  UPDATE public.orders
  SET total_amount = v_total_amount
  WHERE id = v_order_id;

  RETURN v_order_id;
END;
$$;
