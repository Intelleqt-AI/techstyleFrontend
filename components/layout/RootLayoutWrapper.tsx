'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { TopBar } from '@/components/top-bar';
import PrivateRoute from '@/supabase/PrivateRoute';

const PUBLIC_ROUTES = ['/login', '/register', '/verify-email', '/reset-password'];

export function RootLayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_ROUTES.includes(pathname);
  const isPdfRoute = pathname?.includes('/pdf/');

  if (isPublic || isPdfRoute) {
    return <>{children}</>;
  }

  return (
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
  );
}
