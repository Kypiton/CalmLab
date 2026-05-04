'use client';

import React from 'react';

import { Product } from '@/app/generated/prisma/client';
import { Input } from '@/components/ui/input';
import { Pencil, Search, Trash2 } from 'lucide-react';
import { PaginationPage } from '../shared/PaginationPage';

import Image from 'next/image';
import Link from 'next/link';

interface Props {
  className?: string;
  products: Product[];
}

export const ProductsAdmin: React.FC<Props> = ({ className, products }) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [search, setSearch] = React.useState('');

  const productsWithSearch = products.filter(product =>
    product.title.toLowerCase().includes(search.toLowerCase()),
  );

  function resetSearch(e: { target: { value: React.SetStateAction<string> } }) {
    setSearch(e.target.value);
    setCurrentPage(1);
  }

  const itemsPerPage = 6;
  const totalPages = Math.ceil(productsWithSearch.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const endValue = Math.min(endIndex, productsWithSearch.length);
  const newProducts = productsWithSearch.slice(startIndex, endIndex);

  return (
    <div className={className}>
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='font-bold text-3xl'>Products</h2>
          <p>Manage and add new products to your store.</p>
        </div>
        <Link href='/admin/products/new' className='bg-violet-600 py-2 px-5 rounded-lg text-white'>
          + Add product
        </Link>
      </div>
      <div className='flex items-center justify-between mt-8'>
        <h3 className='font-bold text-xl'>All products</h3>
        <div className='relative'>
          <Search className='absolute top-2.5 left-2' size={20} />
          <Input
            className='pl-8 py-5 w-100 rounded-xl border-violet-600 focus-visible:ring-1 focus-visible:ring-violet-600 focus-visible:border-violet-600 caret-violet-600'
            placeholder='Search products...'
            onChange={resetSearch}
            value={search}
          />
        </div>
      </div>
      <table className='border-collapse border border-gray-300 border-spacing-2 mt-4 w-full'>
        <thead className='text-left'>
          <tr>
            <th className='border border-gray-300 p-2'>Product</th>
            <th className='border border-gray-300 p-2'>Price</th>
            <th className='border border-gray-300 p-2'>Category</th>
            <th className='border border-gray-300 p-2'>Status</th>
            <th className='border border-gray-300 p-2'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {newProducts.map((product: Product) => {
            let categories: string;
            let statuses = 'bg-green-200 text-green-600';

            switch (product.category) {
              case 'focus':
                categories = 'bg-emerald-200 text-emerald-600';
                break;
              case 'recovery':
                categories = 'bg-sky-200 text-sky-600';
                break;
              case 'relax':
                categories = 'bg-pink-200 text-pink-600';
                break;
              case 'sleep':
                categories = 'bg-orange-200 text-orange-600';
                break;
            }

            return (
              <tr key={product.id}>
                <td className='p-2'>
                  <div className='flex items-center'>
                    <Image
                      src={product.image}
                      alt={product.title}
                      width={50}
                      height={50}
                      key={product.id}
                    />
                    <div className='flex flex-col'>
                      <p>{product.title}</p>
                      <p>{product.brand}</p>
                    </div>
                  </div>
                </td>
                <td className='p-2'>
                  <p>${product.price}</p>
                </td>
                <td className='p-2'>
                  <p className={`${categories} w-fit px-3 py-1.5 rounded-2xl`}>
                    {product.category}
                  </p>
                </td>
                <td className='p-2'>
                  <p className={`${statuses} w-fit px-3 py-1.5 rounded-2xl`}>Active</p>
                </td>
                <td className='p-2'>
                  <div className='flex items-center justify-start gap-2'>
                    <div className='p-3 border border-gray-400 rounded-xl cursor-pointer text-gray-400'>
                      <Pencil size={20} />
                    </div>
                    <div className='p-3 rounded-xl cursor-pointer text-red-600 bg-red-200'>
                      <Trash2 size={20} />
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className='flex items-center justify-between mt-4'>
        <p className='text-gray-600 w-full'>
          {!productsWithSearch.length
            ? '0 products.'
            : `Showing ${startIndex + 1} to ${endValue} of ${productsWithSearch.length} products`}
        </p>
        <PaginationPage
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          currentPage={currentPage}
          className='justify-end mt-1'
        />
      </div>
    </div>
  );
};
