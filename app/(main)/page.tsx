import { Header, Hero, Products } from '@/components/shared';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function Home() {
  const products = await prisma.product.findMany();
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  } else
    return (
      <>
        <Header />
        <Hero />
        <Products products={products} />
      </>
    );
}
