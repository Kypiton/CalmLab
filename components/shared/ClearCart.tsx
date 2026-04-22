'use client';

import { useCart } from '@/store/cart';
import React from 'react';

interface Props {
  className?: string;
}

export const ClearCart: React.FC<Props> = ({ className }) => {
  const clearCart = useCart(state => state.clearCart);
  clearCart();
  return <div className={className}></div>;
};
