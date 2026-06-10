import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID') || '';
const RAZORPAY_SECRET = Deno.env.get('RAZORPAY_SECRET') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const { items, delivery_address, fulfillment_type, payment_method } = await req.json();

    // 1. Call the database RPC to create the order and lock inventory
    const { data: orderId, error: rpcError } = await supabaseClient.rpc('create_order', {
      p_customer_id: user.id,
      p_shipping_address: JSON.stringify(delivery_address),
      p_items: items.map((it: any) => ({ listing_id: it.listing_id, quantity_kg: it.pack_kg * it.qty }))
    });

    if (rpcError) {
      return new Response(JSON.stringify({ error: rpcError.message }), { status: 400, headers: corsHeaders });
    }

    // 2. Fetch the newly created order total amount to create Razorpay Order
    const { data: orderData, error: fetchError } = await supabaseClient
      .from('orders')
      .select('total_amount')
      .eq('id', orderId)
      .single();
      
    if (fetchError || !orderData) {
      return new Response(JSON.stringify({ error: "Order calculation failed" }), { status: 500, headers: corsHeaders });
    }

    const totalPaise = Math.round(orderData.total_amount);
    let razorpayOrderId = undefined;

    // 3. Create Razorpay order if payment method is not COD
    if (payment_method !== 'cod') {
      const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_SECRET}`)
        },
        body: JSON.stringify({
          amount: totalPaise,
          currency: "INR",
          receipt: orderId
        })
      });
      const rzpData = await rzpRes.json();
      if (!rzpRes.ok) {
        return new Response(JSON.stringify({ error: "Razorpay error", details: rzpData }), { status: 500, headers: corsHeaders });
      }
      razorpayOrderId = rzpData.id;
    }

    // 4. Update the order with order_number, payment method, etc.
    const orderNumber = "GL-" + orderId.substring(0, 6).toUpperCase();
    await supabaseClient.from('orders').update({
      order_number: orderNumber,
      fulfillment_type,
      delivery_address,
      payment_method,
      payment_status: 'pending'
    }).eq('id', orderId);

    return new Response(JSON.stringify({ 
      orderId, 
      orderNumber, 
      amount: totalPaise, 
      payment_method,
      razorpayOrderId,
      razorpayKey: RAZORPAY_KEY_ID
    }), { headers: { "Content-Type": "application/json", ...corsHeaders } });

  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500, headers: corsHeaders });
  }
})
