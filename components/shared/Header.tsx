import React from 'react';
import { User } from 'lucide-react';

import { cn } from '@/lib/utils';

import { CartToggle, Logo, Navigation, SearchToggle } from './';

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
      </div>
    </div>
  );
};
