import { ProductsAdmin } from '@/components/admin';
import prisma from '@/lib/prisma';

export default async function Products() {
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
