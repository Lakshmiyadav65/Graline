import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const RAZORPAY_WEBHOOK_SECRET = Deno.env.get('RAZORPAY_WEBHOOK_SECRET') || '';

async function verifyRazorpaySignature(bodyText: string, signature: string, secret: string) {
  const enc = new TextEncoder();
  const algorithm = { name: "HMAC", hash: "SHA-256" };
  
  const key = await crypto.subtle.importKey(
    "raw", 
    enc.encode(secret), 
    algorithm, 
    false, 
    ["sign"]
  );
  
  const signatureBytes = await crypto.subtle.sign(
    algorithm.name, 
    key, 
    enc.encode(bodyText)
  );
  
  const hashArray = Array.from(new Uint8Array(signatureBytes));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex === signature;
}

serve(async (req) => {
  try {
    // 1. Extract signature header
    const signatureHeader = req.headers.get('x-razorpay-signature');
    if (!signatureHeader) {
      return new Response("Missing signature", { status: 400 });
    }

    // 2. Get raw body string for verification
    const rawBody = await req.text();

    // 3. Verify authenticity
    const isValid = await verifyRazorpaySignature(rawBody, signatureHeader, RAZORPAY_WEBHOOK_SECRET);
    if (!isValid) {
      console.error("Invalid Razorpay webhook signature");
      return new Response("Invalid signature", { status: 403 });
    }

    // 4. Parse the verified payload
    const payload = JSON.parse(rawBody);

    // 5. Initialize Supabase Admin Client to bypass RLS securely
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 6. Handle the event
    // Razorpay puts the custom receipt/order ID usually in the payload (e.g. notes.order_id)
    if (payload.event === 'payment.captured') {
      const paymentEntity = payload.payload.payment.entity;
      const orderId = paymentEntity.notes?.order_id;
      const razorpayPaymentId = paymentEntity.id;

      if (!orderId) {
         return new Response("Missing order_id in notes", { status: 400 });
      }

      // 7. Update the order status to paid
      const { error } = await supabaseAdmin
        .from('orders')
        .update({ 
          status: 'paid', 
          payment_id: razorpayPaymentId,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('status', 'pending'); // Only update if currently pending to prevent double-processing

      if (error) {
        console.error("Failed to update order in DB:", error);
        return new Response("Database Error", { status: 500 });
      }

      console.log(`Successfully verified and marked order ${orderId} as paid.`);
    }

    return new Response(JSON.stringify({ status: "ok" }), { 
      headers: { "Content-Type": "application/json" } 
    });
    
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
});
