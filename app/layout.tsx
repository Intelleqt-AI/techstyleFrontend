'use client';

import { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/lib/Providers';
import PrivateRoute from '@/supabase/PrivateRoute';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { TopBar } from '@/components/top-bar';
import { usePathname } from 'next/navigation';
import { Toaster } from 'sonner';
import UserbackWidget from '@/components/userBack/UserbackWidget';

const inter = Inter({ subsets: ['latin'] });

const PUBLIC_ROUTES = ['/login', '/register', '/verify-email', '/reset-password'];

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_ROUTES.includes(pathname);

  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-gray-900 antialiased`}>
        <UserbackWidget />
        <Toaster closeButton visibleToasts={3} duration={2000} position="bottom-right" />
        <Providers>
          {isPublic ? (
            <>{children}</>
          ) : (
            <PrivateRoute>
              <SidebarProvider defaultOpen={true}>
                <div className="flex min-h-screen w-full bg-white">
                  <AppSidebar />
                  <div className="flex-1 h-screen flex flex-col min-w-0 bg-white">
                    <TopBar />
                    <main className="flex-1 bg-gray-50 overflow-auto">{children}</main>
                  </div>
                </div>
              </SidebarProvider>
            </PrivateRoute>
          )}
        </Providers>
      </body>
    </html>
  );
}
