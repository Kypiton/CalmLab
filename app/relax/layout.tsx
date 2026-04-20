import { Header } from '@/components/shared';

export default function RelaxLayout({ children }: { children: React.ReactNode }) {
  return (
	<div>
	  <Header />
	  {children}
	</div>
  );
}
