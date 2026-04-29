import { Heart, LockKeyhole, Sprout } from 'lucide-react';
import React from 'react';

export const AuthFooter: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <>
      <div className='flex justify-between items-center mt-8 gap-10'>
        <div className='text-center flex flex-col justify-center items-center max-w-45'>
          <div className='bg-olive-300 rounded-full w-12 h-12 flex items-center justify-center'>
            <Sprout size={20} />
          </div>
          <p className='font-bold mt-2'>Evidence-based</p>
          <p>All programs are created by professionals</p>
        </div>
        <div className='text-center flex flex-col justify-center items-center max-w-45'>
          <div className='bg-olive-300 rounded-full w-12 h-12 flex items-center justify-center'>
            <LockKeyhole size={20} />
          </div>
          <p className='font-bold mt-2'>Private & secure</p>
          <p>Your data is encrypted and protected</p>
        </div>
        <div className='text-center flex flex-col justify-center items-center max-w-45'>
          <div className='bg-olive-300 rounded-full w-12 h-12 flex items-center justify-center'>
            <Heart size={20} />
          </div>
          <p className='font-bold mt-2'>Made for you</p>
          <p>Personalized programs for your goals</p>
        </div>
      </div>
      <p className='mt-10'>&copy; {year} CalmLab. All rights reserved.</p>
    </>
  );
};
