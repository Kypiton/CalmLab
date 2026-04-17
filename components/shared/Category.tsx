'use client';

import React from 'react';

import { Button } from '../ui/button';

import { categories } from '@/lib/categories';
import { useRouter } from 'next/navigation';

interface Props {
  className?: string;
  activeTab: string;
  sortOption: string;
}

export const Category: React.FC<Props> = ({ className, activeTab, sortOption }) => {
  const router = useRouter();
  return (
    <div className='flex items-center gap-1'>
      {categories.map(category => (
        <Button
          key={category}
          onClick={() =>
            router.push(`?category=${category.toLowerCase()}&sort=${sortOption}`, {
              scroll: false,
            })
          }
          className={`${
            activeTab === category.toLowerCase()
              ? 'bg-primary text-white'
              : 'bg-white text-primary border border-primary'
          }`}
        >
          {category}
        </Button>
      ))}
    </div>
  );
};
