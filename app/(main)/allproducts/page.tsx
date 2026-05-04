import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { AllProductsClient } from '@/components/shared/AllProductsClient';

interface Props {
  className?: string;
}

export default async function AllProducts({ className }: Props) {

  const user = await getCurrentUser();
  const products = await prisma.product.findMany();

  if (!user) {
    redirect('/sign-in');
  } else {
    return (
      <div className={className}>
        <AllProductsClient products={products} />
      </div>
    );
  }
}
