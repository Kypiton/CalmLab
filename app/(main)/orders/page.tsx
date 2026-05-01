import { cn } from '@/lib/utils';
import { readFileSync } from 'fs';
import { OrdersTable } from '@/components/shared';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';

interface Props {
  className?: string;
}

export default async function Orders({ className }: Props) {
  const user = await getCurrentUser();
  const orders = await prisma.order.findMany({
    where: { userId: user?.id },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });

  if (!user) {
    redirect('/sign-in');
  } else {
    return (
      <div className={cn('p-5', className)}>
        {!orders.length ? (
          <p className='text-destructive font-bold text-4xl text-center mt-20'>
            There are no orders in your Order History!
          </p>
        ) : (
          <OrdersTable orders={orders} />
        )}
      </div>
    );
  }
}
