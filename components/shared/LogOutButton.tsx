'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import { Button } from '../ui/button';

interface Props {
  children?: React.ReactNode;
}

export const LogOutButton: React.FC<Props> = ({ children }) => {
  const router = useRouter();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/sign-in');
    router.refresh();
  }

  return (
    <Button variant='ghost' onClick={logout}>
      {children}
    </Button>
  );
};
