import { NewProduct } from '@/components/admin';
import prisma from '@/lib/prisma';

interface Props {
  className?: string;
}

export default async function ProductsNew({ className }: Props) {
  return (
    <>
      <NewProduct />
    </>
  );
}
