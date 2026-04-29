export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-screen bg-[url(/background.png)] bg-center bg-cover bg-no-repeat'>
      {children}
    </div>
  );
}
