CREATE OR REPLACE FUNCTION public.generate_payout(
  p_order_id UUID,
  p_commission_rate NUMERIC DEFAULT 0.05 -- 5% commission included to make the logic future-ready
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_status TEXT;
  v_farmer_record RECORD;
  v_settlement_amount NUMERIC;
BEGIN
  -- Verify the order exists
  SELECT status INTO v_order_status
  FROM public.orders
  WHERE id = p_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order % not found', p_order_id;
  END IF;

  -- Ensure we don't generate payouts for pending or cancelled orders
  IF v_order_status IN ('pending', 'cancelled') THEN
    RAISE EXCEPTION 'Cannot generate payout for order in status %', v_order_status;
  END IF;

  -- An order can contain multiple listings from different farmers.
  -- We group the order items by farmer_id to generate independent payouts.
  FOR v_farmer_record IN
    SELECT 
      l.farmer_id, 
      SUM(oi.quantity_kg * oi.price_per_kg) as gross_total
    FROM public.order_items oi
    JOIN public.listings l ON l.id = oi.listing_id
    WHERE oi.order_id = p_order_id
    GROUP BY l.farmer_id
  LOOP
    -- Calculate net settlement amount (deducting commission)
    v_settlement_amount := v_farmer_record.gross_total * (1 - p_commission_rate);

    -- Insert into payouts table
    INSERT INTO public.payouts (farmer_id, amount, status)
    VALUES (
      v_farmer_record.farmer_id, 
      v_settlement_amount, 
      'pending' -- Payout is pending until actually transferred by Grainline to the farmer's bank account
    );
  END LOOP;
END;
$$;
