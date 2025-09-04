'use client';

import { usePathname } from 'next/navigation';
import { NavPills } from '@/components/shared/nav-pills';

/**
 * Project (selected) sub-nav — order and routes preserved.
 * Only styling is unified to exactly match Projects.
 */
const navItems = [
  { label: 'Overview', href: '' },
  { label: 'Tasks', href: '/tasks' },
  // { label: 'Plan', href: '/plan' },
  { label: 'Messages', href: '/messages' },
  { label: 'Procurement', href: '/procurement' },
  { label: 'Finance', href: '/finance' },
  { label: 'Documents', href: '/docs' }, // Changed from "Docs" to "Documents"
  { label: 'Contractors', href: '/contractors' },
  { label: 'Settings', href: '/settings' },
];

interface ProjectNavProps {
  projectId: string;
}

export function ProjectNav({ projectId }: ProjectNavProps) {
  const pathname = usePathname();
  const items = navItems.map(i => ({
    label: i.label,
    href: `/projects/${projectId}${i.href}`,
  }));

  return <NavPills items={items} activeHref={pathname} />;
}
