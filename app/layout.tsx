"use client";

import { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/Providers";
import PrivateRoute from "@/supabase/PrivateRoute";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TopBar } from "@/components/top-bar";
// import TopBar from "@/components/topBar";
import { usePathname } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

const PUBLIC_ROUTES = ["/login", "/register"];

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_ROUTES.includes(pathname);

  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-gray-900 antialiased`}>
        <Providers>
          {isPublic ? (
            <>{children}</>
          ) : (
            <PrivateRoute>
              <SidebarProvider defaultOpen={true}>
                <div className="flex min-h-screen w-full bg-white">
                  <AppSidebar />
                  <div className="flex-1 flex flex-col min-w-0 bg-white">
                    <TopBar />
                    <main className="flex-1 bg-gray-50 overflow-auto">
                      {children}
                    </main>
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
