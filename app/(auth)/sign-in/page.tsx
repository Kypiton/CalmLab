import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { SignInPage } from '@/components/shared';

export default async function SignIn() {
  const user = await getCurrentUser();

  if (user) redirect('/');

  return (
    <>
      <SignInPage />
    </>
  );
}
