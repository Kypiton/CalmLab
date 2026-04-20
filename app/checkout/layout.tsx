import { Logo } from '@/components/shared';

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className='flex gap-2 items-center text-2xl text-gray-400'>
        <Logo />
        <p>Home</p>
        <p>/</p>
        <p>Checkout</p>
      </div>
      {children}
    </div>
  );
}
