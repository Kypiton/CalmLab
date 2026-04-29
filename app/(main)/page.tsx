import { Header, Hero, Products } from '@/components/shared';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  } else
    return (
      <>
        <Header />
        <Hero />
        <Products />
      </>
    );
}
