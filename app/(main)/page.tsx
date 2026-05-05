import { Header, Hero, Products } from '@/components/shared';
import prisma from '@/lib/prisma';

export default async function Home() {
  const products = (await prisma.product.findMany()).slice(0, 8);

  return (
    <>
      <Header />
      <Hero />
      <Products products={products} />
    </>
  );
}
