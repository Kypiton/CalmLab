import { stripe } from '@/lib/stripe';
import { redirect } from 'next/navigation';

import { ClearCart } from '@/components/shared/ClearCart';
import { SuccessPage } from '@/components/shared';
import { getCurrentUser } from '@/lib/auth';
import { CheckoutItem } from '@/app/api/checkout_sessions/route';
import prisma from '@/lib/prisma';

type SuccessPageProps = {
  searchParams: Promise<{
    session_id?: string;
  }>;
};

export default async function Success({ searchParams }: SuccessPageProps) {
  const { session_id } = await searchParams;

  const user = await getCurrentUser();

  if (!user) redirect('/sign-in');

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
    const metaItems = JSON.parse(metadata);
    const items = await Promise.all(
      metaItems.map(async (item: CheckoutItem) => {
        const product = await prisma.product.findUnique({
          where: {
            id: item.id,
          },
        });
        return { ...product, quantity: item.quantity };
      }),
    );

    return (
      <section id='success'>
        <SuccessPage
          sessionId={session.id}
          customerEmail={customerEmail}
          items={items}
        />
        <ClearCart />
      </section>
    );
  }
}
