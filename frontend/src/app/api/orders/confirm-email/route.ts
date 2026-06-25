import { NextResponse } from 'next/server';
import { createClient } from '@/server/supabase/server';
import { resend } from '@/lib/resend';
import { generateCustomerOrderEmail, generateOperationsOrderEmail } from '@/lib/emails/templates';

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Missing orderId' }, { status: 400 });
    }

    const supabase = createClient();

    // 1. Fetch Order Details
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderErr || !order) {
      console.error('Order query error:', orderErr);
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // 2. Fetch Customer Auth User (for email address)
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      console.error('User auth query error:', userErr);
      return NextResponse.json({ success: false, error: 'Customer session not found' }, { status: 401 });
    }

    // 3. Fetch Customer Profile details
    const { data: customerProfile } = await supabase
      .from('profiles')
      .select('full_name, phone_number')
      .eq('id', order.customer_id)
      .single();

    const customerName = customerProfile?.full_name || 'Customer';
    const customerPhone = customerProfile?.phone_number || order.delivery_address?.phone || '';

    // 4. Fetch Order Items
    const { data: orderItems, error: itemsErr } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (itemsErr || !orderItems || orderItems.length === 0) {
      console.error('Order items query error:', itemsErr);
      return NextResponse.json({ success: false, error: 'Order items not found' }, { status: 404 });
    }

    // 5. Fetch Farmer & Village Location Details
    let farmerState = 'India';
    let farmerDistrict = 'India';
    let farmerVillageName = orderItems[0].village_name || 'Village';
    const farmerName = orderItems[0].farmer_name || 'Farmer';

    if (orderItems[0].farmer_id) {
      const { data: farmer } = await supabase
        .from('farmers')
        .select('village_id')
        .eq('id', orderItems[0].farmer_id)
        .single();

      if (farmer?.village_id) {
        const { data: village } = await supabase
          .from('villages')
          .select('name, state, district')
          .eq('id', farmer.village_id)
          .single();

        if (village) {
          farmerState = village.state;
          farmerDistrict = village.district;
          farmerVillageName = village.name;
        }
      }
    }

    // Format fields for the email template
    const orderDateFormatted = new Date(order.created_at).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const deliveryDateFormatted = new Date(order.delivery_date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const addressObj = order.delivery_address as any;
    const formattedAddress = addressObj
      ? `${addressObj.line1}${addressObj.line2 ? ', ' + addressObj.line2 : ''}\n${addressObj.city} - ${addressObj.pincode}`
      : 'Farm Pickup';

    const productInfo = orderItems.map((item) => ({
      varietyName: item.variety,
      quantityKg: Number(item.pack_kg || 0) * Number(item.qty || 0),
      pricePerKg: Number(order.total_amount) / Number(item.pack_kg || 0) * Number(item.qty || 1), // Fallback math, or use DB stored price
      subtotal: Number(item.subtotal_paise || 0) / 100,
    }));

    // Standardize pricePerKg from subtotal
    productInfo.forEach((item, index) => {
      const dbItem = orderItems[index];
      const quantity = Number(dbItem.pack_kg || 0) * Number(dbItem.qty || 0);
      item.pricePerKg = quantity > 0 ? (Number(dbItem.subtotal_paise || 0) / 100) / quantity : 0;
    });

    const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@grainline.in';
    const supportPhone = process.env.NEXT_PUBLIC_SUPPORT_PHONE || '+919999999999';

    // 6. Generate Emails HTML
    const customerEmailHtml = generateCustomerOrderEmail({
      orderNumber: order.order_number,
      orderDate: orderDateFormatted,
      deliveryDate: deliveryDateFormatted,
      paymentStatus: order.payment_status,
      paymentMethod: order.payment_method,
      farmerInfo: {
        name: farmerName,
        state: farmerState,
        district: farmerDistrict,
        village: farmerVillageName,
      },
      productInfo,
      deliveryAddress: formattedAddress,
      supportEmail,
      supportPhone,
    });

    const operationsEmailHtml = generateOperationsOrderEmail({
      orderNumber: order.order_number,
      orderDate: orderDateFormatted,
      deliveryDate: deliveryDateFormatted,
      customerInfo: {
        name: customerName,
        email: user.email || null,
        phone: customerPhone,
      },
      farmerInfo: {
        name: farmerName,
        state: farmerState,
        district: farmerDistrict,
        village: farmerVillageName,
      },
      productInfo,
      deliveryAddress: formattedAddress,
    });

    // 7. Send Customer Email
    let customerEmailRes = null;
    if (user.email) {
      customerEmailRes = await resend.emails.send({
        from: 'Grainline Orders <onboarding@resend.dev>', // Or custom domain in prod
        to: user.email,
        subject: `Order Confirmed: ${order.order_number} - Grainline`,
        html: customerEmailHtml,
      });
    }

    // 8. Send Operations Email (to grainline19@gmail.com as specified)
    const operationsEmailRes = await resend.emails.send({
      from: 'Grainline Alerts <onboarding@resend.dev>',
      to: 'grainline19@gmail.com', // fallback as per instructions
      subject: `[Logistics Alert] New Order ${order.order_number} placed by ${customerName}`,
      html: operationsEmailHtml,
    });

    return NextResponse.json({
      success: true,
      customerEmail: customerEmailRes,
      operationsEmail: operationsEmailRes,
    });
  } catch (err: any) {
    console.error('Error sending order emails:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
