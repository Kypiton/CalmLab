import { describe, expect, it } from 'vitest';
import { isCheckoutCart } from '@/lib/checkout';

describe('checkout cart validation', () => {
  it('accepts a cart with positive integer product IDs and quantities', () => {
    expect(isCheckoutCart([{ id: 1, quantity: 1 }, { id: 2, quantity: 999 }])).toBe(true);
  });
  it.each([
    null, undefined, {}, [], [null], [{ id: 1 }], [{ quantity: 1 }],
    [{ id: '1', quantity: 1 }], [{ id: 0, quantity: 1 }], [{ id: -1, quantity: 1 }],
    [{ id: 1.5, quantity: 1 }], [{ id: 1, quantity: '1' }], [{ id: 1, quantity: 0 }],
    [{ id: 1, quantity: -1 }], [{ id: 1, quantity: 1.5 }], [{ id: 1, quantity: 1000 }],
    [{ id: Number.MAX_SAFE_INTEGER + 1, quantity: 1 }],
    [{ id: 1, quantity: NaN }], [{ id: 1, quantity: Infinity }],
    [{ id: 1, quantity: 1 }, { id: 1, quantity: 2 }],
  ].map(data => [data]))('rejects invalid cart %j', data => {
    expect(isCheckoutCart(data)).toBe(false);
  });
  it('allows 99 distinct products but rejects 100', () => {
    const cart = Array.from({ length: 100 }, (_, i) => ({ id: i + 1, quantity: 1 }));
    expect(isCheckoutCart(cart.slice(0, 99))).toBe(true);
    expect(isCheckoutCart(cart)).toBe(false);
  });
});
