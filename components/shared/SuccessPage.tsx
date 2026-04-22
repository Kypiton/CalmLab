import { CheckoutItem } from '@/app/api/checkout_sessions/route';
import { products } from '@/lib/products';
import { cn } from '@/lib/utils';
import { Check, Flower2, Leaf, Mail, TreePalm } from 'lucide-react';

import Image from 'next/image';
import React from 'react';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import Link from 'next/link';
import { Confetti } from './Confetti';
import { ToggleClipboard } from './';

interface Props {
  className?: string;
  sessionId: string;
  customerEmail: string;
  metadata: string;
}

export const SuccessPage: React.FC<Props> = ({ className, sessionId, customerEmail, metadata }) => {
  const metaItems = JSON.parse(metadata);
  const items = metaItems.map((item: CheckoutItem) => {
    const product = products.find(product => product.id === item.id);
    return { ...product, quantity: item.quantity };
  });
  const brand_new_items = [
    ...items,
    {
      id: 'delivery',
      title: 'Delivery',
      description: 'Delivery in 3-5 business days',
      price: 4.99,
      image:
        'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXRydWNrLWljb24gbHVjaWRlLXRydWNrIj48cGF0aCBkPSJNMTQgMThWNmEyIDIgMCAwIDAtMi0ySDRhMiAyIDAgMCAwLTIgMnYxMWExIDEgMCAwIDAgMSAxaDIiLz48cGF0aCBkPSJNMTUgMThIOSIvPjxwYXRoIGQ9Ik0xOSAxOGgyYTEgMSAwIDAgMCAxLTF2LTMuNjVhMSAxIDAgMCAwLS4yMi0uNjI0bC0zLjQ4LTQuMzVBMSAxIDAgMCAwIDE3LjUyIDhIMTQiLz48Y2lyY2xlIGN4PSIxNyIgY3k9IjE4IiByPSIyIi8+PGNpcmNsZSBjeD0iNyIgY3k9IjE4IiByPSIyIi8+PC9zdmc+',
    },
  ];

  const itemsWithQuantityNumber = brand_new_items.filter(item => typeof item.quantity === 'number');
  const itemWithQuantityString = brand_new_items.filter(item => item.title === 'Delivery')[0];

  const subtotal = itemsWithQuantityNumber.reduce(
    (acc, item) => (acc += item.price * item.quantity),
    0,
  );
  const total = (subtotal + itemWithQuantityString.price).toFixed(2);

  return (
    <div className={cn('m-auto max-w-8/12 py-5', className)}>
      <div className='flex justify-center items-center'>
        <Image src='/leafs/leaf-1.png' alt='Leaf-1' width={100} height={100} />
        <div className='p-5 rounded-full bg-green-200'>
          <Check size={50} />
        </div>
        <Image src='/leafs/leaf-2.png' alt='Leaf-2' width={100} height={100} />
      </div>
      <div className='text-center mt-2'>
        <h1 className='text-4xl font-medium'>Thank you!</h1>
        <p className='mt-4'>Your order was placed successfully.</p>
        <a href={`mailto:${customerEmail}`} className='text-green-800 font-black'>
          {customerEmail}
        </a>
      </div>
      <div className='p-4 bg-white rounded-xl shadow-2xl mt-10'>
        <div className='flex justify-between items-center'>
          <p className='font-bold'>Order summary</p>
          <div className='flex gap-4 items-center'>
            <p>Order ID: {sessionId.slice(0, 20)}...</p>
            <ToggleClipboard sessionId={sessionId} />
          </div>
        </div>
        <Separator className='mt-2' />
        <div className='mt-4'>
          {brand_new_items.map(item => {
            const sumPrice = item.price * item.quantity;

            return (
              <div key={item.id} className='flex mt-4'>
                <div className='flex gap-4'>
                  <Image src={item.image} alt={item.title} width={50} height={50} />
                  <div className='flex flex-col gap-2'>
                    <p className='font-bold'>{item.title}</p>
                    <p className='text-gray-500'>
                      {item.quantity ? 'Quantity:' : ''}{' '}
                      {item.quantity ? item.quantity : item.description}
                    </p>
                  </div>
                </div>
                <div className='flex flex-1 flex-col text-right gap-2'>
                  <p className='font-bold flex-1 text-right'>
                    ${item.quantity > 1 ? sumPrice : item.price}
                  </p>
                  {item.quantity > 1 && <p className='text-gray-500'>${item.price} each</p>}
                </div>
              </div>
            );
          })}
          <Separator className='mt-2' />
          <div className='flex items-center justify-between text-gray-700 mt-4'>
            <p>Subtotal</p>
            <p>${subtotal}</p>
          </div>
          <div className='flex items-center justify-between mt-4 text-gray-700'>
            <p>Shipping</p>
            <p>${itemWithQuantityString.price}</p>
          </div>
          <Separator className='mt-2' />
          <div className='flex items-center justify-between text-primary font-bold mt-2'>
            <p>Total paid</p>
            <p>${total}</p>
          </div>
        </div>
      </div>
      <div className='flex gap-10 items-stretch mt-10'>
        <div className='bg-white p-8 rounded-xl shadow-2xl flex-1'>
          <div className='flex items-center gap-4'>
            <div className='p-4 rounded-full bg-green-200'>
              <Mail />
            </div>
            <p className='font-bold'>Check your email</p>
          </div>
          <p className='mt-4'>
            We've sent your order confirmation to <br />
            <a href={`mailto:${customerEmail}`} className='text-primary font-bold'>
              {customerEmail}
            </a>
          </p>
          <p className='mt-4'>If you don't see it, check your spam folder.</p>
        </div>
        <div className='bg-white p-8 rounded-xl shadow-2xl flex-1'>
          <div className='flex items-center gap-4'>
            <div className='p-4 rounded-full bg-green-200'>
              <TreePalm />
            </div>
            <p className='font-bold'>What's next?</p>
          </div>
          <ul className='mt-4 list-none'>
            <li className='flex items-center gap-2'>
              <Check color='green' />
              <p>We're preparing your order</p>
            </li>
            <li className='flex items-start gap-2'>
              <Check color='green' />
              <p>
                You'll receive a shipping confirmation <br /> with tracking details
              </p>
            </li>
            <li className='flex items-start gap-2'>
              <Check color='green' />
              <p>Sit back and get excited for new vitamins!</p>
            </li>
          </ul>
        </div>
      </div>
      <div className='flex justify-center mt-4'>
        <Button className='w-2/6 py-8'>
          <Link href='/' className='font-bold text-base'>
            Back to Main Page
          </Link>
          <Leaf className='ml-2' />
        </Button>
      </div>
      <div className='p-4 flex items-center gap-4 border border-black rounded-2xl mt-4'>
        <div className='flex items-center justify-center w-10 h-10 p-2 rounded-full bg-gray-300'>
          <p className='flex justify-center items-center border-2 rounded-full border-black w-6 h-6'>
            ?
          </p>
        </div>
        <div className='flex flex-col'>
          <p className='font-bold'>Need help? We're here for you.</p>
          <p className='text-gray-600'>
            Email us at{' '}
            <a href='mailto:partytimeyep@gmail.com' className='text-primary font-bold'>
              partytimeyep@gmail.com
            </a>
          </p>
        </div>
        <div className='flex flex-1 justify-end'>
          <Flower2 size={50} color='green' />
        </div>
      </div>
      <Confetti />
    </div>
  );
};
