'use client';

import { cn } from '@/lib/utils';
import React from 'react';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProductCard, Category } from './';
import { products } from '@/lib/products';
import { ProductItem } from '@/types/product-item';
import { useSearchParams, useRouter } from 'next/navigation';
import { Input } from '../ui/input';
import { X } from 'lucide-react';

interface Props {
  className?: string;
}

export const Products: React.FC<Props> = ({ className }) => {
  const [searchValue, setSearchValue] = React.useState<string>('');
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeTab = searchParams.get('category') || 'all';
  const sortOption = searchParams.get('sort') || 'default';

  const filteredProducts =
    activeTab === 'all'
      ? products
      : products.filter(product => product.category.toLowerCase() === activeTab.toLowerCase());

  const searchedProducts = filteredProducts.filter(product =>
    product.title.toLowerCase().includes(searchValue.toLowerCase()),
  );

  let sortedProducts: Array<ProductItem> = [];

  switch (sortOption) {
    case 'price-asc':
      sortedProducts = searchedProducts.toSorted((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      sortedProducts = searchedProducts.toSorted((a, b) => b.price - a.price);
      break;
    case 'rating':
      sortedProducts = searchedProducts.toSorted((a, b) => b.rating - a.rating);
      break;
    default:
      sortedProducts = searchedProducts;
      break;
  }

  function clearSearch() {
    setSearchValue('');
  }

  return (
    <div className={cn('', className)}>
      <div className='flex items-center justify-between mt-4'>
        <h2 className='text-3xl text-primary font-bold'>Our Products</h2>
        <div className='relative'>
          <Input
            className='text-primary border-primary'
            placeholder='Search products...'
            onChange={e => setSearchValue(e.target.value)}
            value={searchValue}
          />
          <X className='absolute right-1.5 top-1 cursor-pointer' onClick={clearSearch} />
        </div>
        <Select
          defaultValue={sortOption}
          onValueChange={sortValue =>
            router.push(`?category=${activeTab.toLowerCase()}&sort=${sortValue}`, {
              scroll: false,
            })
          }
        >
          <SelectTrigger className='w-full max-w-48'>
            <SelectValue placeholder='Sort by' />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Sorting</SelectLabel>
              <SelectItem value='default'>Default</SelectItem>
              <SelectItem value='price-asc'>Price: Low to High</SelectItem>
              <SelectItem value='price-desc'>Price: High to Low</SelectItem>
              <SelectItem value='rating'>Top Rated</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className='mt-3'>
        <Category activeTab={activeTab} sortOption={sortOption} />
      </div>
      <div className='grid grid-cols-4 gap-4 mt-4'>
        {sortedProducts.length ? (
          sortedProducts.map(product => <ProductCard key={product.id} {...product} />)
        ) : (
          <p className='text-3xl text-destructive'>Products not found...</p>
        )}
      </div>
    </div>
  );
};
