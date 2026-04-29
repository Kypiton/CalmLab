import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { SignInPage } from '@/components/shared';

interface Props {
  className?: string;
}

export default async function SignIn({ className }: Props) {
  const user = await getCurrentUser();

  if (user) redirect('/');

  return (
    <>
      <SignInPage />
    </>
  );
}
