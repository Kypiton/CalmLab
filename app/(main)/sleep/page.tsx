import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

interface Props {
  className?: string;
}

export default async function Sleep({ className }: Props) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  } else {
    return <div className={className}>Sleep</div>;
  }
}
