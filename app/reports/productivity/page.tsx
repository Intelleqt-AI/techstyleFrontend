'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, Filter, Download, ChevronDown } from 'lucide-react';
import { SortIndicator } from '@/components/sort-indicator';
import { exportToCSV } from '@/lib/export-csv';
import { ChartCard } from '@/components/reports/chart-card';
import { PeriodFilter, type Period } from '@/components/reports/period-filter';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import useUsers from '@/hooks/useUsers';
import { useQuery } from '@tanstack/react-query';
import { fetchOnlyProject, getTimeTracking } from '@/supabase/API';
import useTask from '@/supabase/hook/useTask';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import useUser from '@/hooks/useUser';

// Generate months for the dropdown
const generateMonthOptions = () => {
  const months = [];
  const currentDate = new Date();

  // Generate last 12 months starting from current month going backward
  for (let i = 0; i < 12; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    months.push({
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), // "Aug 2025"
      year: date.getFullYear(),
      month: date.getMonth(),
    });
  }

  return months;
};

type Member = {
  name: string;
  role: string;
  hours: number;
  billableHours: number;
  utilisation: number;
  tasksCompleted: number;
};

// Time Tracker Logged
function getFormattedTime(tasks: any[], range: 'month' | 'quarter' | 'year' = 'month'): string {
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

  const totalMs = tasks.reduce((total: number, task: any) => {
    if (!Array.isArray(task.session)) return total;

    const sessionTime = task.session.reduce((sum: number, session: any) => {
      const sessionDate = new Date(session.date);
      const sessionTimeMs = sessionDate.getTime();
      if (!Number.isNaN(sessionTimeMs) && sessionDate >= startDate && sessionDate <= endDate && typeof session.totalTime === 'number') {
        return sum + session.totalTime;
      }
      return sum;
    }, 0);

    return total + sessionTime;
  }, 0);

  const totalHours = totalMs / (1000 * 60 * 60);
  return totalHours.toFixed(2);
}

// Completed Task
function countDoneTasks(tasks: any[], range: 'month' | 'quarter' | 'year' = 'month') {
  if (!Array.isArray(tasks)) return 0;
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
    return 0;
  }
  return tasks.filter((task: any) => {
    if (task.status !== 'done') return false;
    const createdAt: Date = task.created_at instanceof Date ? task.created_at : new Date(task.created_at);
    return !Number.isNaN(createdAt.getTime()) && createdAt >= startDate && createdAt <= endDate;
  }).length;
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
  const { data: taskData, isLoading: taskLoading } = useTask();
  const [selectedDay, setSelectedDay] = useState(null);
  const [finalUsers, setFinalUsers] = useState<any[]>([]);
  const [customLoading, setCustomLoading] = useState(true);
  type TeamSortKey = 'name' | 'hours' | 'pct' | 'project' | 'task';
  const [teamSortKey, setTeamSortKey] = useState<TeamSortKey>('name');
  const [teamSortDir, setTeamSortDir] = useState<'asc' | 'desc'>('asc');
  const router = useRouter();
  const { user } = useUser();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    // const now = new Date();
    // return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    undefined;
  });
  const monthOptions = generateMonthOptions();
  const selectedMonthLabel = monthOptions.find(option => option.value === selectedMonth)?.label || 'Select Month';

  const handleMonthChange = monthValue => {
    setSelectedMonth(monthValue);
    setIsDropdownOpen(false);
  };

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
    queryKey: ['fetchOnlyProject'],
    queryFn: () => fetchOnlyProject({ projectID: null }),
  });

  const admins = [
    'david.zeeman@intelleqt.ai',
    'roxi.zeeman@souqdesign.co.uk',
    'risalat.shahriar@intelleqt.ai',
    'dev@intelleqt.ai',
    'saif@intelleqt.ai',
  ];

  const handleProfileVisit = (email, id) => {
    if (!id) return;
    if (admins.includes(user?.email)) {
      router.push(`/reports/productivity/${id}?month=${selectedMonth}`);
    } else if (user?.email == email) {
      router.push(`/reports/productivity/${id}?month=${selectedMonth}`);
    } else {
      return;
    }
  };

  // Period-based calculations use getFormattedTime

  function getTrackingByUser(email: string) {
    if (trackingLoading || !trackingData?.data) return [];
    const processedTasks = trackingData.data.filter(item => item.isActive);
    const filterByEmail = processedTasks.filter(item => item.creator == email);
    return filterByEmail;
  }

  const myTaskListCount = (email: string) => {
    const tasks: any[] = (taskData as any)?.data || [];
    return tasks.filter((task: any) => {
      const isAssigned = task.assigned && Array.isArray(task.assigned) && task.assigned.some((assignee: any) => assignee.email == email);
      const isCreator = task.creator == email;
      return isAssigned || isCreator;
    }).length;
  };

  function enrichUsersWithProjectCount(teamUsers: any[], projects: any[], currentPeriod: Period) {
    if (!teamUsers || !projects) return [];
    return teamUsers.map((user: any) => {
      const userTracking = getTrackingByUser(user.email);
      const totalTask = myTaskListCount(user.email);
      const totalTime = getFormattedTime(userTracking, currentPeriod);
      const userEmail = user.email;
      let totalProjects = 0;
      projects.forEach((p: any) => {
        if (p.assigned?.some((assignee: any) => assignee.email == userEmail)) {
          totalProjects++;
        }
      });
      return { ...user, totalProjects, totalTime, totalTask } as any;
    });
  }

  useEffect(() => {
    const usersData = (users as any)?.data ?? [];
    if (!usersData || !project) return;
    setFinalUsers(enrichUsersWithProjectCount(usersData, project, period));
    setCustomLoading(false);
  }, [users, project, period, trackingLoading]);

  function getFormattedTimeForMonth(tasks, selectedYear, selectedMonth) {
    if (!Array.isArray(tasks) || !tasks.length) return '0.00';

    // Ensure month is 0-based: Jan=0, Dec=11
    const firstDay = new Date(selectedYear, selectedMonth, 1, 0, 0, 0, 0);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999);

    const totalMs = tasks.reduce((total, task) => {
      if (!Array.isArray(task.session)) return total;

      const sessionTime = task.session.reduce((sum, session) => {
        const sessionDate = new Date(session.date);

        // Only count sessions within the month with valid totalTime
        if (!isNaN(sessionDate) && sessionDate >= firstDay && sessionDate <= lastDay && typeof session.totalTime === 'number') {
          return sum + session.totalTime;
        }
        return sum;
      }, 0);

      return total + sessionTime;
    }, 0);

    const totalHours = totalMs / (1000 * 60 * 60); // convert ms -> hours
    return totalHours.toFixed(2); // same as original function
  }

  function enrichUsersWithProjectCountForMonth(users, projects, selectedYear, selectedMonth) {
    if (!users || !projects) return [];
    return users.map(user => {
      const userTracking = getTrackingByUser(user.email);
      const totalTime = getFormattedTimeForMonth(userTracking, selectedYear, selectedMonth);
      const userEmail = user.email;
      let totalProjects = 0;
      projects.forEach(project => {
        if (project.assigned?.some(assignee => assignee.email == userEmail)) {
          totalProjects++;
        }
      });
      return {
        ...user,
        totalProjects,
        totalTime,
      };
    });
  }

  // Reactive computation for Team Performance rows so it updates on period change immediately
  const teamUsers = useMemo(() => {
    const usersData = (users as any)?.data ?? [];
    if (!usersData || !project) return [] as any[];
    if (selectedMonth) {
      const [year, month] = selectedMonth.split('-');
      const selectedYear = parseInt(year);
      const selectedMonthIndex = parseInt(month) - 1;
      return enrichUsersWithProjectCountForMonth(usersData, project, selectedYear, selectedMonthIndex);
    }

    return enrichUsersWithProjectCount(usersData, project, period);
  }, [users, project, period, trackingData, taskData, selectedMonth, trackingLoading, taskLoading]);

  const rawMembers = dataByPeriod[period].members;
  const weekly = dataByPeriod[period].weekly;

  const kpis = useMemo(() => {
    const totalHour = getFormattedTime(trackingData?.data ?? [], period);
    const totalBillable = rawMembers.reduce((sum, m) => sum + m.billableHours, 0);
    const avgUtil = Math.round(rawMembers.reduce((sum, m) => sum + m.utilisation, 0) / rawMembers.length);
    const totalTasks = countDoneTasks(((taskData as any)?.data ?? []) as any[], period);
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
  }, [rawMembers, period, trackingLoading, taskLoading]);

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

  const onPeriodChange = e => {
    setPeriod(e);
    setSelectedMonth(undefined);
  };

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
        <PeriodFilter period={period} onChange={onPeriodChange} />
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
              Billable: { label: 'Billable', color: 'hsl(var(--chart-1))' },
              Nonbillable: { label: 'Non‑billable', color: 'hsl(var(--chart-4))' },
            }}
            className="h-[260px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weekly.map(w => ({
                  week: w.week,
                  Billable: w.billable,
                  Nonbillable: Math.max(0, w.hours - w.billable),
                }))}
                margin={{ top: 10, right: 16, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend formatter={(value, entry) => <span style={{ color: '#333' }}>{value}</span>} />

                <Bar dataKey="Billable" stackId="a" fill="#837e72" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Nonbillable" stackId="a" fill="#efeae2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>
      </div>

      {/* Team Member Performance (from provided page data) */}
      <ChartCard title="Team Performance" description="Individual productivity metrics">
        <div className="mb-4" />

        <div className="flex justify-end items-center mb-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[180px] bg-white flex justify-between items-center">
                {selectedMonthLabel}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-[180px] bg-white max-h-60 overflow-y-auto">
              {monthOptions.map(option => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handleMonthChange(option.value)}
                  className={selectedMonth === option.value ? 'bg-gray-100 ' : ''}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="w-[260px] px-4 py-3 text-left text-sm font-medium text-gray-600">
                  <button
                    onClick={() => {
                      setTeamSortKey('name');
                      setTeamSortDir(d => (teamSortKey === 'name' ? (d === 'asc' ? 'desc' : 'asc') : 'asc'));
                    }}
                    className="group inline-flex items-center gap-1"
                    aria-label="Sort by member"
                  >
                    Member
                    <SortIndicator direction={teamSortKey === 'name' ? teamSortDir : null} />
                  </button>
                </th>
                <th className="w-[140px] px-4 py-3 text-left text-sm font-medium text-gray-600">
                  {/* Active Projects */}
                  <button
                    onClick={() => {
                      setTeamSortKey('project');
                      setTeamSortDir(d => (teamSortKey === 'project' ? (d === 'asc' ? 'desc' : 'asc') : 'asc'));
                    }}
                    className="group inline-flex items-center gap-1"
                    aria-label="Sort by member"
                  >
                    Active Projects
                    <SortIndicator direction={teamSortKey === 'project' ? teamSortDir : null} />
                  </button>
                </th>
                <th className="w-[140px] px-4 py-3 text-left text-sm font-medium text-gray-600">
                  <button
                    onClick={() => {
                      setTeamSortKey('hours');
                      setTeamSortDir(d => (teamSortKey === 'hours' ? (d === 'asc' ? 'desc' : 'asc') : 'asc'));
                    }}
                    className="group inline-flex items-center gap-1"
                    aria-label="Sort by hours"
                  >
                    Hours
                    <SortIndicator direction={teamSortKey === 'hours' ? teamSortDir : null} />
                  </button>
                </th>
                {/* <th className="w-[110px] px-4 py-3 text-left text-sm font-medium text-gray-600">Goal</th> */}
                <th className="w-[140px] px-4 py-3 text-left text-sm font-medium text-gray-600">
                  <button
                    onClick={() => {
                      setTeamSortKey('pct');
                      setTeamSortDir(d => (teamSortKey === 'pct' ? (d === 'asc' ? 'desc' : 'asc') : 'asc'));
                    }}
                    className="group inline-flex items-center gap-1"
                    aria-label="Sort by percent"
                  >
                    % of Goal
                    <SortIndicator direction={teamSortKey === 'pct' ? teamSortDir : null} />
                  </button>
                </th>
                <th className="w-[140px] px-4 py-3 text-left text-sm font-medium text-gray-600">Billable Hours</th>
                <th className="w-[140px] px-4 py-3 text-left text-sm font-medium text-gray-600">
                  <button
                    onClick={() => {
                      setTeamSortKey('task');
                      setTeamSortDir(d => (teamSortKey === 'task' ? (d === 'asc' ? 'desc' : 'asc') : 'asc'));
                    }}
                    className="group inline-flex items-center gap-1"
                    aria-label="Sort by Task"
                  >
                    Task
                    <SortIndicator direction={teamSortKey === 'task' ? teamSortDir : null} />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {usersLoading || trackingLoading || (teamUsers.length === 0 && customLoading)
                ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3 whitespace-nowrap">
                          <Skeleton className="h-5 w-[80px] bg-gray-200" />
                        </td>
                      ))}
                    </tr>
                  ))
                : (() => {
                    const goalHours = period === 'month' ? 40 : period === 'quarter' ? 120 : 480;
                    const rows = (teamUsers ?? []).map((member: any) => {
                      const hours = parseFloat(member.totalTime || '0') || 0;
                      const pct = Math.round((hours / goalHours) * 100);
                      const project = Number(member.totalProjects || 0);
                      const task = Number(member.totalTask || 0);
                      return { member, project, task, hours, pct };
                    });
                    rows.sort((a, b) => {
                      const dir = teamSortDir === 'asc' ? 1 : -1;
                      if (teamSortKey === 'name') return dir * String(a.member.name ?? '').localeCompare(String(b.member.name ?? ''));
                      if (teamSortKey === 'hours') return dir * (a.hours - b.hours);
                      if (teamSortKey === 'project') return dir * (a.project - b.project);
                      if (teamSortKey === 'task') return dir * (a.task - b.task);
                      return dir * (a.pct - b.pct);
                    });
                    return rows.map(({ member, hours, pct }, index: number) => {
                      const badgeClass =
                        pct >= 100
                          ? 'bg-[#efeae2] border border-[#837e72] text-[#837e72]'
                          : pct >= 95
                          ? 'border bg-[#FFE699] text-gray-800 border-[#FFCA28]'
                          : 'bg-gray-100 border border-gray-200 text-gray-600';
                      return (
                        <tr
                          onClick={() => handleProfileVisit(member.email, member.id)}
                          key={member.id || index}
                          className="border-b cursor-pointer border-gray-100 hover:bg-gray-50"
                        >
                          <td className="px-4 py-3">
                            <div className="min-w-0">
                              <div className="truncate font-medium text-gray-900">{member.name}</div>
                              <div className="truncate text-xs text-gray-600">{member.email}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3 tabular-nums text-gray-900 text-left">{member.totalProjects}</td>
                          <td className="px-4 py-3 tabular-nums text-gray-900 text-left">
                            {hours > 0 && hours < 1 ? '1' : Math.floor(hours)}
                          </td>
                          {/* <td className="px-4 py-3 tabular-nums text-gray-900 text-left">40h</td> */}
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${badgeClass}`}>{pct}%</span>
                          </td>
                          <td className="px-4 py-3 tabular-nums text-gray-900 text-left">0</td>
                          <td className="px-4 py-3 tabular-nums text-gray-900 text-left">{member?.totalTask}</td>
                        </tr>
                      );
                    });
                  })()}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </main>
  );
}
