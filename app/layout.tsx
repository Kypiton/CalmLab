import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  metadataBase: new URL('https://calmlabshop.com'),

  title: {
    default: 'CalmLab — Wellness Supplements Store',
    template: '%s | CalmLab',
  },

  description:
    'CalmLab is a modern e-commerce store for wellness supplements, vitamins, recovery, sleep, focus and relaxation products.',

  openGraph: {
    title: 'CalmLab — Wellness Supplements Store',
    description:
      'A modern e-commerce store for wellness supplements, vitamins, recovery, sleep, focus and relaxation products.',
    url: 'https://calmlabshop.com',
    siteName: 'CalmLab',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CalmLab wellness supplements store',
      },
    ],
    type: 'website',
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      suppressHydrationWarning
      lang='en'
      className={cn('', 'antialiased', 'font-sans', geist.variable)}
    >
      <body className='bg-[#eef7f1]' suppressHydrationWarning>
        <main>{children}</main>
        <Toaster />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
