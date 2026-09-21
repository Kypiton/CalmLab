import { stripe } from '@/lib/stripe';
import { notFound, redirect } from 'next/navigation';
import { ClearCart } from '@/components/shared/ClearCart';
import { SuccessPage } from '@/components/shared/SuccessPage';
import { getCurrentUser } from '@/lib/auth';
import { getPurchasedItems } from '@/lib/stripe-order';

type SuccessPageProps = { searchParams: Promise<{ session_id?: string }> };

export default async function Success({ searchParams }: SuccessPageProps) {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in');
  const { session_id } = await searchParams;
  if (!session_id || typeof session_id !== 'string') notFound();
  const session = await stripe.checkout.sessions.retrieve(session_id).catch(error => {
    if (error.code === 'resource_missing') notFound();
    throw error;
  });
  if (session.metadata?.userId !== String(user.id)) notFound();
  if (session.status !== 'complete') redirect('/checkout');
  if (session.payment_status === 'unpaid') {
    return <p role="status" className="p-8 text-center">Your payment is processing. Your order will appear after payment is confirmed.</p>;
  }
  const { items, shipping } = await getPurchasedItems(session.id);
  return (
    <section id="success">
      <SuccessPage sessionId={session.id} customerEmail={session.customer_details?.email || ''}
        items={items} shipping={shipping} total={(session.amount_total ?? 0) / 100} />
      <ClearCart />
    </section>
  );
}
