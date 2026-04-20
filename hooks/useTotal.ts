import { useCart } from '@/store/cart';

/**
 * @description Count of subtotal and total
 * @returns {total} {subtotal} and {shipping}
 */

export const useTotal = () => {
	const cartItems = useCart(state => state.cartItems);
	const subtotal = Number(
		cartItems.reduce((acc, item) => (acc += item.price * item.quantity), 0).toFixed(2),
	);
	const shipping = 4.99;
	const total = Number(subtotal + shipping).toFixed(2);

	return {
		subtotal, total, shipping, cartItems
	}
}

