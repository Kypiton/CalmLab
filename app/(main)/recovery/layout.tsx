import { Header } from '@/components/shared';

export default function RecoveryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Header />
      {children}
    </div>
  );
}
