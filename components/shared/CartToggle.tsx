'use client';

import React from 'react';

import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { ArrowLeft, ShoppingCartIcon, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { Counter } from './';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { useCart } from '@/store/cart';
import Link from 'next/link';
import { useTotal } from '@/hooks/useTotal';

interface Props {
  className?: string;
}

export const CartToggle: React.FC<Props> = ({ className }) => {
  const { total, subtotal, shipping, cartItems } = useTotal();
  const removeFromCart = useCart(state => state.removeFromCart);
  const clearCart = useCart(state => state.clearCart);
  const incrementQuantity = useCart(state => state.incrementQuantity);
  const decrementQuantity = useCart(state => state.decrementQuantity);

  return (
    <>
      <Drawer direction='right'>
        <DrawerTrigger asChild>
          <Button variant='ghost'>
            <ShoppingCartIcon size={20} className='cursor-pointer' />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className='flex'>
            <DrawerTitle>Shopping Cart</DrawerTitle>
            <DrawerDescription>Number of products: {cartItems.length}</DrawerDescription>
          </DrawerHeader>
          <div className='flex flex-col h-137.5'>
            <div className='overflow-auto flex-1'>
              {cartItems.length ? (
                cartItems.map(({ id, title, image, price, brand, quantity }) => {
                  return (
                    <div key={id}>
                      <div className='flex items-center'>
                        <Image src={image} alt={title} width={50} height={50} />
                        <div className='flex flex-col gap-2'>
                          <p className='max-w-38'>{title}</p>
                          <Badge variant='secondary'>{brand}</Badge>
                        </div>
                        <div className='flex flex-col items-end gap-3 flex-1 mr-3'>
                          <div className='flex items-center gap-2'>
                            <Counter
                              value={quantity}
                              onIncrement={() => incrementQuantity(id)}
                              onDecrement={() => decrementQuantity(id)}
                            />
                            <Trash2
                              size={20}
                              className='cursor-pointer'
                              onClick={() => removeFromCart(id)}
                            />
                          </div>
                          <p>${(price * quantity).toFixed(2)}</p>
                        </div>
                      </div>
                      <Separator className='mt-1' />
                    </div>
                  );
                })
              ) : (
                <p className='mt-40 text-2xl text-center text-destructive'>
                  Add products to your cart!
                </p>
              )}
            </div>
            <div className='mx-4 bottom-0 left-0 right-0'>
              <p className='text-xl font-bold text-primary'>Order Summary</p>
              <div className='flex items-center justify-between mt-2'>
                <p>Subtotal</p>
                <p>${subtotal}</p>
              </div>
              <Separator className='mt-2' />
              <div className='flex items-center justify-between mt-2'>
                <p>Shipping</p>
                <p>${shipping}</p>
              </div>
              <Separator className='mt-2' />
              <div className='flex items-center justify-between mt-2'>
                <p className='text-xl font-bold text-primary'>Total</p>
                <p>${total}</p>
              </div>
              <Separator className='mt-2' />
            </div>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Link
                href='/checkout'
                className={`block ${!cartItems.length ? 'cursor-not-allowed' : ''}`}
                onClick={e => {
                  !cartItems.length ? e.preventDefault() : undefined;
                }}
              >
                <Button className='w-full' disabled={!cartItems.length}>
                  Proceed to Checkout
                </Button>
              </Link>
            </DrawerClose>
            <DrawerClose asChild>
              <Button variant='outline'>
                <ArrowLeft />
                Continue Shopping
              </Button>
            </DrawerClose>
            <Button variant='destructive' onClick={clearCart}>
              Clear Cart
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};
