import { getCurrentUser } from '@/lib/auth';
import { Flower, Handbag, House, LogOut } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  if (user.role !== 'Admin') {
    redirect('/');
  }
  return (
    <div className='min-h-screen flex bg-slate-100'>
      <aside className='w-[20%] py-5 flex flex-col border-r border-violet-300'>
        <div className='flex items-center justify-center'>
          <Flower className='text-violet-600 animate-spin' size={50} />
          <h1 className='font-bold text-violet-600 text-3xl'>CalmLab</h1>
        </div>
        <div className='mt-2'>
          <Link
            href='/admin/'
            className='flex items-center justify-start gap-2 w-50 pr-10 pl-4 py-2 rounded-xl m-auto cursor-pointer hover:bg-violet-200 hover:text-violet-600'
          >
            <House />
            <p>Dashboard</p>
          </Link>
          <Link
            href='/admin/products'
            className='flex items-center justify-start gap-2 w-50 pr-10 pl-4 py-2 rounded-xl m-auto cursor-pointer hover:bg-violet-200 hover:text-violet-600'
          >
            <Handbag />
            <p>Products</p>
          </Link>
        </div>
        <div className='flex items-center justify-center mt-auto'>
          <Link
            href='/'
            className='flex items-center justify-start gap-4 w-50 pr-10 pl-4 py-2 rounded-xl cursor-pointer hover:bg-red-200 hover:text-red-600'
          >
            <LogOut />
            <p>Log out</p>
          </Link>
        </div>
      </aside>
      <div className='mx-auto w-full'>
        <header className='flex items-center justify-end gap-2 p-4 border-b border-violet-300'>
          <p className='w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center'>A</p>
          <div>
            <p className='font-bold'>{user.role}</p>
            <p className='text-gray-500'>{user.email}</p>
          </div>
        </header>
        <main className='p-5'>{children}</main>
      </div>
    </div>
  );
}
