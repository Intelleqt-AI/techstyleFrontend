import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { TopBar } from '@/components/top-bar';
import { ReactNode } from 'react';
import { Providers } from '@/lib/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Techstyles - Interior Design Management',
  description: 'AI-first business and project management for interior designers',
  generator: 'v0.app',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-gray-900 antialiased`}>
        <Providers>
          <SidebarProvider defaultOpen={true}>
            <div className="flex min-h-screen w-full bg-white">
              <AppSidebar />
              <div className="flex-1 flex flex-col min-w-0 bg-white">
                <TopBar />
                <main className="flex-1 bg-gray-50 overflow-auto">{children}</main>
              </div>
            </div>
          </SidebarProvider>
        </Providers>
      </body>
    </html>
  );
}
