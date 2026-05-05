import { cn } from '@/lib/utils';
import React from 'react';

interface Props {
  className?: string;
  value: number | string;
  title: string;
  icon: React.ReactNode;
}

export const MetricCard: React.FC<Props> = ({ className, value, title, icon }) => {
  return (
    <div
      className={cn('flex items-center justify-between gap-10 bg-white rounded-lg p-4', className)}
    >
      <div className='flex flex-col gap-2'>
        <p className='text-gray-400 text-lg'>{title}</p>
        <h2 className='font-bold'>{value}</h2>
      </div>
      <div className='flex items-center justify-center w-10 h-10 p-2 rounded-full bg-violet-200 animate-pulse'>
        <p className='flex justify-center items-center border-2 rounded-full border-violet-600 w-6 h-6'>
          {icon}
        </p>
      </div>
    </div>
  );
};
