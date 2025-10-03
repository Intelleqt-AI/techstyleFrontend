'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SearchIcon, FilterIcon, Activity, Target, DollarSign, BarChart3, TrendingUp, PieChart } from 'lucide-react';

type ReportTile = {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  tags?: string[];
};

const tiles: ReportTile[] = [
  {
    id: 'productivity',
    title: 'Productivity',
    description: 'Team performance and output metrics',
    href: '/reports/productivity',
    icon: Activity,
    tags: ['team', 'tasks', 'time'],
  },
  {
    id: 'utilisation',
    title: 'Utilisation',
    description: 'Resource allocation and capacity',
    href: '/reports/utilisation',
    icon: Target,
    tags: ['capacity', 'hours'],
  },
  {
    id: 'revenue',
    title: 'Revenue',
    description: 'Income and billing analysis',
    href: '/reports/revenue',
    icon: DollarSign,
    tags: ['finance'],
  },
  { id: 'cost', title: 'Cost', description: 'Expense tracking and analysis', href: '/reports/cost', icon: BarChart3, tags: ['expenses'] },
  {
    id: 'profitability',
    title: 'Profitability',
    description: 'Profit margins and ROI metrics',
    href: '/reports/profitability',
    icon: TrendingUp,
    tags: ['roi', 'margin'],
  },
  {
    id: 'sales',
    title: 'Sales',
    description: 'Pipeline and conversion metrics',
    href: '/reports/sales',
    icon: PieChart,
    tags: ['crm', 'deals'],
  },
];

const quickFilters = ['team', 'finance', 'crm', 'tasks', 'hours'] as const;
type QuickFilter = (typeof quickFilters)[number] | 'all';

export default function ReportsPage() {
  const [query, setQuery] = useState('');
  const [qf, setQf] = useState<QuickFilter>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tiles.filter(t => {
      const matchesQuery =
        !q || t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || (t.tags ?? []).some(tag => tag.includes(q));
      const matchesFilter = qf === 'all' || (t.tags ?? []).includes(qf);
      return matchesQuery && matchesFilter;
    });
  }, [query, qf]);

  useEffect(() => {
    document.title = 'Reports | TechStyles';
  }, []);

  return (
    <main className="flex-1 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Toolbar */}
        <div className="flex w-full items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="relative w-full max-w-sm">
              <SearchIcon className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search reports..."
                aria-label="Search reports"
                className="pl-7"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="whitespace-nowrap">
                  <FilterIcon className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44">
                <DropdownMenuItem onSelect={e => e.preventDefault()} onClick={() => setQf('all')}>
                  All
                </DropdownMenuItem>
                {quickFilters.map(f => (
                  <DropdownMenuItem key={f} onSelect={e => e.preventDefault()} onClick={() => setQf(f)}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right actions kept minimal; the deep actions live inside each report */}
          <div className="flex items-center gap-2" />
        </div>

        {/* Categories grid */}
        <section className="space-y-4">
          <h2 className="text-base font-medium text-gray-900">Report Categories</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filtered.map(family => (
              <Link key={family.id} href={family.href}>
                <Card className="h-full cursor-pointer border-gray-200 transition-all hover:border-gray-300 hover:shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="mb-2 flex items-start justify-between">
                      <family.icon className="h-5 w-5 text-gray-600" />
                    </div>
                    <CardTitle className="text-base font-medium text-gray-900">{family.title}</CardTitle>
                    <CardDescription className="text-sm text-gray-600">{family.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
