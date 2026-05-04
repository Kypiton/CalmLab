import { Header } from '@/components/shared';

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Header />
      {children}
    </div>
  );
}
