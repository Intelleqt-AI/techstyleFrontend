'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { fetchOnlyProject, getInvoices, getPurchaseOrder } from '@/supabase/API';
import { useQuery } from '@tanstack/react-query';
import useUsers from '@/hooks/useUsers';

export function BreadcrumbBar() {
  const pathname = usePathname();
  const [currentPath, setCurrentPath] = React.useState(pathname);
  React.useEffect(() => {
    setCurrentPath(pathname);
  }, [pathname]);
  const segments = currentPath.split('/').filter(Boolean);
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

      // Handle project-scoped purchase orders: /projects/:projectId/finance/purchase-order/:poId
      if (firstSegment === 'projects' && segments[2] === 'finance' && segments[3] === 'purchase-order' && i === 4) {
        const PoNumber = data?.data?.find(u => String(u.id) === String(rawSeg));
        label = PoNumber ? PoNumber.poNumber : 'Loading..';
      }

      // Handle project-scoped invoices: /projects/:projectId/finance/invoices/:invId
      if (firstSegment === 'projects' && segments[2] === 'finance' && segments[3] === 'invoices' && i === 4) {
        const InNumber = InvoiceData?.data?.find(u => String(u.id) === String(rawSeg));
        label = InNumber ? InNumber.inNumber : 'Loading..';
      }

      // Special case: finance/purchase-order links to /finance
      if (segments[i] === 'purchase-order') {
        const baseUrl = segments[0] === 'projects' ? `/projects/${segments[1]}/finance` : '/finance';
        breadcrumbs.push({
          label: 'Purchase Order',
          href: baseUrl,
        });
        continue;
      }

      // Special case: finance/invoices links to /finance (or project finance when project-scoped)
      if (segments[i] === 'invoices') {
        const baseUrl = segments[0] === 'projects' ? `/projects/${segments[1]}/finance` : '/finance';
        breadcrumbs.push({
          label: 'Invoices',
          href: baseUrl,
        });
        continue;
      }

      if (firstSegment === 'finance' && segments[1] === 'invoices' && i === 2) {
        const InNumber = InvoiceData?.data?.find(u => String(u.id) === String(rawSeg));
        label = InNumber ? InNumber.inNumber : 'Create Invoice';
      }

      // If the segment is 'folders', link to its parent (e.g., /projects/:id/docs)
      const href = rawSeg === 'folders' ? '/' + segments.slice(0, i).join('/') : '/' + segments.slice(0, i + 1).join('/');

      breadcrumbs.push({
        label,
        href,
      });
    }

    // Final pass: if URL ends with purchase-order/:id, replace the last breadcrumb label with PO number when available
    try {
      const poMatch = currentPath.match(/purchase-order\/([^/]+)\/?$/);
      if (poMatch) {
        const poId = poMatch[1];
        const found = data?.data?.find((u: any) => String(u.id) === String(poId));
        if (found) {
          // Replace the last breadcrumb label with the poNumber
          if (breadcrumbs.length > 0) {
            breadcrumbs[breadcrumbs.length - 1].label = found.poNumber || breadcrumbs[breadcrumbs.length - 1].label;
          }
          // Ensure the 'Purchase Order' crumb (if present) links to project finance
          const poCrumbIndex = breadcrumbs.findIndex(b => String(b.label).toLowerCase() === 'purchase order');
          if (poCrumbIndex !== -1) {
            const baseUrl = segments[0] === 'projects' ? `/projects/${segments[1]}/finance` : '/finance';
            breadcrumbs[poCrumbIndex].href = baseUrl;
          }
        }
      }
      // Final pass for invoices
      const invMatch = currentPath.match(/invoices\/([^/]+)\/?$/);
      if (invMatch) {
        const invId = invMatch[1];
        const foundInv = InvoiceData?.data?.find((u: any) => String(u.id) === String(invId));
        if (foundInv && breadcrumbs.length > 0) {
          breadcrumbs[breadcrumbs.length - 1].label = foundInv.inNumber || breadcrumbs[breadcrumbs.length - 1].label;
        }
      }
    } catch (e) {
      // non-fatal
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <nav key={currentPath} className="flex items-center space-x-2 text-sm text-gray-600">
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
