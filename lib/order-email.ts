import { Resend } from 'resend';
import type { PurchasedItem } from './stripe-order';

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]!);
}

export async function sendOrderEmail(order: {
  stripeSessionId: string; customerEmail: string; total: number;
}, items: PurchasedItem[]) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const customerEmail = order.customerEmail;
  const getImageUrl = (image: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

    let fixedImage = image.trim();

    fixedImage = fixedImage.replace(/^https\/\//, 'https://');
    fixedImage = fixedImage.replace(/^http\/\//, 'http://');

    if (fixedImage.startsWith('http://') || fixedImage.startsWith('https://')) {
      return fixedImage;
    }

    return `${baseUrl}${fixedImage.startsWith('/') ? fixedImage : `/${fixedImage}`}`;
  };
  const itemsHtml = items
    .map(
      item => `
          <tr>
            <td style="padding: 8px;">
              <img
                src="${escapeHtml(getImageUrl(item.image))}"
                width="50"
                height="50"
                style="border-radius: 8px; object-fit: cover;"
              />
            </td>
            <td style="padding: 8px;">${escapeHtml(item.title)}</td>
            <td style="padding: 8px;">${item.quantity}</td>
            <td style="padding: 8px;">$${item.price}</td>
            <td style="padding: 8px;">$${(item.price * item.quantity).toFixed(2)}</td>
          </tr>
          `,
    )
    .join('');

  const { error } = await resend.emails.send({
    from: 'CalmLab <onboarding@resend.dev>',
    to: [customerEmail],
    subject: 'Your CalmLab order is confirmed!',
    html: `
        <div>
          <h1>Thank you for your order!</h1>
          <p>Your CalmLab order has been successfully confirmed!</p>
          <p><strong>Order ID:</strong> ${escapeHtml(order.stripeSessionId)}</p>
          <p><strong>Email:</strong> ${escapeHtml(customerEmail)}</p>
          <table style="border-collapse: collapse; width: 100%;">
            <thead>
              <tr>
                <th style="border-bottom: 2px solid #ddd; padding: 8px;">Image</th>
                <th style="border-bottom: 2px solid #ddd; text-align: left; padding: 8px;">Product</th>
                <th style="border-bottom: 2px solid #ddd; padding: 8px;">Qty</th>
                <th style="border-bottom: 2px solid #ddd; padding: 8px;">Price</th>
                <th style="border-bottom: 2px solid #ddd; padding: 8px;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <p style="font-size: 18px; font-weight: bold;">
            Total paid: $${order.total}
          </p>
          <p>We are preparing your vitamins and supplements!</p>
          <p>If you have any questions, reply to this email.</p>
        </div>
      `,
  }, { idempotencyKey: `order-confirmation/${order.stripeSessionId}` });
  if (error) throw new Error(error.message);
}
