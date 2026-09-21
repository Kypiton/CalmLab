import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { isCheckoutCart } from '@/lib/checkout';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Please sign in before paying.' }, { status: 401 });
    const data: unknown = await req.json().catch(() => null);
    if (!isCheckoutCart(data)) {
      return NextResponse.json({ error: 'Invalid cart or quantities.' }, { status: 400 });
    }
    const products = await prisma.product.findMany({ where: { id: { in: data.map(item => item.id) } } });
    if (products.length !== data.length) {
      return NextResponse.json({ error: 'Some products are no longer available.' }, { status: 400 });
    }
    const line_items: NonNullable<NonNullable<Parameters<typeof stripe.checkout.sessions.create>[0]>['line_items']> = data.map(item => {
      const product = products.find(product => product.id === item.id)!;
      return {
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(product.price * 100),
          product_data: {
            name: product.title,
            metadata: { productId: String(product.id), image: product.image },
          },
        },
        quantity: item.quantity,
      };
    });
    line_items.push({
      price_data: {
        currency: 'usd', unit_amount: 499,
        product_data: { name: 'Delivery', metadata: { kind: 'shipping' } },
      },
      quantity: 1,
    });
    const origin = new URL(process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin).origin;
    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: 'payment',
      customer_email: user.email,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
      metadata: { userId: String(user.id) },
    });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout creation failed:', error);
    return NextResponse.json({ error: 'Unable to start payment. Please try again.' }, { status: 500 });
  }
}
