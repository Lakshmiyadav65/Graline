export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function generateCustomerOrderEmail({
  orderNumber,
  orderDate,
  deliveryDate,
  paymentStatus,
  paymentMethod,
  farmerInfo,
  productInfo,
  deliveryAddress,
  supportEmail,
  supportPhone,
  subtotal,
  deliveryFee,
  codFee,
  total,
}: {
  orderNumber: string;
  orderDate: string;
  deliveryDate: string;
  paymentStatus: string;
  paymentMethod: string;
  farmerInfo: { name: string; state: string; district: string; village: string };
  productInfo: Array<{
    varietyName: string;
    quantityKg: number;
    pricePerKg: number;
    subtotal: number;
  }>;
  deliveryAddress: string;
  supportEmail: string;
  supportPhone: string;
  subtotal: number;
  deliveryFee: number;
  codFee: number;
  total: number;
}): string {
  const itemsHtml = productInfo
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0; font-size: 14px; color: #333;">
        <strong>${item.varietyName}</strong><br/>
        <span style="font-size: 12px; color: #666;">Qty: ${item.quantityKg} kg @ ${formatINR(item.pricePerKg)}/kg</span>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0; font-size: 14px; color: #333; text-align: right; font-family: monospace;">
        ${formatINR(item.subtotal)}
      </td>
    </tr>
  `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - Grainline</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f7f9fa; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }
        .header { background-color: #1b4332; padding: 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 0.05em; }
        .content { padding: 24px; }
        .order-meta { background: #f8f9fa; border-radius: 6px; padding: 16px; margin-bottom: 24px; }
        .order-meta table { width: 100%; border-collapse: collapse; }
        .order-meta td { padding: 4px 0; font-size: 13px; color: #4a5568; }
        .order-meta td.label { font-weight: bold; width: 120px; }
        .section-title { font-size: 16px; font-weight: 700; color: #1b4332; margin-top: 24px; margin-bottom: 12px; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
        .info-card { background: #f8f9fa; padding: 12px; border-radius: 6px; font-size: 13px; color: #4a5568; line-height: 1.5; }
        .info-card h4 { margin: 0 0 6px 0; font-size: 14px; color: #1b4332; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        .total-row td { padding: 16px 0; font-size: 16px; font-weight: bold; color: #1b4332; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #718096; border-top: 1px solid #e2e8f0; }
        .footer a { color: #1b4332; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>GRAINLINE</h1>
          <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">Direct From Farm to Kitchen</p>
        </div>
        <div class="content">
          <p style="font-size: 15px; color: #2d3748; line-height: 1.5; margin-top: 0;">
            Thank you for your order! We are preparing to mill your rice this week and deliver it fresh on Saturday. Here is your order confirmation.
          </p>

          <div class="order-meta">
            <table>
              <tr>
                <td class="label">Order ID:</td>
                <td><strong>${orderNumber}</strong></td>
              </tr>
              <tr>
                <td class="label">Order Date:</td>
                <td>${orderDate}</td>
              </tr>
              <tr>
                <td class="label">Delivery Date:</td>
                <td>${deliveryDate} (Saturday)</td>
              </tr>
              <tr>
                <td class="label">Payment Status:</td>
                <td><span style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold; text-transform: uppercase;">${paymentStatus === 'pending' && paymentMethod === 'cod' ? 'Cash on Delivery' : paymentStatus}</span> (${paymentMethod})</td>
              </tr>
            </table>
          </div>

          <div class="section-title">Logistics & Origins</div>
          <div class="info-grid">
            <div class="info-card">
              <h4>Farmer Info</h4>
              <strong>${farmerInfo.name}</strong><br/>
              Village: ${farmerInfo.village}<br/>
              District: ${farmerInfo.district}<br/>
              State: ${farmerInfo.state}
            </div>
            <div class="info-card">
              <h4>Delivery Address</h4>
              ${deliveryAddress.replace(/\n/g, '<br/>')}
            </div>
          </div>

          <div class="section-title">Order Details</div>
          <table class="items-table">
            <thead>
              <tr style="border-bottom: 2px solid #1b4332;">
                <th style="text-align: left; padding-bottom: 8px; font-size: 14px; color: #1b4332;">Product</th>
                <th style="text-align: right; padding-bottom: 8px; font-size: 14px; color: #1b4332;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; font-size: 14px; color: #666;">Subtotal</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; font-size: 14px; color: #333; text-align: right; font-family: monospace;">${formatINR(subtotal)}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; font-size: 14px; color: #666;">Delivery Charge</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; font-size: 14px; color: #333; text-align: right; font-family: monospace;">${deliveryFee > 0 ? formatINR(deliveryFee) : 'Free'}</td>
              </tr>
              ${codFee > 0 ? `
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; font-size: 14px; color: #666;">COD Handling Fee</td>
                <td style="padding: 10px 0; border-bottom: 1px solid #e0e0e0; font-size: 14px; color: #333; text-align: right; font-family: monospace;">${formatINR(codFee)}</td>
              </tr>
              ` : ''}
              <tr class="total-row">
                <td style="padding: 16px 0; font-size: 16px; font-weight: bold; color: #1b4332;">Total</td>
                <td style="padding: 16px 0; font-size: 16px; font-weight: bold; color: #1b4332; text-align: right; font-family: monospace;">${formatINR(total)}</td>
              </tr>
            </tbody>
          </table>

          <p style="font-size: 13px; color: #718096; line-height: 1.5; text-align: center;">
            Your rice will be milled the week of delivery to preserve maximum freshness. If you have any questions, please contact our support team.
          </p>
        </div>
        <div class="footer">
          <p><strong>Need Help? Contact support</strong></p>
          <p>Email: <a href="mailto:${supportEmail}">${supportEmail}</a> | Phone: <a href="tel:${supportPhone}">${supportPhone}</a></p>
          <p style="margin-top: 15px; font-size: 11px;">&copy; ${new Date().getFullYear()} Grainline. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function generateOperationsOrderEmail({
  orderNumber,
  orderDate,
  deliveryDate,
  customerInfo,
  farmerInfo,
  productInfo,
  deliveryAddress,
  subtotal,
  deliveryFee,
  codFee,
  total,
}: {
  orderNumber: string;
  orderDate: string;
  deliveryDate: string;
  customerInfo: { name: string; email: string | null; phone: string };
  farmerInfo: { name: string; state: string; district: string; village: string };
  productInfo: Array<{
    varietyName: string;
    quantityKg: number;
    pricePerKg: number;
    subtotal: number;
  }>;
  deliveryAddress: string;
  subtotal: number;
  deliveryFee: number;
  codFee: number;
  total: number;
}): string {
  const itemsHtml = productInfo
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px;">
        <strong>${item.varietyName}</strong> · ${item.quantityKg} kg
      </td>
      <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px; text-align: right; font-family: monospace;">
        ${formatINR(item.pricePerKg)}/kg
      </td>
      <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px; text-align: right; font-family: monospace;">
        ${formatINR(item.subtotal)}
      </td>
    </tr>
  `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>[Operations] New Order Notification - ${orderNumber}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; }
        .container { max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #dcdfe4; overflow: hidden; }
        .alert-bar { background-color: #d9381e; color: #ffffff; padding: 12px 20px; font-weight: bold; text-align: center; font-size: 14px; letter-spacing: 0.05em; }
        .content { padding: 24px; }
        .grid { display: table; width: 100%; margin-bottom: 20px; }
        .col { display: table-cell; width: 50%; padding: 10px; background: #f8f9fa; border: 1px solid #e2e8f0; border-radius: 6px; }
        .section-title { font-size: 15px; font-weight: 700; color: #2d3748; margin-top: 20px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
        .info-table { width: 100%; border-collapse: collapse; }
        .info-table td { padding: 8px 10px; font-size: 13px; border-bottom: 1px solid #f0f2f5; }
        .info-table tr:last-child td { border-bottom: none; }
        .bold { font-weight: bold; width: 140px; color: #4a5568; }
        .total-box { font-size: 18px; font-weight: bold; text-align: right; margin-top: 15px; color: #d9381e; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="alert-bar">
          NEW ORDER LOGISTICS ALERT - ${orderNumber}
        </div>
        <div class="content">
          <p style="font-size: 14px; color: #4a5568; margin-top: 0;">
            A new customer order has been placed. Please review the details below and prepare the logistics, milling scheduling, and farmer coordination.
          </p>

          <div class="section-title">Order Summary</div>
          <table class="info-table" style="margin-bottom: 20px; background: #fff8f6; border: 1px solid #fcdad5; border-radius: 6px;">
            <tr>
              <td class="bold">Order Number:</td>
              <td><strong>${orderNumber}</strong></td>
            </tr>
            <tr>
              <td class="bold">Order Date:</td>
              <td>${orderDate}</td>
            </tr>
            <tr>
              <td class="bold">Target Delivery Date:</td>
              <td><strong>${deliveryDate}</strong></td>
            </tr>
          </table>

          <div style="margin-bottom: 24px;">
            <div style="float: left; width: 48%; box-sizing: border-box;">
              <div class="section-title">Customer Details</div>
              <div style="background: #f8f9fa; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; font-size: 13px; height: 120px;">
                <strong>${customerInfo.name}</strong><br/>
                Email: ${customerInfo.email || 'N/A'}<br/>
                Phone: ${customerInfo.phone}<br/>
                <br/>
                <strong>Delivery Address:</strong><br/>
                ${deliveryAddress.replace(/\n/g, '<br/>')}
              </div>
            </div>
            <div style="float: right; width: 48%; box-sizing: border-box;">
              <div class="section-title">Farmer / Origin Details</div>
              <div style="background: #f8f9fa; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; font-size: 13px; height: 120px;">
                <strong>${farmerInfo.name}</strong><br/>
                Village: ${farmerInfo.village}<br/>
                District: ${farmerInfo.district}<br/>
                State: ${farmerInfo.state}
              </div>
            </div>
            <div style="clear: both;"></div>
          </div>

          <div class="section-title">Items to Mill & Fulfill</div>
          <table class="info-table" style="width: 100%; border: 1px solid #e2e8f0;">
            <thead>
              <tr style="background: #e2e8f0;">
                <th style="padding: 8px 10px; text-align: left; font-size: 13px;">Item</th>
                <th style="padding: 8px 10px; text-align: right; font-size: 13px;">Price/Kg</th>
                <th style="padding: 8px 10px; text-align: right; font-size: 13px;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
              <tr>
                <td style="padding: 8px 10px; font-size: 13px; border-bottom: 1px solid #f0f2f5; font-weight: bold;">Subtotal</td>
                <td style="padding: 8px 10px; font-size: 13px; border-bottom: 1px solid #f0f2f5;"></td>
                <td style="padding: 8px 10px; font-size: 13px; border-bottom: 1px solid #f0f2f5; text-align: right; font-family: monospace;">${formatINR(subtotal)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 10px; font-size: 13px; border-bottom: 1px solid #f0f2f5; font-weight: bold;">Delivery Charge</td>
                <td style="padding: 8px 10px; font-size: 13px; border-bottom: 1px solid #f0f2f5;"></td>
                <td style="padding: 8px 10px; font-size: 13px; border-bottom: 1px solid #f0f2f5; text-align: right; font-family: monospace;">${deliveryFee > 0 ? formatINR(deliveryFee) : 'Free'}</td>
              </tr>
              ${codFee > 0 ? `
              <tr>
                <td style="padding: 8px 10px; font-size: 13px; border-bottom: 1px solid #f0f2f5; font-weight: bold;">COD Handling Fee</td>
                <td style="padding: 8px 10px; font-size: 13px; border-bottom: 1px solid #f0f2f5;"></td>
                <td style="padding: 8px 10px; font-size: 13px; border-bottom: 1px solid #f0f2f5; text-align: right; font-family: monospace;">${formatINR(codFee)}</td>
              </tr>
              ` : ''}
            </tbody>
          </table>

          <div class="total-box">
            Total Amount: ${formatINR(total)}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
