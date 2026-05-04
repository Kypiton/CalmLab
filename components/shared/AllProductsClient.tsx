'use client';

import React from 'react';
import { Products } from './Products';
import { PaginationPage } from './PaginationPage';
import { ProductItem } from '@/types/product-item';

interface Props {
  className?: string;
  products: ProductItem[];
}

export const AllProductsClient: React.FC<Props> = ({ className, products }) => {
  const [currentPage, setCurrentPage] = React.useState(1);

  const itemsPerPage = 12;
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const newProducts = products.slice(start, end);

  return (
    <div className={className}>
      <Products products={newProducts} />
      <PaginationPage
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        currentPage={currentPage}
      />
    </div>
  );
};
