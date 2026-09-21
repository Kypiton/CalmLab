import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Sleep() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  } else {
    return <div>Sleep</div>;
  }
}
