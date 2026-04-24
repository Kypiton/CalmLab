import { stripe } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { products } from '@/lib/products';
import { CheckoutItem } from '../checkout_sessions/route';
import { Order } from '@/types/order';

const fs = require('fs');

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
	try {
		let event: Stripe.Event;
		const rawBody = await request.text()

		if (endpointSecret) {
			const signature = request.headers.get('stripe-signature');

			if (signature) {
				try {
					event = stripe.webhooks.constructEvent(
						rawBody,
						signature,
						endpointSecret
					);

					if (event.type === 'checkout.session.completed') {
						const sessionObject = event.data.object;
						let metadata;

						if (!sessionObject.metadata?.data) {
							throw new Error('Metadata not found.')
						}

						if (sessionObject.metadata?.data) {
							metadata = JSON.parse(sessionObject.metadata?.data);
						}

						const items = metadata.map((item: CheckoutItem) => {
							const product = products.find(product => product.id === item.id);

							if (!product) {
								throw new Error('Product not found.')
							}

							return {
								id: product.id,
								title: product.title,
								image: product.image,
								price: product.price,
								quantity: item.quantity
							}
						})

						const order = {
							stripeSessionId: sessionObject.id,
							customerEmail: sessionObject.customer_details?.email,
							total: sessionObject.amount_total! / 100,
							status: sessionObject.payment_status,
							createdAt: new Date(sessionObject.created * 1000).toString().slice(0, 24),
							items
						}

						const pathName = `${process.cwd()}/lib/orders.json`

						try {
							const data = fs.readFileSync(pathName, 'utf8');
							const orders = JSON.parse(data);

							const foundOrder = orders.find((order: Order) => order.stripeSessionId === sessionObject.id);

							if (!foundOrder) {
								orders.push(order);
							}

							const newOrders = JSON.stringify(orders, null, 2);
							fs.writeFileSync(pathName, newOrders);

						} catch (err) {
							console.error(err);
						}
					}
				} catch (err: unknown) {
					if (err instanceof Error) {
						console.log(`⚠️ Webhook signature verification failed.`, err.message);
						return NextResponse.json({ error: 'Event failed.' }, { status: 400 });
					}
				}
			} else {
				return NextResponse.json({ error: 'Signature not found.' }, { status: 500 })
			}
		} else {
			return NextResponse.json({ error: 'EndpointSecret not found.' }, { status: 500 })
		}

		return NextResponse.json({ message: 'Success' }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
	}
}
