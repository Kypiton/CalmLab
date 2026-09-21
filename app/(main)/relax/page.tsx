import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Relax() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  } else {
    return <div>Relax</div>;
  }
}
