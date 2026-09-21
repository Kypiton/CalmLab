// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useCart, type Product } from '@/store/cart';
import { useTotal } from '@/hooks/useTotal';

const product: Product = { id: 1, title: 'Vitamin C', image: '/products/vitamin-C.png', price: 12.34, brand: 'Test' };
beforeEach(() => { useCart.setState({ cartItems: [] }); localStorage.clear(); });
afterEach(cleanup);

describe('cart store', () => {
  it('adds a product and increments its quantity without duplicating the row', () => {
    useCart.getState().addToCart(product);
    useCart.getState().addToCart(product);
    expect(useCart.getState().cartItems).toEqual([{ ...product, quantity: 2 }]);
  });
  it('changes only the selected product quantity', () => {
    useCart.getState().addToCart(product);
    useCart.getState().addToCart({ ...product, id: 2 });
    useCart.getState().incrementQuantity(1);
    expect(useCart.getState().cartItems.map(item => item.quantity)).toEqual([2, 1]);
    useCart.getState().decrementQuantity(1);
    expect(useCart.getState().cartItems.map(item => item.quantity)).toEqual([1, 1]);
  });
  it('never decrements below one', () => {
    useCart.getState().addToCart(product);
    useCart.getState().decrementQuantity(1);
    expect(useCart.getState().cartItems[0].quantity).toBe(1);
  });
  it('does not change the cart for unknown IDs', () => {
    useCart.getState().addToCart(product);
    useCart.getState().incrementQuantity(99);
    useCart.getState().decrementQuantity(99);
    useCart.getState().removeFromCart(99);
    expect(useCart.getState().cartItems).toEqual([{ ...product, quantity: 1 }]);
  });
  it('removes one product and can clear the entire cart', () => {
    useCart.getState().addToCart(product);
    useCart.getState().addToCart({ ...product, id: 2 });
    useCart.getState().removeFromCart(1);
    expect(useCart.getState().cartItems.map(item => item.id)).toEqual([2]);
    useCart.getState().clearCart();
    expect(useCart.getState().cartItems).toEqual([]);
    expect(JSON.parse(localStorage.getItem('cart-storage')!).state.cartItems).toEqual([]);
  });
  it('restores a saved cart from localStorage', async () => {
    localStorage.setItem('cart-storage', JSON.stringify({ state: { cartItems: [{ ...product, quantity: 3 }] }, version: 0 }));
    await useCart.persist.rehydrate();
    expect(useCart.getState().cartItems).toEqual([{ ...product, quantity: 3 }]);
  });
});

describe('useTotal', () => {
  it('updates the total when quantities change and adds shipping once', () => {
    useCart.getState().addToCart(product);
    const { result } = renderHook(() => useTotal());
    expect(result.current).toMatchObject({ subtotal: 12.34, shipping: 4.99, total: '17.33' });
    act(() => useCart.getState().incrementQuantity(1));
    expect(result.current).toMatchObject({ subtotal: 24.68, total: '29.67' });
  });
  it('rounds decimal sums to cents', () => {
    useCart.getState().addToCart({ ...product, price: 0.1 });
    useCart.getState().addToCart({ ...product, id: 2, price: 0.2 });
    const { result } = renderHook(() => useTotal());
    expect(result.current.subtotal).toBe(0.3);
    expect(result.current.total).toBe('5.29');
  });
});
