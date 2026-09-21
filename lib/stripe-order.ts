import type Stripe from 'stripe';
import { stripe } from './stripe';

export interface PurchasedItem {
  id: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
}

export async function getPurchasedItems(sessionId: string) {
  const items: PurchasedItem[] = [];
  let shipping = 0;
  // Auto-pagination includes every line, not just the first expanded page.
  for await (const line of stripe.checkout.sessions.listLineItems(sessionId, {
    limit: 100, expand: ['data.price.product'],
  })) {
    const product = line.price?.product;
    const snapshot = product && typeof product !== 'string' && !product.deleted
      ? product as Stripe.Product : null;
    if (snapshot?.metadata.kind === 'shipping' ||
        (!snapshot?.metadata.productId && line.description === 'Delivery')) {
      shipping += line.amount_total / 100;
      continue;
    }
    if (!line.quantity || line.price?.unit_amount == null) throw new Error('Invalid purchased item');
    items.push({
      id: line.id,
      title: line.description || snapshot?.name || 'Product',
      image: snapshot?.metadata.image || snapshot?.images[0] || '/og-image.png',
      price: line.price.unit_amount / 100,
      quantity: line.quantity,
    });
  }
  return { items, shipping };
}
