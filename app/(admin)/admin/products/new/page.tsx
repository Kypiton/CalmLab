import { NewProduct } from '@/components/admin';

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
