import React from 'react';

import Rating from '@mui/material/Rating';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Image from 'next/image';
import { ProductItem } from '@/types/product-item';
import { Product, useCart } from '@/store/cart';
import { toast } from 'sonner';

interface Props extends ProductItem {
  className?: string;
}

export const ProductCard: React.FC<Props> = ({
  className,
  title,
  brand,
  image,
  description,
  rating,
  price,
  id,
}) => {
  const addToCart = useCart(state => state.addToCart);

  const productItem = {
    id,
    title,
    image,
    price,
    brand,
  };

  function handleAddToCart(productItem: Product) {
    addToCart(productItem);
    toast.success('Product has been added to the cart', { position: 'bottom-right' });
  }

  return (
    <Card className='w-full max-w-sm flex flex-col h-full'>
      <div className='flex items-center justify-center w-full h-50'>
        <img src={image} alt={title} className='mx-auto max-w-full max-h-full object-contain' />
      </div>
      <CardHeader className='flex-1'>
        <CardAction>
          <Badge variant='secondary'>{brand}</Badge>
        </CardAction>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
        <Rating name='half-rating' defaultValue={rating} precision={0.1} readOnly />
      </CardHeader>
      <CardFooter className='flex items-center justify-between mt-auto'>
        <Button variant='default' onClick={() => handleAddToCart(productItem)}>
          Add to Cart
        </Button>
        <p>{price} $</p>
      </CardFooter>
    </Card>
  );
};
