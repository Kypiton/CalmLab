'use client';

import { Order } from '@/types/order';
import React from 'react';

import Image from 'next/image';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface Props {
  className?: string;
  orders: Order[];
}

export const OrdersTable: React.FC<Props> = ({ className, orders }) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const newOrders = orders.slice(start, end);
  const pages: number[] = [];
  let pagesWithDots: (number | string)[] = [];

  switch (true) {
    case currentPage <= 3:
      pagesWithDots = [1, 2, 3, 'right-ellipsis', totalPages];
      break;
    case currentPage >= totalPages - 2:
      pagesWithDots = [1, 'left-ellipsis', totalPages - 2, totalPages - 1, totalPages];
      break;
    case currentPage >= 3 && currentPage < totalPages - 1:
      pagesWithDots = [
        1,
        'left-ellipsis',
        currentPage - 1,
        currentPage,
        currentPage + 1,
        'right-ellipsis',
        totalPages,
      ];
      break;
  }

  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  function prevPage() {
    if (currentPage !== 1) {
      setCurrentPage(currentPage => currentPage - 1);
    }
  }

  function presentPage(currentPage: number) {
    setCurrentPage(currentPage);
  }

  function nextPage() {
    if (currentPage !== totalPages) {
      setCurrentPage(currentPage => currentPage + 1);
    }
  }

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
                  <p>{order.createdAt.slice(0, 15)}</p>
                  <p>{order.createdAt.slice(16)}</p>
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
      <Pagination className='mt-4'>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href='#' onClick={prevPage} />
          </PaginationItem>
          {totalPages <= 5
            ? pages.map(page => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href='#'
                    onClick={() => presentPage(page)}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))
            : pagesWithDots.map(page => (
                <PaginationItem key={page}>
                  {typeof page === 'number' ? (
                    <PaginationLink
                      href='#'
                      onClick={() => presentPage(page)}
                      isActive={currentPage === page}
                    >
                      {page}
                    </PaginationLink>
                  ) : (
                    <PaginationEllipsis />
                  )}
                </PaginationItem>
              ))}
          <PaginationItem>
            <PaginationNext href='#' onClick={nextPage} />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};
