import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

import { stripe } from '@/lib/stripe'

import { products } from '@/lib/products'

export interface CheckoutItem {
	id: number;
	quantity: number;
}

export async function POST(req: NextRequest) {
	try {
		const headersList = await headers()
		const origin = headersList.get('origin')
		const data = await req.json()

		if (!origin) {
			throw new Error('URL (origin) not found')
		}

		if (!Array.isArray(data) || !data.length) {
			throw new Error('Array is empty')
		}

		const line_items = data.map((item: CheckoutItem) => {
			const product = products.find(product => product.id === item.id)

			if (!product) {
				throw new Error('Product not found')
			}

			return {
				price_data: {
					currency: 'usd',
					unit_amount: Math.round(product.price * 100),
					product_data: {
						name: product.title,
					},
				},
				quantity: item.quantity
			}
		})

		line_items.push({
			price_data: {
				currency: 'usd',
				unit_amount: 499,
				product_data: {
					name: 'Delivery',
				},
			},
			quantity: 1
		})

		const session = await stripe.checkout.sessions.create({
			line_items,
			mode: 'payment',
			success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${origin}/checkout`,
			metadata: {
				data: JSON.stringify(data),
			},
		});

		return NextResponse.json({ url: session.url })
	} catch (err: unknown) {
		let message = '';
		if (err instanceof Error) {
			message = err.message;
		} else {
			message = 'Something went wrong!'
		}
		return NextResponse.json({ error: message }, { status: 500 })
	}
}