import { beforeEach, expect, it, vi } from 'vitest';
import { sendOrderEmail } from '@/lib/order-email';
import { purchasedItem } from '../helpers';

const send = vi.hoisted(() => vi.fn());
vi.mock('resend', () => ({ Resend: class { emails = { send }; } }));
const order = { stripeSessionId: 'cs_test', customerEmail: 'buyer@example.com', total: 29.67 };
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://shop.example');
  send.mockResolvedValue({ error: null });
});

it('escapes user-controlled HTML and creates absolute image URLs', async () => {
  await sendOrderEmail(order, [{ ...purchasedItem, title: '<script>alert("x")</script>' }]);
  const [payload, options] = send.mock.calls[0];
  expect(payload.to).toEqual([order.customerEmail]);
  expect(payload.html).toContain('https://shop.example/products/vitamin-C.png');
  expect(payload.html).toContain('&lt;script&gt;');
  expect(payload.html).not.toContain('<script>');
  expect(options).toEqual({ idempotencyKey: 'order-confirmation/cs_test' });
});
it('preserves an externally hosted product image', async () => {
  await sendOrderEmail(order, [{ ...purchasedItem, image: 'https://images.example/product.png' }]);
  expect(send.mock.calls[0][0].html).toContain('src="https://images.example/product.png"');
});
it('propagates provider errors to the caller', async () => {
  send.mockResolvedValue({ error: { message: 'Provider unavailable' } });
  await expect(sendOrderEmail(order, [purchasedItem])).rejects.toThrow('Provider unavailable');
});
