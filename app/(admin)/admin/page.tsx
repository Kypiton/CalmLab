import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

interface Props {
  className?: string;
}

export default async function Admin({ className }: Props) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  if (user.role !== 'Admin') {
    redirect('/');
  }

  return <div className={className}>Admin Dashboard</div>;
}
