import { cn } from '@/lib/utils';
import { readFileSync } from 'fs';
import { OrdersTable } from '@/components/shared';

interface Props {
  className?: string;
}

export default async function Orders({ className }: Props) {
  const pathName = `${process.cwd()}/lib/orders.json`;
  const data = readFileSync(pathName, 'utf8');
  const orders = JSON.parse(data);

  return (
    <div className={cn('p-5', className)}>
      <OrdersTable orders={orders} />
    </div>
  );
}
