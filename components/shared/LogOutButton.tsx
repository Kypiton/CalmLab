'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import { Button } from '../ui/button';

interface Props {
  children?: React.ReactNode;
  className: string;
}

export const LogOutButton: React.FC<Props> = ({ children, className }) => {
  const router = useRouter();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/sign-in');
    router.refresh();
  }

  return (
    <button onClick={logout} className={className}>
      {children}
    </button>
  );
};
