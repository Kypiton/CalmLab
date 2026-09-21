import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '@/app/api/checkout_sessions/route';
import { GET } from '@/app/api/orders/route';
import { buyer, jsonRequest } from '../helpers';

const mocks = vi.hoisted(() => ({ user: vi.fn(), products: vi.fn(), createSession: vi.fn(), orders: vi.fn() }));
vi.mock('@/lib/auth', () => ({ getCurrentUser: mocks.user }));
vi.mock('@/lib/prisma', () => ({ default: { product: { findMany: mocks.products }, order: { findMany: mocks.orders } } }));
vi.mock('@/lib/stripe', () => ({ stripe: { checkout: { sessions: { create: mocks.createSession } } } }));
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://shop.example');
  mocks.user.mockResolvedValue(buyer);
});

describe('checkout endpoint', () => {
  it('rejects guests before accessing products or Stripe', async () => {
    mocks.user.mockResolvedValue(null);
    expect((await POST(jsonRequest([{ id: 1, quantity: 1 }]))).status).toBe(401);
    expect(mocks.products).not.toHaveBeenCalled();
    expect(mocks.createSession).not.toHaveBeenCalled();
  });
  it.each([[], [{ id: 1, quantity: 0 }], [{ id: 1, quantity: 1 }, { id: 1, quantity: 2 }]].map(cart => [cart]))('rejects invalid cart %j', async cart => {
    expect((await POST(jsonRequest(cart))).status).toBe(400);
    expect(mocks.createSession).not.toHaveBeenCalled();
  });
  it('rejects products that no longer exist', async () => {
    mocks.products.mockResolvedValue([]);
    expect((await POST(jsonRequest([{ id: 1, quantity: 1 }]))).status).toBe(400);
    expect(mocks.createSession).not.toHaveBeenCalled();
  });
  it('charges DB prices, snapshots products and ignores client-supplied prices/user IDs', async () => {
    mocks.products.mockResolvedValue([{ id: 1, title: 'Vitamin', price: 12.34, image: '/vitamin.png' }]);
    mocks.createSession.mockResolvedValue({ url: 'https://checkout.stripe.com/example' });
    const response = await POST(jsonRequest([{ id: 1, quantity: 2, price: 0.01, userId: 999 }]));
    expect(await response.json()).toEqual({ url: 'https://checkout.stripe.com/example' });
    expect(mocks.createSession).toHaveBeenCalledWith(expect.objectContaining({
      metadata: { userId: '7' },
      customer_email: buyer.email,
      success_url: 'https://shop.example/success?session_id={CHECKOUT_SESSION_ID}',
      line_items: [
        { price_data: { currency: 'usd', unit_amount: 1234, product_data: { name: 'Vitamin', metadata: { productId: '1', image: '/vitamin.png' } } }, quantity: 2 },
        { price_data: { currency: 'usd', unit_amount: 499, product_data: { name: 'Delivery', metadata: { kind: 'shipping' } } }, quantity: 1 },
      ],
    }));
  });
  it('returns a safe error when Stripe is unavailable', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.products.mockResolvedValue([{ id: 1, title: 'Vitamin', price: 12, image: '/image.png' }]);
    mocks.createSession.mockRejectedValue(new Error('sensitive provider details'));
    const response = await POST(jsonRequest([{ id: 1, quantity: 1 }]));
    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain('sensitive provider details');
    expect(log).toHaveBeenCalled();
  });
});

describe('orders endpoint', () => {
  it('does not query orders for guests', async () => {
    mocks.user.mockResolvedValue(null);
    expect((await GET()).status).toBe(401);
    expect(mocks.orders).not.toHaveBeenCalled();
  });
  it('returns only the authenticated user’s orders without public caching', async () => {
    mocks.orders.mockResolvedValue([{ id: 1 }]);
    const response = await GET();
    expect(await response.json()).toEqual({ orders: [{ id: 1 }] });
    expect(mocks.orders).toHaveBeenCalledWith({ where: { userId: 7 }, include: { items: true }, orderBy: { createdAt: 'desc' } });
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });
});
