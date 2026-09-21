import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '@/app/api/webhook/route';
import { purchasedItem } from '../helpers';

const mocks = vi.hoisted(() => ({ verify: vi.fn(), retrieve: vi.fn(), findOrder: vi.fn(), upsert: vi.fn(), items: vi.fn(), email: vi.fn() }));
vi.mock('@/lib/stripe', () => ({ stripe: { webhooks: { constructEvent: mocks.verify }, checkout: { sessions: { retrieve: mocks.retrieve } } } }));
vi.mock('@/lib/prisma', () => ({ default: { order: { findUnique: mocks.findOrder, upsert: mocks.upsert } } }));
vi.mock('@/lib/stripe-order', () => ({ getPurchasedItems: mocks.items }));
vi.mock('@/lib/order-email', () => ({ sendOrderEmail: mocks.email }));
const session = { id: 'cs_test', payment_status: 'paid', metadata: { userId: '7' }, amount_total: 2967, customer_details: { email: 'buyer@example.com' } };
const request = (signed = true) => new NextRequest('https://shop.example/api/webhook', {
  method: 'POST', body: '{}', headers: signed ? { 'stripe-signature': 'test-signature' } : {},
});
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'unit-test-secret');
  mocks.verify.mockReturnValue({ type: 'checkout.session.completed', data: { object: { id: session.id } } });
  mocks.retrieve.mockResolvedValue(session);
  mocks.findOrder.mockResolvedValue(null);
  mocks.items.mockResolvedValue({ items: [purchasedItem], shipping: 4.99 });
  mocks.upsert.mockResolvedValue({ stripeSessionId: session.id, customerEmail: 'buyer@example.com', total: 29.67 });
});

describe('Stripe webhook', () => {
  it('rejects missing signatures before using Stripe or the database', async () => {
    expect((await POST(request(false))).status).toBe(400);
    expect(mocks.verify).not.toHaveBeenCalled();
    expect(mocks.upsert).not.toHaveBeenCalled();
  });
  it('rejects invalid signatures', async () => {
    mocks.verify.mockImplementation(() => { throw new Error('Invalid signature'); });
    expect((await POST(request())).status).toBe(400);
    expect(mocks.retrieve).not.toHaveBeenCalled();
  });
  it('fails closed when the webhook secret is missing', async () => {
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', '');
    expect((await POST(request())).status).toBe(500);
    expect(mocks.verify).not.toHaveBeenCalled();
  });
  it('acknowledges unrelated events without creating orders', async () => {
    mocks.verify.mockReturnValue({ type: 'customer.created' });
    expect((await POST(request())).status).toBe(200);
    expect(mocks.retrieve).not.toHaveBeenCalled();
  });
  it('waits for payment before fulfilling the checkout', async () => {
    mocks.retrieve.mockResolvedValue({ ...session, payment_status: 'unpaid' });
    expect((await POST(request())).status).toBe(200);
    expect(mocks.upsert).not.toHaveBeenCalled();
    expect(mocks.email).not.toHaveBeenCalled();
  });
  it.each(['checkout.session.completed', 'checkout.session.async_payment_succeeded'])('saves snapshots for %s and sends confirmation', async type => {
    mocks.verify.mockReturnValue({ type, data: { object: { id: session.id } } });
    expect((await POST(request())).status).toBe(200);
    expect(mocks.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { stripeSessionId: session.id },
      create: expect.objectContaining({ total: 29.67, userId: 7, status: 'paid', items: { create: [{
        title: purchasedItem.title, image: purchasedItem.image, price: 12.34, quantity: 2,
      }] } }),
    }));
    expect(mocks.email).toHaveBeenCalledOnce();
  });
  it('does not recreate an order or resend email on duplicate delivery', async () => {
    mocks.findOrder.mockResolvedValue({ status: 'paid' });
    expect((await POST(request())).status).toBe(200);
    expect(mocks.upsert).not.toHaveBeenCalled();
    expect(mocks.email).not.toHaveBeenCalled();
  });
  it('returns 500 on persistence failure to allow Stripe to retry', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.upsert.mockRejectedValue(new Error('Database unavailable'));
    expect((await POST(request())).status).toBe(500);
    expect(mocks.email).not.toHaveBeenCalled();
  });
  it('keeps a saved order when sending email fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mocks.email.mockRejectedValue(new Error('Email unavailable'));
    expect((await POST(request())).status).toBe(200);
    expect(mocks.upsert).toHaveBeenCalledOnce();
  });
});
