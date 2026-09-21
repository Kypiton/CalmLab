import { stripe } from '@/lib/stripe';
import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import prisma from '@/lib/prisma';
import { getPurchasedItems } from '@/lib/stripe-order';
import { sendOrderEmail } from '@/lib/order-email';

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get('stripe-signature');
  if (!secret) return NextResponse.json({ error: 'Webhook is not configured.' }, { status: 500 });
  if (!signature) return NextResponse.json({ error: 'Signature required.' }, { status: 400 });
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  }
  if (event.type !== 'checkout.session.completed' && event.type !== 'checkout.session.async_payment_succeeded') {
    return NextResponse.json({ received: true });
  }
  try {
    // Retrieve the current state so an older event cannot downgrade a paid order.
    const session = await stripe.checkout.sessions.retrieve(event.data.object.id);
    if (session.payment_status === 'unpaid') return NextResponse.json({ received: true });
    const userId = Number(session.metadata?.userId);
    if (!Number.isSafeInteger(userId) || userId <= 0 || session.amount_total == null) {
      throw new Error('Missing order details');
    }
    const existing = await prisma.order.findUnique({ where: { stripeSessionId: session.id } });
    if (existing && existing.status !== 'unpaid') return NextResponse.json({ received: true });
    const { items } = await getPurchasedItems(session.id);
    const order = await prisma.order.upsert({
      where: { stripeSessionId: session.id },
      update: { status: session.payment_status },
      create: {
        stripeSessionId: session.id,
        customerEmail: session.customer_details?.email || '',
        total: session.amount_total / 100,
        status: session.payment_status,
        userId,
        // Independent snapshots remain valid even if a catalog product is deleted.
        items: { create: items.map(({ title, image, price, quantity }) => ({ title, image, price, quantity })) },
      },
    });
    // Email is best-effort; a mail outage must not roll back a saved purchase.
    if (order.customerEmail) {
      try {
        await sendOrderEmail(order, items);
      } catch (error) {
        console.error('Email sending failed:', error);
      }
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Order processing failed:', error);
    return NextResponse.json({ error: 'Order processing failed. Retry required.' }, { status: 500 });
  }
}
