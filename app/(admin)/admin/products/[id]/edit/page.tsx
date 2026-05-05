import { EditProduct } from '@/components/admin';
import prisma from '@/lib/prisma';
import React from 'react';

interface Props {
  className?: string;
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductsEdit({ className, params }: Props) {
  const { id } = await params;
  const productId = +id;

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  return (
    <>
      <EditProduct product={product} />
    </>
  );
}
