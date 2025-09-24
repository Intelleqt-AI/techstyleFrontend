'use client';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { fetchOnlyProject, getInvoices, getPurchaseOrder } from '@/supabase/API';
import { useQuery } from '@tanstack/react-query';
import useUsers from '@/hooks/useUsers';

export function BreadcrumbBar() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
  const { users } = useUsers();

  // Project ID only if first segment is "projects"
  const projectID = segments[0] === 'projects' ? segments[1] : null;

  // Fetch project data if projectID exists
  const { data: projectData } = useQuery({
    queryKey: ['project', projectID],
    queryFn: () => fetchOnlyProject({ projectID }),
    enabled: !!projectID,
  });
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['pruchaseOrder'],
    queryFn: getPurchaseOrder,
  });
  const {
    data: InvoiceData,
    isLoading: InvoiceLoading,
    refetch: InvoiceRefetch,
  } = useQuery({
    queryKey: ['invoices'],
    queryFn: getInvoices,
  });

  const getBreadcrumbs = () => {
    if (segments.length === 0) return [{ label: 'Dashboard', href: '/' }];

    const breadcrumbs: { label: string; href: string }[] = [];
    const decodeSeg = (s: string) => {
      try {
        return decodeURIComponent(s);
      } catch (e) {
        return s;
      }
    };
    const firstSegment = segments[0];

    // --- First segment handling ---
    switch (firstSegment) {
      case 'home':
        breadcrumbs.push({ label: 'Home', href: '/home' });
        break;
      case 'crm':
        breadcrumbs.push({ label: 'CRM', href: '/crm' });
        break;
      case 'projects':
        breadcrumbs.push({ label: 'Projects', href: '/projects' });
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
        breadcrumbs.push({ label: decodeSeg(firstSegment), href: `/${firstSegment}` });
    }

    // --- Remaining segments ---
    const startIndex = firstSegment === 'projects' ? 2 : 1;

    for (let i = startIndex; i < segments.length; i++) {
      const rawSeg = segments[i];
      const seg = decodeSeg(rawSeg);
      let label = seg;

      // Special case: /reports/productivity/:userID
      if (firstSegment === 'reports' && segments[1] === 'productivity' && i === 2) {
        const user = users?.data?.find(u => u.id === rawSeg);
        label = user ? user.name : 'Loading..';
      }

      if (firstSegment === 'finance' && segments[1] === 'purchase-order' && i === 2) {
        const PoNumber = data?.data?.find(u => u.id === rawSeg);
        label = PoNumber ? PoNumber.poNumber : 'Loading..';
      }

      if (firstSegment === 'finance' && segments[1] === 'invoices' && i === 2) {
        const InNumber = InvoiceData?.data?.find(u => u.id === rawSeg);
        label = InNumber ? InNumber.inNumber : 'Create Invoice';
      }

      // If the segment is 'folders', link to its parent (e.g., /projects/:id/docs)
      const href = rawSeg === 'folders' ? '/' + segments.slice(0, i).join('/') : '/' + segments.slice(0, i + 1).join('/');

      breadcrumbs.push({
        label,
        href,
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
