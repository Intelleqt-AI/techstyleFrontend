'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import useUser from './hook/useUser';

const PUBLIC_ROUTES = ['/login', '/register'];

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const isPublic = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    if (!isLoading && !user?.email && !isPublic) {
      router.push('/login');
    }
  }, [isLoading, user, isPublic, router]);

  if (isLoading) {
    return <div className="flex justify-center p-4">Loading session...</div>;
  }

  if (!user?.email && !isPublic) {
    return null;
  }

  return <>{children}</>;
}
