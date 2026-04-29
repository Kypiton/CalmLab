import React from 'react';
import { Logo } from './';

export const AuthHeader: React.FC = () => {
  return (
    <>
      <Logo />
      <p className='text-gray-600'>Find balance. Feel better. Live mindfully.</p>
    </>
  );
};
