import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getPurchasedItems } from '@/lib/stripe-order';

const listLineItems = vi.hoisted(() => vi.fn());
vi.mock('@/lib/stripe', () => ({ stripe: { checkout: { sessions: { listLineItems } } } }));
beforeEach(() => { vi.resetAllMocks(); });
const line = {
  id: 'li_1', description: 'Original title', quantity: 2, amount_total: 2468,
  price: { unit_amount: 1234, product: { metadata: { productId: '1', image: '/original.png' }, images: [] } },
};
function lines(items: unknown[]) {
  listLineItems.mockImplementation(async function* () { yield* items; });
}

describe('Stripe purchase snapshots', () => {
  it('reads all line items, separates delivery and keeps original names/prices', async () => {
    lines([line, { ...line, id: 'li_2' }, {
      description: 'Delivery', amount_total: 499,
      price: { product: { metadata: { kind: 'shipping' } } },
    }]);
    const result = await getPurchasedItems('cs_test');
    expect(result.shipping).toBe(4.99);
    expect(result.items).toEqual(['li_1', 'li_2'].map(id => ({
      id, title: 'Original title', image: '/original.png', price: 12.34, quantity: 2,
    })));
    expect(listLineItems).toHaveBeenCalledWith('cs_test', { limit: 100, expand: ['data.price.product'] });
  });
  it('supports delivery lines from older checkout sessions', async () => {
    lines([{ description: 'Delivery', amount_total: 499, price: { product: { metadata: {} } } }]);
    expect(await getPurchasedItems('cs_old')).toEqual({ items: [], shipping: 4.99 });
  });
  it('uses a fallback image if the Stripe product has been deleted', async () => {
    lines([{ ...line, price: { unit_amount: 1234, product: { deleted: true } } }]);
    expect((await getPurchasedItems('cs_test')).items[0]).toMatchObject({ image: '/og-image.png', price: 12.34 });
  });
  it('fails rather than saving an invalid quantity', async () => {
    lines([{ ...line, quantity: 0 }]);
    await expect(getPurchasedItems('cs_test')).rejects.toThrow('Invalid purchased item');
  });
});
