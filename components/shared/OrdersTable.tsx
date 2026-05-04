'use client';

import { Order } from '@/types/order';
import React from 'react';

import Image from 'next/image';
import { PaginationPage } from './PaginationPage';

interface Props {
  className?: string;
  orders: Order[]
}

export const OrdersTable: React.FC<Props> = ({ className, orders }) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const newOrders = orders.slice(start, end);

  return (
    <div className={className}>
      <h1 className='font-bold text-3xl text-primary'>Order History</h1>
      <p className='mt-3 text-gray-500'>Track your recent orders</p>
      <table className='border-collapse border border-gray-300 border-spacing-2 mt-4 w-full'>
        <thead className='bg-primary text-white text-left'>
          <tr>
            <th className='border border-gray-300 p-2'>Order ID</th>
            <th className='border border-gray-300 p-2'>Date</th>
            <th className='border border-gray-300 p-2'>Status</th>
            <th className='border border-gray-300 p-2'>Total</th>
            <th className='border border-gray-300 p-2'>Items</th>
          </tr>
        </thead>
        <tbody>
          {newOrders.map((order: Order) => {
            const firstThreeItems = order.items.slice(0, 3);
            const remaining = order.items.slice(3).length;
            let statuses: string;

            switch (order.status) {
              case 'paid':
                statuses = 'bg-emerald-500';
                break;
              case 'unpaid':
                statuses = 'bg-sky-500';
                break;
              case 'no_payment_required':
                statuses = 'bg-yellow-500';
                break;
            }

            return (
              <tr key={order.stripeSessionId}>
                <td className='p-2'>
                  <p>{order.stripeSessionId.slice(0, 20)}...</p>
                  <p>
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                  </p>
                </td>
                <td className='p-2'>
                  <p>{order.createdAt.toLocaleString('default', { month: 'long' })}</p>
                  <p>{order.createdAt.getFullYear()}</p>
                </td>
                <td className='p-2'>
                  <div
                    className={`${statuses} p-2 rounded-xl flex items-center gap-2 w-8/12 text-zinc-50`}
                  >
                    <p className='w-2 h-2 bg-slate-500 rounded-full'></p>
                    {order.status}
                  </div>
                </td>
                <td className='p-2'>
                  <p>${order.total}</p>
                </td>
                <td className='p-2 flex items-center'>
                  {firstThreeItems.map(item => (
                    <Image src={item.image} alt={item.title} width={50} height={50} key={item.id} />
                  ))}
                  {order.items.length > 3 && (
                    <div className='w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center ml-2'>
                      +{remaining}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <PaginationPage
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
      />
    </div>
  );
};
