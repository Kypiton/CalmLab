import { Header, Hero, Products } from '@/components/shared';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const products = await prisma.product.findMany({
    take: 8,
  });

  return (
    <>
      <Header />
      <Hero />
      <Products products={products} />
    </>
  );
}
