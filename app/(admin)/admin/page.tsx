import { MetricCard, PieChartComponent } from '@/components/shared';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Box, ChartNoAxesColumnIncreasing, DollarSign, Handbag, UsersRound } from 'lucide-react';
import { redirect } from 'next/navigation';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Props {
  className?: string;
}

export default async function Admin({ className }: Props) {
  const user = await getCurrentUser();
  const totalRevenue = await prisma.order.aggregate({
    where: {
      status: 'paid',
    },
    _sum: {
      total: true,
    },
  });
  const totalOrders = await prisma.order.count();
  const totalProducts = await prisma.product.count();
  const totalCustomers = await prisma.user.count();
  const recentOrders = await prisma.order.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
  });

  const revenue = +(totalRevenue._sum.total ?? 0).toFixed(2);

  const averageOrderValue = +(revenue / totalOrders).toFixed(2);

  const orders = await prisma.order.findMany();
  const ordersData = orders.map(order => {
    const label = order.status.includes('_')
      ? 'No payment required'
      : order.status[0].toUpperCase() + order.status.slice(1);
    return {
      label,
      value: 1,
    };
  });

  const groupedOrdersData = ordersData.reduce((acc, item) => {
    const existingItem = acc.find(order => order.label === item.label);

    if (existingItem) {
      existingItem.value = existingItem.value + item.value;
    } else {
      acc.push(item);
    }

    return acc;
  }, [] as { label: string; value: number }[]);

  if (!user) {
    redirect('/sign-in');
  }

  if (user.role !== 'Admin') {
    redirect('/');
  }

  return (
    <div className={className}>
      <div className='grid grid-cols-4 gap-4 w-full'>
        <MetricCard
          value={`$${revenue}`}
          title={'Total Revenue'}
          icon={<DollarSign className='text-violet-600' size={15} />}
        />
        <MetricCard
          value={totalOrders}
          title={'Total Orders'}
          icon={<Handbag className='text-violet-600' size={15} />}
        />
        <MetricCard
          value={totalProducts}
          title={'Total Products'}
          icon={<Box className='text-violet-600' size={15} />}
        />
        <MetricCard
          value={totalCustomers}
          title={'Total Customers'}
          icon={<UsersRound className='text-violet-600' size={15} />}
        />
      </div>
      <div className='flex justify-start items-stretch gap-4 w-full mt-4'>
        <div className='w-[60%] bg-white rounded-lg flex flex-col'>
          <h2 className='font-semibold w-full p-4'>Recent Orders</h2>
          <Table className='bg-white w-full rounded-b-lg'>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map(order => {
                const year = order.createdAt.getFullYear();
                const month = order.createdAt.toString().slice(4, 7);
                const day = order.createdAt.getDate();
                const date = `${month} ${day}, ${year}`;

                return (
                  <TableRow key={order.id}>
                    <TableCell className='font-medium'>
                      {order.stripeSessionId.slice(8, 20)}...
                    </TableCell>
                    <TableCell>{order.customerEmail}</TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell>{order.total}</TableCell>
                    <TableCell>{date}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <div className='w-full'>
          <div className='bg-white p-4 rounded-lg'>
            <p className='font-semibold bg-white w-full rounded-t-lg'>Orders by Status</p>
            <PieChartComponent data={groupedOrdersData} />
          </div>

          <div className='flex items-start justify-stretch gap-8 bg-white p-8 rounded-lg mt-4'>
            <div className='flex items-center justify-center w-10 h-10 p-2 rounded-full bg-violet-200'>
              <ChartNoAxesColumnIncreasing size={25} className='text-violet-600 animate-pulse' />
            </div>
            <div className='flex flex-col gap-2'>
              <h3 className='font-bold text-gray-500'>Average Order Value</h3>
              <p className='font-bold text-2xl'>${averageOrderValue}</p>
              <p className='text-gray-400'>Average value of paid orders</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
