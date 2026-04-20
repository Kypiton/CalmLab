'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useTotal } from '@/hooks/useTotal';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

interface Props {
  className?: string;
}

export default function Checkout({ className }: Props) {
  const { total, subtotal, shipping, cartItems } = useTotal();
  return (
    <div className={cn('mt-10', className)}>
      <h1 className='text-4xl font-extrabold text-primary text-center'>Checkout</h1>
      <div className='flex items-start justify-center gap-5 mt-5'>
        <div>
          <div className='bg-white p-5 rounded-2xl'>
            <p className='text-xl'>Contact Information</p>
            <Input placeholder='example@gmail.com' className='mt-3' />
            <p className='mt-5 text-xl'>Delivery Details</p>
            <Input placeholder='Full Name' className='mt-3' />
            <Input placeholder='Delivery Address' className='mt-2' />
          </div>

          <div className='bg-white p-5 rounded-2xl mt-3'>
            <p className='text-xl'>Promotions</p>
            <Separator />
            <div className='flex items-center gap-4 mt-2'>
              <Input placeholder='Discount Code' />
              <Button>Apply</Button>
            </div>
          </div>
        </div>
        <div className='flex flex-col bg-white rounded-2xl p-5 h-92'>
          <p className='text-xl font-bold text-primary'>Order Summary</p>
          <Separator className='mt-2' />
          <div className='overflow-auto flex-1'>
            {cartItems.map(({ id, title, image, price, quantity }) => (
              <div key={id}>
                <div className='flex items-center py-2'>
                  <Image src={image} alt={title} width={50} height={50} />
                  <div className='flex flex-col gap-2'>
                    <p className='max-w-38 text-sm'>{title}</p>
                  </div>
                  <div className='flex flex-col items-end flex-1 mr-3'>
                    <div className='flex items-center'>
                      <p className='text-sm'>${price}</p>
                    </div>
                    x{quantity}
                  </div>
                </div>
                <Separator className='mt-1' />
              </div>
            ))}
          </div>
          <div className='flex items-center justify-between mt-2'>
            <p>Subtotal</p>
            <p>${subtotal}</p>
          </div>
          <div className='flex items-center justify-between mt-2'>
            <p>Shipping</p>
            <p>${shipping}</p>
          </div>
          <Separator className='mt-2' />
          <div className='flex items-center justify-between mt-2'>
            <p className='text-xl font-bold text-primary'>Total</p>
            <p>${total}</p>
          </div>
          <Link href='/checkout' className='block mt-2'>
            <Button className='w-full'>Pay with stripe</Button>
          </Link>

          <Button variant='outline' className='mt-2'>
            <Link href='/'>Back to shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
