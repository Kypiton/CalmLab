'use client';

import { AuthFooter, AuthHeader } from '@/components/shared';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Props {
  className?: string;
}

export const SignInPage: React.FC<Props> = ({ className }) => {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [remember, setRemember] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState('');
  const [error, setError] = React.useState({
    email: '',
    password: '',
  });

  async function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const user = {
      email,
      password,
      remember,
    };

    try {
      setError({
        email: !email ? 'Missing email' : '',
        password: !password ? 'Missing password' : '',
      });
      setIsLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      const data = await res.json();
      console.log(data);

      if (!res.ok) {
        throw new Error(`Error message: ${res.statusText}! status: ${res.status}`);
      }

      setIsSuccess(data.message);
      router.push('/');
    } catch (error) {
      console.error('Error during POST request:', error);
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <div
      className={cn(
        'min-h-screen w-[95%] m-auto flex flex-col justify-start items-center py-5',
        className,
      )}
    >
      <AuthHeader />
      <div className='bg-white rounded-2xl px-8 py-8 mt-6 shadow-xl'>
        <div className='px-30'>
          <h1 className='font-bold text-3xl text-center'>Welcome back</h1>
          <p className='mt-2 text-center'>Sign in to your CalmLab account</p>
        </div>
        <form className='mt-4' onSubmit={onSubmit}>
          <div className='flex flex-col gap-6'>
            <div className='grid gap-2 relative'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                placeholder='m@example.com'
                className='px-8'
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <p className='text-destructive text-xs'>{!email && error.email}</p>
              <Mail size={15} className='absolute top-7.75 left-2' />
            </div>
            <div className='grid gap-2 relative'>
              <div className='flex items-center'>
                <Label htmlFor='password'>Password</Label>
                <LockKeyhole size={15} className='absolute top-7.5 left-2' />
              </div>
              <Input
                id='password'
                type={`${showPassword ? 'text' : 'password'}`}
                placeholder='Enter your password'
                className='px-8'
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <p className='text-destructive text-xs'>{!password && error.password}</p>
              {!showPassword ? (
                <EyeOff
                  size={15}
                  className='absolute top-7.5 right-2 cursor-pointer'
                  onClick={() => setShowPassword(true)}
                />
              ) : (
                <Eye
                  size={15}
                  className='absolute top-7.5 right-2 cursor-pointer'
                  onClick={() => setShowPassword(false)}
                />
              )}
            </div>
          </div>
          <div className='flex items-center justify-between mt-4'>
            <div className='flex items-center gap-2'>
              <Checkbox
                className='cursor-pointer'
                id='remember'
                onCheckedChange={checked => setRemember(checked === true)}
                checked={remember}
              />
              <Label htmlFor='remember' className='text-gray-600'>
                Remember me
              </Label>
            </div>
            <a
              href='#'
              className='ml-auto inline-block text-sm underline-offset-4 hover:underline text-primary'
            >
              Forgot your password?
            </a>
          </div>
          <Button type='submit' className='w-full p-5 mt-4'>
            Sign In
          </Button>
          <div className='mt-4 text-center'>
            <p>
              Don't have an account?{' '}
              <Link href='/sign-up' className='text-primary'>
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
      <AuthFooter />
    </div>
  );
};
