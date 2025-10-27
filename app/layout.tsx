import { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/lib/Providers';
import { Toaster } from 'sonner';
import UserbackWidget from '@/components/userBack/UserbackWidget';
import { RootLayoutWrapper } from '@/components/layout/RootLayoutWrapper';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-gray-900 antialiased`}>
        <UserbackWidget />
        <Toaster closeButton visibleToasts={3} duration={2000} position="bottom-right" />
        <Providers>
          <RootLayoutWrapper>{children}</RootLayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
