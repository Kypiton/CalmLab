import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { AllProductsClient } from '@/components/shared/AllProductsClient';

export default async function AllProducts() {

  const user = await getCurrentUser();
  const products = await prisma.product.findMany();

  if (!user) {
    redirect('/sign-in');
  } else {
    return (
      <div>
        <AllProductsClient products={products} />
      </div>
    );
  }
}
