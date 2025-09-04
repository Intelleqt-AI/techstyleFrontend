'use client';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { fetchOnlyProject } from '@/supabase/API';
import { useQuery } from '@tanstack/react-query';

export function BreadcrumbBar() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  // Project ID only if first segment is "projects"
  const projectID = segments[0] === 'projects' ? segments[1] : null;

  // Fetch project data if projectID exists
  const { data: projectData } = useQuery({
    queryKey: ['projectsOnlyProject', projectID],
    queryFn: () => fetchOnlyProject({ projectID }),
    enabled: !!projectID,
  });

  const getBreadcrumbs = () => {
    if (segments.length === 0) return [{ label: 'Dashboard', href: '/' }];

    const breadcrumbs: { label: string; href: string }[] = [];

    // --- First segment ---
    const firstSegment = segments[0];
    switch (firstSegment) {
      case 'home':
        breadcrumbs.push({ label: 'Home', href: '/home' });
        break;
      case 'crm':
        breadcrumbs.push({ label: 'CRM', href: '/crm' });
        break;
      case 'projects':
        breadcrumbs.push({ label: 'Projects', href: '/projects' });
        // --- Second segment (project ID → project name) ---
        if (segments[1]) {
          breadcrumbs.push({
            label: projectData?.name || 'Loading...',
            href: `/projects/${segments[1]}`,
          });
        }
        break;
      case 'library':
        breadcrumbs.push({ label: 'Library', href: '/library' });
        break;
      case 'calendar':
        breadcrumbs.push({ label: 'Calendar', href: '/calendar' });
        break;
      case 'finance':
        breadcrumbs.push({ label: 'Finance', href: '/finance' });
        break;
      case 'reports':
        breadcrumbs.push({ label: 'Reports', href: '/reports' });
        break;
      case 'settings':
        breadcrumbs.push({ label: 'Settings', href: '/settings' });
        break;
      default:
        breadcrumbs.push({ label: firstSegment, href: `/${firstSegment}` });
    }

    // --- Handle remaining segments (2nd, 3rd, 4th, etc.) ---
    // For projects route, start from index 2 since we already handled the project name
    // For other routes, start from index 1 since we only handled the first segment
    const startIndex = firstSegment === 'projects' ? 2 : 1;

    for (let i = startIndex; i < segments.length; i++) {
      const seg = segments[i];
      breadcrumbs.push({
        label: seg,
        href: '/' + segments.slice(0, i + 1).join('/'),
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.href} className="flex items-center space-x-2">
          {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
          <Link
            href={crumb.href}
            className={index === breadcrumbs.length - 1 ? 'text-gray-900 font-medium capitalize' : 'text-gray-600 capitalize'}
          >
            {crumb.label}
          </Link>
        </div>
      ))}
    </nav>
  );
}
