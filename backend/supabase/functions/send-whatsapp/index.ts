import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const WHATSAPP_API_TOKEN = Deno.env.get('WHATSAPP_API_TOKEN') || '';
const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID') || '';

interface WebhookPayload {
  phone_number: string;
  template_name: string; // e.g., 'order_confirmed', 'order_shipped', 'payout_processed'
  language_code?: string; // e.g., 'en', 'te', 'hi', 'ta'
  parameters?: string[]; // Variable insertions for the template
}

serve(async (req) => {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    // Require authorization to invoke this function (e.g., from other backend services)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401 });
    }

    const payload: WebhookPayload = await req.json();

    if (!payload.phone_number || !payload.template_name) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    // Fallback to English if no language provided
    const languageCode = payload.language_code || 'en';
    
    // Construct the WhatsApp Graph API template payload
    const whatsappPayload = {
      messaging_product: "whatsapp",
      to: payload.phone_number,
      type: "template",
      template: {
        name: payload.template_name,
        language: {
          code: languageCode
        },
        // Map our simple string parameters to WhatsApp's expected component structure
        components: [
          {
            type: "body",
            parameters: (payload.parameters || []).map(param => ({
              type: "text",
              text: param
            }))
          }
        ]
      }
    };

    // Send request to Meta Graph API
    const response = await fetch(`https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(whatsappPayload)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("WhatsApp API Error:", result);
      return new Response(JSON.stringify({ error: result }), { status: 502, headers: { "Content-Type": "application/json" } });
    }

    console.log(`Successfully sent WhatsApp template '${payload.template_name}' to ${payload.phone_number}`);
    
    return new Response(JSON.stringify({ success: true, message_id: result.messages?.[0]?.id }), { 
      headers: { "Content-Type": "application/json" } 
    });
    
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
});
