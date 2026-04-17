import Image from 'next/image';
import React from 'react';

import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

interface Props {
  className?: string;
}

export const Hero: React.FC<Props> = ({ className }) => {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      {/* Left side */}
      <div>
        <h1 className='text-4xl text-primary font-bold mb-4'>Welcome to Our Website</h1>
        <p className='text-lg text-chart-5 mb-6'>
          Discover amazing content and connect with like-minded individuals.
        </p>
        <Button className='p-6  text-white rounded-lg bg-primary hover:bg-primary/90'>
          Shop now
        </Button>
      </div>

      {/* Right side */}
      <div>
        <Image
          src='/froots.jpg'
          width={550}
          height={500}
          alt='Froots Image'
          className='w-full rounded-lg shadow-lg'
        />
      </div>
    </div>
  );
};
