import { navigation } from '@/lib/navigation';

import Link from 'next/link';
import React from 'react';

export const Navigation: React.FC = () => {
  return (
    <ul className='flex items-center gap-4'>
      {navigation.map(item => (
        <li key={item.title}>
          <Link href={item.href} className='font-black text-primary text-xl'>
            {item.title}
          </Link>
        </li>
      ))}
    </ul>
  );
};
