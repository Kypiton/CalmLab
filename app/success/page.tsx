import { stripe } from '@/lib/stripe';
import { redirect } from 'next/navigation';

import { ClearCart } from '@/components/shared/ClearCart';
import { SuccessPage } from '@/components/shared';

type SuccessPageProps = {
  searchParams: Promise<{
    session_id?: string;
  }>;
};

export default async function Success({ searchParams }: SuccessPageProps) {
  const { session_id } = await searchParams;

  if (!session_id) throw new Error('Please provide a valid session_id (`cs_test_...`)');

  const session = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ['line_items', 'payment_intent', 'line_items.data.price.product'],
  });

  if (session.status === 'open') {
    return redirect('/');
  }

  if (session.status === 'complete') {
    const customerEmail = session.customer_details?.email || 'No email provided';
    const metadata = session.metadata?.data || '';

    return (
      <section id='success'>
        <SuccessPage metadata={metadata} sessionId={session.id} customerEmail={customerEmail} />
        <ClearCart />
      </section>
    );
  }
}
