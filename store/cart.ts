import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { CartItem } from '../types/cart-item.type'
import { ProductItem } from '@/types/product-item.type';

type Product = Omit<ProductItem, 'description' | 'category' | 'rating'>;

interface Cart {
	cartItems: CartItem[];
	addToCart: (obj: Product) => void;
	incrementQuantity: (id: number) => void;
	decrementQuantity: (id: number) => void;
	removeFromCart: (id: number) => void;
	clearCart: () => void;
}

export const useCart = create<Cart>()(persist((set) => ({
	cartItems: [],
	addToCart: (obj) => set(state => {
		const itemInTheCart = state.cartItems.find(item => item.id === obj.id);

		if (itemInTheCart) {
			return {
				cartItems: state.cartItems.map(item => {
					if (item.id === obj.id) {
						return { ...item, quantity: item.quantity + 1 }
					} return item;
				})
			}
		} else {
			return {
				cartItems: [...state.cartItems, {
					id: obj.id,
					title: obj.title,
					image: obj.image,
					price: obj.price,
					brand: obj.brand,
					quantity: 1
				}]
			}
		}
	}),
	removeFromCart: (id) => set(state => ({
		cartItems: state.cartItems.filter(item => item.id !== id)
	})),
	incrementQuantity: (id) => set(state => {
		return {
			cartItems: state.cartItems.map(item => {
				if (item.id === id) {
					return { ...item, quantity: item.quantity + 1 }
				} return item;
			})
		}
	}),
	decrementQuantity: (id) => set(state => {
		return {
			cartItems: state.cartItems.map(item => {
				if (item.id === id) {
					return { ...item, quantity: item.quantity - 1 }
				} return item;
			})
		}
	}),
	clearCart: () => set(() => ({ cartItems: [] }))
}), {
	name: 'cart-storage',
	storage: createJSONStorage(() => localStorage)
}))