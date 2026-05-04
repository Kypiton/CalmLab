import React from 'react';
import { LogOut, Package, User } from 'lucide-react';

import { cn } from '@/lib/utils';

import { CartToggle, Logo, LogOutButton, Navigation, SearchToggle } from './';
import Link from 'next/link';

import { SettingsIcon, UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='default'>Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem className='cursor-pointer' disabled>
              <UserIcon />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href='/orders' className='flex items-center gap-2'>
                <Package size={20} className='cursor-pointer' />
                <p>Orders</p>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className='cursor-pointer' disabled>
              <SettingsIcon />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant='destructive'>
              <LogOutButton className='flex items-center gap-2 cursor-pointer'>
                <LogOut size={20} className='cursor-pointer' />
                <p>Log out</p>
              </LogOutButton>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
