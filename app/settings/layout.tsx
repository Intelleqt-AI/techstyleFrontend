'use client';

import { type ReactNode } from 'react';
import SettingsSidebar from '@/components/settings/sidebar';

type NavItem = {
  title: string;
  href: string;
  icon: any;
  badge?: string;
};

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-[240px,1fr] gap-4 md:gap-8">
          <aside className="rounded-lg border bg-white">
            <SettingsSidebar />
          </aside>
          <main className="space-y-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
