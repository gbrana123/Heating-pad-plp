import { formatNpr, product } from "@/lib/product";
import type { SavedOrder } from "@/lib/order-schema";

const escapeHtml = (value: string) =>
  value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };
    return entities[character];
  });

const row = (label: string, value: string, strong = false) => `
  <tr>
    <td style="padding:10px 0;color:#786b64;font-size:14px;border-bottom:1px solid #eee7e2;">${label}</td>
    <td style="padding:10px 0;color:#241b18;font-size:14px;text-align:right;border-bottom:1px solid #eee7e2;${strong ? "font-weight:700;" : ""}">${value}</td>
  </tr>`;

const shell = (brand: string, preheader: string, title: string, body: string) => `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f6f2ee;font-family:Arial,Helvetica,sans-serif;color:#241b18;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f2ee;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #eadfd8;box-shadow:0 12px 36px rgba(75,43,35,.08);">
        <tr><td style="background:#8f1d2c;padding:25px 32px;color:#fff;font-size:24px;font-weight:800;letter-spacing:-.4px;">${brand}</td></tr>
        <tr><td style="padding:34px 32px 12px;">
          <div style="display:inline-block;background:#fff0e7;color:#8f1d2c;padding:7px 11px;border-radius:99px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;">Cash on Delivery</div>
          <h1 style="margin:16px 0 8px;font-size:28px;line-height:1.2;">${title}</h1>
        </td></tr>
        ${body}
        <tr><td style="padding:24px 32px;background:#2a211e;color:#d9cec8;font-size:12px;line-height:1.6;text-align:center;">© ${new Date().getFullYear()} ${brand}. This is an automated order message.</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

export function businessOrderEmail(order: SavedOrder, brand: string) {
  const body = `
    <tr><td style="padding:4px 32px 32px;">
      <p style="margin:0 0 22px;color:#675b55;font-size:15px;line-height:1.7;">A new order has been submitted through your website.</p>
      <div style="background:#faf7f4;border:1px solid #eee4dd;border-radius:14px;padding:20px;margin-bottom:20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          ${row("Order ID", escapeHtml(order.orderId), true)}
          ${row("Date & time", escapeHtml(order.dateTime))}
          ${row("Status", '<span style="background:#fff0cf;color:#7a4b00;padding:5px 9px;border-radius:99px;font-weight:700;">New Order</span>')}
        </table>
      </div>
      <h2 style="font-size:17px;margin:24px 0 8px;">Customer details</h2>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        ${row("Name", escapeHtml(order.fullName))}
        ${row("Phone", escapeHtml(order.phone))}
        ${row("Email", escapeHtml(order.email))}
        ${row("Exact location", escapeHtml(order.location))}
      </table>
      <h2 style="font-size:17px;margin:26px 0 8px;">Product & payment</h2>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        ${row("Product", escapeHtml(order.productName))}
        ${row("Quantity", String(order.quantity))}
        ${row("Price per piece", formatNpr(order.pricePerPiece))}
        ${row("Delivery fee", formatNpr(order.deliveryFee))}
        ${row("Total", formatNpr(order.totalPrice), true)}
        ${row("Payment", order.paymentMethod)}
      </table>
      <div style="margin-top:24px;background:#fff2e7;border-left:4px solid #e56732;padding:16px 18px;border-radius:8px;color:#572c1d;font-size:14px;line-height:1.6;font-weight:700;">Please call the customer soon to confirm this order.</div>
    </td></tr>`;

  return shell(brand, `New order ${order.orderId}`, "New product order received", body);
}

export function customerOrderEmail(order: SavedOrder, brand: string, supportEmail: string) {
  const body = `
    <tr><td style="padding:4px 32px 32px;">
      <p style="margin:0 0 10px;color:#342925;font-size:16px;line-height:1.7;">Hi ${escapeHtml(order.fullName)},</p>
      <p style="margin:0 0 22px;color:#675b55;font-size:15px;line-height:1.7;">Thank you for your order. We have received it successfully and will contact you shortly.</p>
      <div style="background:#faf7f4;border:1px solid #eee4dd;border-radius:14px;padding:20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          ${row("Order ID", escapeHtml(order.orderId), true)}
          ${row("Product", escapeHtml(order.productName))}
          ${row("Quantity", String(order.quantity))}
          ${row("Delivery fee", formatNpr(order.deliveryFee))}
          ${row("Total price", formatNpr(order.totalPrice), true)}
          ${row("Payment method", "Cash On Delivery")}
        </table>
      </div>
      <div style="margin-top:22px;background:#f1f7f2;border:1px solid #d5e6d8;padding:17px;border-radius:12px;color:#285833;font-size:14px;line-height:1.65;">Our sales representative will call you soon to confirm your order.</div>
      <p style="margin:24px 0 0;color:#675b55;font-size:14px;line-height:1.7;">Questions? Reply to this email or contact <a href="mailto:${escapeHtml(supportEmail)}" style="color:#8f1d2c;">${escapeHtml(supportEmail)}</a>.</p>
      <p style="margin:18px 0 0;color:#342925;font-size:14px;line-height:1.7;">Warmly,<br><strong>${escapeHtml(brand || product.storeName)}</strong></p>
    </td></tr>`;

  return shell(brand, `Your ${brand} order has been received`, "Thank you for your order!", body);
}
