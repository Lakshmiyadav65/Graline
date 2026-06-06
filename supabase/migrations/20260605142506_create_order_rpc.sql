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
  -- Insert the order first (we will update the total_amount at the end)
  INSERT INTO public.orders (customer_id, total_amount, shipping_address, status)
  VALUES (p_customer_id, 0, p_shipping_address, 'pending')
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

    -- Calculate item cost
    v_item_price := v_listing.price_per_kg * (v_item->>'quantity_kg')::NUMERIC;
    v_total_amount := v_total_amount + v_item_price;

    -- Insert order item
    INSERT INTO public.order_items (order_id, listing_id, quantity_kg, price_per_kg)
    VALUES (
      v_order_id, 
      v_listing.id, 
      (v_item->>'quantity_kg')::NUMERIC, 
      v_listing.price_per_kg
    );
  END LOOP;

  -- Update order with final total amount
  UPDATE public.orders
  SET total_amount = v_total_amount
  WHERE id = v_order_id;

  RETURN v_order_id;
END;
$$;
