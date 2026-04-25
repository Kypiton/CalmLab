import React from 'react';
import { Package, User } from 'lucide-react';

import { cn } from '@/lib/utils';

import { CartToggle, Logo, Navigation, SearchToggle } from './';
import Link from 'next/link';

interface Props {
  className?: string;
}

export const Header: React.FC<Props> = ({ className }) => {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <Logo />
      <Navigation />
      <div className='flex items-center gap-2'>
        <SearchToggle />
        <CartToggle />
        <User size={20} className='cursor-pointer' />
        <Link href='/orders'>
          <Package size={20} className='cursor-pointer ml-2' />
        </Link>
      </div>
    </div>
  );
};
