import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface Props {
  className?: string;
}

export const Logo: React.FC<Props> = ({ className }) => {
  return (
    <Link href='/' className={cn('flex items-center', className)}>
      <Image src='/leafs/leaf.png' alt='Logo' width={60} height={60} />
      <span className='font-bold text-3xl text-primary'>CalmLab</span>
    </Link>
  );
};
