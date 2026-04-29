'use client';

import { AuthFooter, AuthHeader } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { MyUser } from '@/types/auth';
import { Eye, EyeOff, LockKeyhole, Mail, User } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

interface Props extends MyUser {
  className?: string;
}

export default function SignUp({ className }: Props) {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [agreement, setAgreement] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState('');
  const [error, setError] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreement: '',
  });

  async function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const user: MyUser = {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      agreement,
    };

    try {
      setError({
        firstName: !firstName ? 'Missing first name' : '',
        lastName: !lastName ? 'Missing last name' : '',
        email: !email ? 'Missing email' : '',
        password: !password ? 'Missing password' : '',
        confirmPassword: !confirmPassword ? 'Missing confirm password' : '',
        agreement: !agreement ? 'You must accept terms.' : '',
      });
      setIsLoading(true);
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(`Error message: ${res.statusText}! status: ${res.status}`);
      }

      setIsSuccess(data.message);
      router.push('/sign-in');
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
          <h1 className='font-bold text-3xl text-center'>Create your account</h1>
          <p className='mt-2 text-center'>Sign up to start your mindful journey</p>
          <form onSubmit={onSubmit}>
            <div className='flex items-center gap-10 mt-4'>
              <div className='grid gap-2 relative'>
                <Label htmlFor='first_name'>First name</Label>
                <Input
                  id='first_name'
                  type='text'
                  placeholder='Enter your first name'
                  className='px-8'
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                />
                <p className='text-destructive text-xs'>{!firstName && error.firstName}</p>
                <User size={15} className='absolute top-7.75 left-2' />
              </div>
              <div className='grid gap-2 relative'>
                <Label htmlFor='last_name'>Last name</Label>
                <Input
                  id='last_name'
                  type='text'
                  placeholder='Enter your last name'
                  className='px-8'
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                />
                <p className='text-destructive text-xs'>{!lastName && error.lastName}</p>
                <User size={15} className='absolute top-7.75 left-2' />
              </div>
            </div>
            <div className='grid gap-2 relative mt-4'>
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
            <div className='grid gap-2 relative mt-4'>
              <div className='flex items-center'>
                <Label htmlFor='password'>Password</Label>
                <LockKeyhole size={15} className='absolute top-7.5 left-2' />
              </div>
              <Input
                id='password'
                type={`${showPassword ? 'text' : 'password'}`}
                placeholder='Create a password'
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
              <p className='text-xs -mt-2'>
                At least 8 characters, including a number or special character
              </p>
            </div>
            <div className='grid gap-2 relative mt-4'>
              <div className='flex items-center'>
                <Label htmlFor='confirm_password'>Confirm Password</Label>
                <LockKeyhole size={15} className='absolute top-7.5 left-2' />
              </div>
              <Input
                id='confirm_password'
                type={`${showConfirmPassword ? 'text' : 'password'}`}
                placeholder='Confirm your password'
                className='px-8'
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
              <p className='text-destructive text-xs'>
                {!confirmPassword && error.confirmPassword}
              </p>
              {!showConfirmPassword ? (
                <EyeOff
                  size={15}
                  className='absolute top-7.5 right-2 cursor-pointer'
                  onClick={() => setShowConfirmPassword(true)}
                />
              ) : (
                <Eye
                  size={15}
                  className='absolute top-7.5 right-2 cursor-pointer'
                  onClick={() => setShowConfirmPassword(false)}
                />
              )}
            </div>
            <div className='flex items-center gap-2 mt-4'>
              <Checkbox
                className='cursor-pointer'
                id='agreement'
                onCheckedChange={checked => setAgreement(checked === true)}
                checked={agreement}
              />
              <Label htmlFor='agreement' className='text-gray-600'>
                I agree to the <span className='text-primary'>Terms of Service</span> and{' '}
                <span className='text-primary'>Privacy Policy</span>
              </Label>
            </div>
            <p className='text-destructive text-xs mt-2'>{!agreement && error.agreement}</p>
            <Button type='submit' className='w-full p-5 mt-4' disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>

          <div className='mt-4 text-center'>
            <p>
              Already have an account?{' '}
              <Link href='/sign-in' className='text-primary'>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
      <AuthFooter />
    </div>
  );
}
