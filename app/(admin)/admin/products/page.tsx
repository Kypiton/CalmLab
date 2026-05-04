import { ProductsAdmin } from '@/components/admin';
import prisma from '@/lib/prisma';

interface Props {
  className?: string;
}

export default async function Products({ className }: Props) {
  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: 'asc',
    },
  });

  return (
    <>
      <ProductsAdmin products={products} />
    </>
  );
}
