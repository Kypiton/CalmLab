import { stripe } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { CheckoutItem } from '../checkout_sessions/route';
import prisma from '@/lib/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
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

						const items = await Promise.all(metadata.map(async (item: CheckoutItem) => {
							const product = await prisma.product.findUnique({
								where: {
									id: item.id
								}
							})

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
						}))

						if (!sessionObject.metadata?.userId) {
							throw new Error('User id not found');
						}

						const userId = Number(sessionObject.metadata.userId);

						const customerEmail = sessionObject.customer_details?.email;

						if (Number.isNaN(userId)) {
							throw new Error('Invalid user id');
						}

						const order = {
							stripeSessionId: sessionObject.id,
							customerEmail: customerEmail || '',
							total: sessionObject.amount_total! / 100,
							status: sessionObject.payment_status,
							userId,
							items: {
								create: items.map(item => ({
									productId: item.id,
									title: item.title,
									image: item.image,
									price: item.price,
									quantity: item.quantity,
								})),
							},
						};

						try {
							const foundOrder = await prisma.order.findUnique({
								where: {
									stripeSessionId: sessionObject.id,
								},
							});

							const user = await prisma.user.findUnique({
								where: { id: userId },
							});

							if (!foundOrder) {
								await prisma.order.create({
									data: order
								});

								if (!customerEmail) {
									throw new Error('Customer email not found');
								}

								try {
									// const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
									const getImageUrl = (image: string) => {
										const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

										let fixedImage = image.trim();

										fixedImage = fixedImage.replace(/^https\/\//, 'https://');
										fixedImage = fixedImage.replace(/^http\/\//, 'http://');

										if (fixedImage.startsWith('http://') || fixedImage.startsWith('https://')) {
											return fixedImage;
										}

										return `${baseUrl}${fixedImage.startsWith('/') ? fixedImage : `/${fixedImage}`}`;
									};
									const itemsHtml = items
										.map(
											item => `
													<tr>
														<td style="padding: 8px;">
															<img
																src="${getImageUrl(item.image)}" 
																width="50" 
																height="50" 
																style="border-radius: 8px; object-fit: cover;"
															/>
														</td>
														<td style="padding: 8px;">${item.title}</td>
														<td style="padding: 8px;">${item.quantity}</td>
														<td style="padding: 8px;">$${item.price}</td>
														<td style="padding: 8px;">$${(item.price * item.quantity).toFixed(2)}</td>
													</tr>
													`,
										)
										.join('');

									const { data, error } = await resend.emails.send({
										from: 'CalmLab <onboarding@resend.dev>',
										to: [customerEmail],
										subject: 'Your CalmLab order is confirmed!',
										html: `
												<div>
													<h1>Thank you for your order, ${user?.firstName} ${user?.lastName}!</h1>
													<p>Your CalmLab order has been successfully confirmed!</p>
													<p><strong>Order ID:</strong> ${order.stripeSessionId}</p>
													<p><strong>Email:</strong> ${customerEmail}</p>
													<table style="border-collapse: collapse; width: 100%;">
														<thead>
															<tr>
																<th style="border-bottom: 2px solid #ddd; padding: 8px;">Image</th>
																<th style="border-bottom: 2px solid #ddd; text-align: left; padding: 8px;">Product</th>
																<th style="border-bottom: 2px solid #ddd; padding: 8px;">Qty</th>
																<th style="border-bottom: 2px solid #ddd; padding: 8px;">Price</th>
																<th style="border-bottom: 2px solid #ddd; padding: 8px;">Total</th>
															</tr>
														</thead>
														<tbody>
															${itemsHtml}
														</tbody>
													</table>
													<p style="font-size: 18px; font-weight: bold;">
														Total paid: $${order.total}
													</p>
													<p>We are preparing your vitamins and supplements!</p>
													<p>If you have any questions, reply to this email.</p>
												</div>
											`,
									});

									console.log('RESEND DATA: ', data);
									console.log('RESEND ERROR: ', error);
								} catch (error) {
									console.error('Email sending failed:', error);
								}
							}

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
