import { cn } from '@/lib/utils';
import { readFileSync } from 'fs';
import { OrdersTable } from '@/components/shared';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

interface Props {
  className?: string;
}

export default async function Orders({ className }: Props) {
  const pathName = `${process.cwd()}/lib/orders.json`;
  const data = readFileSync(pathName, 'utf8');
  const orders = JSON.parse(data);
  const user = await getCurrentUser();

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
