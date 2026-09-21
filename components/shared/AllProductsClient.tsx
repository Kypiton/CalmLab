'use client';

import { Products } from './Products';
import { ProductItem } from '@/types/product-item';

interface Props {
  className?: string;
  products: ProductItem[];
}

export const AllProductsClient = ({ className, products }: Props) => (
  <Products className={className} products={products} paginated />
);
