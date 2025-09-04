'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, Filter, Download } from 'lucide-react';
import { SortIndicator } from '@/components/sort-indicator';
import { exportToCSV } from '@/lib/export-csv';
import { ChartCard } from '@/components/reports/chart-card';
import { PeriodFilter, type Period } from '@/components/reports/period-filter';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import useUsers from '@/hooks/useUsers';
import { useQuery } from '@tanstack/react-query';
import { fetchOnlyProject, getTimeTracking } from '@/supabase/API';

type Member = {
  name: string;
  role: string;
  hours: number;
  billableHours: number;
  utilisation: number;
  tasksCompleted: number;
};

function getFormattedTime(tasks, range = 'month') {
  if (!Array.isArray(tasks)) return '0.00';

  const now = new Date();

  let startDate, endDate;

  if (range === 'month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  } else if (range === 'quarter') {
    const currentQuarter = Math.floor(now.getMonth() / 3); // 0 = Q1, 1 = Q2, etc.
    startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
    endDate = new Date(now.getFullYear(), currentQuarter * 3 + 3, 0, 23, 59, 59, 999);
  } else if (range === 'year') {
    startDate = new Date(now.getFullYear(), 0, 1);
    endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
  } else {
    return '0.00'; // fallback for invalid range
  }

  const totalMs = tasks.reduce((total, task) => {
    if (!Array.isArray(task.session)) return total;

    const sessionTime = task.session.reduce((sum, session) => {
      const sessionDate = new Date(session.date);
      if (!isNaN(sessionDate) && sessionDate >= startDate && sessionDate <= endDate && typeof session.totalTime === 'number') {
        return sum + session.totalTime;
      }
      return sum;
    }, 0);

    return total + sessionTime;
  }, 0);

  const totalHours = totalMs / (1000 * 60 * 60);
  return totalHours.toFixed(2);
}

const dataByPeriod: Record<Period, { members: Member[]; weekly: { week: string; hours: number; billable: number }[] }> = {
  month: {
    members: [
      {
        name: 'Sarah Chen',
        role: 'Senior Designer',
        hours: 168,
        billableHours: 148,
        utilisation: 88,
        tasksCompleted: 24,
      },
      {
        name: 'Marcus Rodriguez',
        role: 'Project Manager',
        hours: 172,
        billableHours: 150,
        utilisation: 87,
        tasksCompleted: 31,
      },
      {
        name: 'Emily Watson',
        role: 'Interior Designer',
        hours: 156,
        billableHours: 132,
        utilisation: 85,
        tasksCompleted: 19,
      },
      {
        name: 'David Kim',
        role: 'Design Assistant',
        hours: 164,
        billableHours: 142,
        utilisation: 86,
        tasksCompleted: 22,
      },
    ],
    weekly: [
      { week: 'W1', hours: 160, billable: 138 },
      { week: 'W2', hours: 166, billable: 145 },
      { week: 'W3', hours: 170, billable: 148 },
      { week: 'W4', hours: 164, billable: 139 },
    ],
  },
  quarter: {
    members: [
      {
        name: 'Sarah Chen',
        role: 'Senior Designer',
        hours: 512,
        billableHours: 454,
        utilisation: 89,
        tasksCompleted: 74,
      },
      {
        name: 'Marcus Rodriguez',
        role: 'Project Manager',
        hours: 520,
        billableHours: 456,
        utilisation: 88,
        tasksCompleted: 88,
      },
      {
        name: 'Emily Watson',
        role: 'Interior Designer',
        hours: 474,
        billableHours: 402,
        utilisation: 85,
        tasksCompleted: 63,
      },
      {
        name: 'David Kim',
        role: 'Design Assistant',
        hours: 498,
        billableHours: 429,
        utilisation: 86,
        tasksCompleted: 70,
      },
    ],
    weekly: [
      { week: 'W1', hours: 160, billable: 140 },
      { week: 'W2', hours: 168, billable: 147 },
      { week: 'W3', hours: 172, billable: 150 },
      { week: 'W4', hours: 166, billable: 144 },
      { week: 'W5', hours: 170, billable: 148 },
      { week: 'W6', hours: 169, billable: 147 },
      { week: 'W7', hours: 173, billable: 151 },
      { week: 'W8', hours: 165, billable: 142 },
      { week: 'W9', hours: 171, billable: 149 },
      { week: 'W10', hours: 168, billable: 146 },
      { week: 'W11', hours: 170, billable: 148 },
      { week: 'W12', hours: 167, billable: 145 },
    ],
  },
  year: {
    members: [
      {
        name: 'Sarah Chen',
        role: 'Senior Designer',
        hours: 2024,
        billableHours: 1781,
        utilisation: 88,
        tasksCompleted: 301,
      },
      {
        name: 'Marcus Rodriguez',
        role: 'Project Manager',
        hours: 2048,
        billableHours: 1796,
        utilisation: 88,
        tasksCompleted: 344,
      },
      {
        name: 'Emily Watson',
        role: 'Interior Designer',
        hours: 1940,
        billableHours: 1650,
        utilisation: 85,
        tasksCompleted: 255,
      },
      {
        name: 'David Kim',
        role: 'Design Assistant',
        hours: 1985,
        billableHours: 1703,
        utilisation: 86,
        tasksCompleted: 280,
      },
    ],
    weekly: Array.from({ length: 12 }).map((_, i) => {
      const hours = 165 + Math.round(Math.sin(i) * 6);
      const billable = Math.round(hours * 0.87);
      return { week: `M${i + 1}`, hours, billable };
    }),
  },
};

function formatPercent(n: number) {
  return `${n}%`;
}

export default function ProductivityReportsPage() {
  const [period, setPeriod] = useState<Period>('month');
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | 'all'>('all');
  const [sortKey, setSortKey] = useState<keyof Member>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const { users, isLoading: usersLoading } = useUsers();

  const { data: trackingData, isLoading: trackingLoading } = useQuery({
    queryKey: ['Time Tracking'],
    queryFn: getTimeTracking,
  });

  // Projects
  const {
    data: project,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['projects'],
    queryFn: () => fetchOnlyProject({ projectID: null }),
  });

  const rawMembers = dataByPeriod[period].members;
  const weekly = dataByPeriod[period].weekly;

  const kpis = useMemo(() => {
    const totalHour = getFormattedTime(trackingData?.data, period);
    const totalBillable = rawMembers.reduce((sum, m) => sum + m.billableHours, 0);
    const avgUtil = Math.round(rawMembers.reduce((sum, m) => sum + m.utilisation, 0) / rawMembers.length);
    const totalTasks = rawMembers.reduce((sum, m) => sum + m.tasksCompleted, 0);
    return [
      { label: 'Avg Utilisation', value: formatPercent(0), sub: 'Billable time share' },
      {
        label: 'Hours Logged',
        value: `${totalHour || 0.0}`,
        sub: period === 'month' ? 'This month' : period === 'quarter' ? 'This quarter' : 'This year',
      },
      { label: 'Billable Hours', value: `0`, sub: 'Time billed' },
      { label: 'Tasks Completed', value: `${totalTasks}`, sub: 'All members' },
    ];
  }, [rawMembers, period, trackingLoading]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rawMembers.filter(m => {
      const matchesQuery = !q || m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q);
      const matchesRole = roleFilter === 'all' || m.role === roleFilter;
      return matchesQuery && matchesRole;
    });
  }, [rawMembers, query, roleFilter]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      if (typeof va === 'number' && typeof vb === 'number') return sortDir === 'asc' ? va - vb : vb - va;
      const sa = String(va).toLowerCase();
      const sb = String(vb).toLowerCase();
      return sortDir === 'asc' ? sa.localeCompare(sb) : sb.localeCompare(sa);
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  function onClickSort(key: keyof Member) {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  function doExport() {
    exportToCSV(
      `productivity-${period}.csv`,
      sorted.map(m => ({
        Name: m.name,
        Role: m.role,
        Hours: m.hours,
        'Billable Hours': m.billableHours,
        Utilisation: m.utilisation,
        'Tasks Completed': m.tasksCompleted,
      }))
    );
  }

  return (
    <main className="flex-1 space-y-6 p-6">
      {/* 1) KPI strip */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="text-sm font-medium text-gray-600">{kpi.label}</div>
            <div className="text-xl font-semibold text-gray-900">{kpi.value}</div>
            <div className="text-xs text-gray-500">{kpi.sub}</div>
          </div>
        ))}
      </section>

      {/* 2) Filter row (standardized) */}
      <div className="flex items-center justify-between gap-3">
        <PeriodFilter period={period} onChange={setPeriod} />
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search team..." className="pl-7" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="whitespace-nowrap bg-transparent">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuItem onSelect={e => e.preventDefault()} onClick={() => setRoleFilter('all')}>
                All Roles
              </DropdownMenuItem>
              {['Senior Designer', 'Project Manager', 'Interior Designer', 'Design Assistant'].map(r => (
                <DropdownMenuItem key={r} onSelect={e => e.preventDefault()} onClick={() => setRoleFilter(r)}>
                  {r}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button variant="outline" size="sm" onClick={doExport}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* 3) Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Utilisation Trend" description="Billable share of time by week">
          <ChartContainer
            config={{
              hours: { label: 'Hours', color: 'hsl(var(--chart-3))' },
              billable: { label: 'Billable', color: 'hsl(var(--chart-1))' },
            }}
            className="h-[260px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weekly} margin={{ top: 10, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line type="monotone" dataKey="hours" stroke="var(--color-hours)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="billable" stroke="var(--color-billable)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>

        <ChartCard title="Billable vs Non‑billable" description="Distribution of time by week">
          <ChartContainer
            config={{
              billable: { label: 'Billable', color: 'hsl(var(--chart-1))' },
              nonbillable: { label: 'Non‑billable', color: 'hsl(var(--chart-4))' },
            }}
            className="h-[260px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weekly.map(w => ({
                  week: w.week,
                  billable: w.billable,
                  nonbillable: Math.max(0, w.hours - w.billable),
                }))}
                margin={{ top: 10, right: 16, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="billable" stackId="a" fill="var(--color-billable)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="nonbillable" stackId="a" fill="var(--color-nonbillable)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>
      </div>

      {/* 4) Team Table */}
      <ChartCard title="Team Performance" description="Individual productivity metrics">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="w-[260px] px-4 py-3 text-left text-sm font-medium text-gray-600">
                  <button onClick={() => onClickSort('name')} className="group inline-flex items-center gap-1" aria-label="Sort by member">
                    Member
                    <SortIndicator direction={sortKey === 'name' ? sortDir : null} />
                  </button>
                </th>
                <th className="w-[110px] px-4 py-3 text-left text-sm font-medium text-gray-600">
                  <button onClick={() => onClickSort('hours')} className="group inline-flex items-center gap-1" aria-label="Sort by hours">
                    Hours
                    <SortIndicator direction={sortKey === 'hours' ? sortDir : null} />
                  </button>
                </th>
                <th className="w-[140px] px-4 py-3 text-left text-sm font-medium text-gray-600">
                  <button
                    onClick={() => onClickSort('billableHours')}
                    className="group inline-flex items-center gap-1"
                    aria-label="Sort by billable hours"
                  >
                    Billable Hours
                    <SortIndicator direction={sortKey === 'billableHours' ? sortDir : null} />
                  </button>
                </th>
                <th className="w-[140px] px-4 py-3 text-left text-sm font-medium text-gray-600">
                  <button
                    onClick={() => onClickSort('utilisation')}
                    className="group inline-flex items-center gap-1"
                    aria-label="Sort by utilisation"
                  >
                    Utilisation
                    <SortIndicator direction={sortKey === 'utilisation' ? sortDir : null} />
                  </button>
                </th>
                <th className="w-[120px] px-4 py-3 text-left text-sm font-medium text-gray-600">
                  <button
                    onClick={() => onClickSort('tasksCompleted')}
                    className="group inline-flex items-center gap-1"
                    aria-label="Sort by tasks"
                  >
                    Tasks
                    <SortIndicator direction={sortKey === 'tasksCompleted' ? sortDir : null} />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {sorted.map((m, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="min-w-0">
                      <div className="truncate font-medium text-gray-900">{m.name}</div>
                      <div className="truncate text-xs text-gray-600">{m.role}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-gray-900">{m.hours}</td>
                  <td className="px-4 py-3 tabular-nums text-gray-900">{m.billableHours}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 max-w-24 rounded-full bg-gray-200">
                        <div className="h-2 rounded-full bg-gray-900" style={{ width: `${m.utilisation}%` }} />
                      </div>
                      <span className="text-xs text-gray-900">{m.utilisation}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-gray-900">{m.tasksCompleted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </main>
  );
}
