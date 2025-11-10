'use client';

import { useState } from 'react';
import { ChartCard } from '@/components/reports/chart-card';
import { PeriodFilter, type Period } from '@/components/reports/period-filter';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Bar, BarChart, Pie, PieChart, Cell } from 'recharts';
import { fetchOnlyProject, getTimeTracking } from '@/supabase/API';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type Member = { name: string; util: number; billable: number; available: number };
type Week = { w: string; util: number };
type Dept = { name: string; value: number };

const datasets: Record<Period, { byMember: Member[]; byWeek: Week[]; mix: { billable: number; nonbillable: number }; byDept: Dept[] }> = {
  month: {
    byMember: [
      { name: 'Sarah', util: 88, billable: 148, available: 168 },
      { name: 'Marcus', util: 87, billable: 150, available: 172 },
      { name: 'Emily', util: 85, billable: 132, available: 156 },
      { name: 'David', util: 86, billable: 142, available: 164 },
    ],
    byWeek: [
      { w: 'W1', util: 86 },
      { w: 'W2', util: 88 },
      { w: 'W3', util: 89 },
      { w: 'W4', util: 85 },
    ],
    mix: { billable: 572, nonbillable: 196 },
    byDept: [
      { name: 'Design', value: 61 },
      { name: 'PM', value: 25 },
      { name: 'Ops', value: 14 },
    ],
  },
  quarter: {
    byMember: [
      { name: 'Sarah', util: 89, billable: 454, available: 512 },
      { name: 'Marcus', util: 88, billable: 456, available: 520 },
      { name: 'Emily', util: 85, billable: 402, available: 474 },
      { name: 'David', util: 86, billable: 429, available: 498 },
    ],
    byWeek: Array.from({ length: 12 }).map((_, i) => ({ w: `W${i + 1}`, util: 85 + ((i % 4) + 1) })),
    mix: { billable: 1741, nonbillable: 261 },
    byDept: [
      { name: 'Design', value: 62 },
      { name: 'PM', value: 24 },
      { name: 'Ops', value: 14 },
    ],
  },
  year: {
    byMember: [
      { name: 'Sarah', util: 88, billable: 1781, available: 2024 },
      { name: 'Marcus', util: 88, billable: 1796, available: 2048 },
      { name: 'Emily', util: 85, billable: 1650, available: 1940 },
      { name: 'David', util: 86, billable: 1703, available: 1985 },
    ],
    byWeek: Array.from({ length: 12 }).map((_, i) => ({ w: `M${i + 1}`, util: 84 + ((i % 3) + 2) })),
    mix: { billable: 6929, nonbillable: 1068 },
    byDept: [
      { name: 'Design', value: 61 },
      { name: 'PM', value: 25 },
      { name: 'Ops', value: 14 },
    ],
  },
};

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-4))', 'hsl(var(--chart-3))', 'hsl(var(--chart-2))'];

export default function UtilisationPage() {
  const [period, setPeriod] = useState<Period>('month');
  const { byMember, byWeek, mix, byDept } = datasets[period];

  const avgUtil = Math.round(byMember.reduce((s, m) => s + m.util, 0) / byMember.length);
  const over = byMember.filter(m => m.util >= 90).length;
  const under = byMember.filter(m => m.util < 80).length;
  const billableShare = Math.round((mix.billable / (mix.billable + mix.nonbillable)) * 100);

  const { data: trackingData, isLoading: trackingLoading } = useQuery({
    queryKey: ['Time Tracking'],
    queryFn: getTimeTracking,
  });

  const {
    data: project,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['fetchOnlyProject'],
    queryFn: () => fetchOnlyProject({ projectID: null }),
  });

  function getFormattedTimeForAllTime(tasks: any[]) {
    if (!tasks) return;

    const totalMs = (tasks as any[])?.reduce((total: number, task: any) => {
      if (!Array.isArray(task.session)) return total;

      const sessionTime = (task.session as any[])?.reduce((sum: number, session: any) => {
        if (typeof session.totalTime === 'number') {
          return sum + session.totalTime;
        }
        return sum;
      }, 0);

      return total + sessionTime;
    }, 0);

    // Convert ms → minutes → hours + minutes
    const totalMinutes = Math.floor(totalMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    // Return formatted string
    return `${hours}h ${minutes}m`;
  }

  function getTrackingByUser() {
    // const filterByEmail = (trackingData as any[])?.filter((item: any) => item.creator == email);
    const filterByEmail = trackingData?.data;
    return filterByEmail;
  }

  function getUserProjectsWithTime(projects: any) {
    // console.log(user, projects);
    if (!projects) return [];
    const userTracking = getTrackingByUser();
    const result: any[] = [];

    // Studio Management tracking
    // const studioTask = (userTracking as any[])?.filter((track: any) => track?.task == null) || [];
    // const totalStudioWorkTime = getFormattedTimeForCurrentMonth(studioTask);

    // if (totalStudioWorkTime) {
    //   result.push({
    //     projectID: null,
    //     projectName: 'Studio Management',
    //     totalTime: totalStudioWorkTime,
    //   });
    // }

    (projects as any[]).forEach((project: any) => {
      // const isAssigned = project.assigned?.some(assignee => assignee.email === userEmail);
      if (true) {
        const projectTracking = (userTracking as any[])?.filter((track: any) => track?.task?.projectID === project.id) || [];
        const totalTime = getFormattedTimeForAllTime(projectTracking);
        if (totalTime) {
          result.push({
            projectID: project.id,
            projectName: project.name || 'Unnamed Project',
            totalTime,
          });
        }
      }
    });

    return result;
  }

  // function logSpecificProjectTotalTime(projects: any) {
  //   const allProjects = getUserProjectsWithTime(projects);
  //   const targetProject = allProjects.find(p => p.projectID === 'fbf5f7d0-7dbc-11f0-95e8-a1a6b244414d');
  //   if (targetProject) {
  //     console.log(`Total time for project "${targetProject.projectName}" (${targetProject.projectID}):`, targetProject.totalTime);
  //   } else {
  //     console.log('Project not found or no time recorded for this project.');
  //   }
  // }

  // logSpecificProjectTotalTime(project);

  console.log(getUserProjectsWithTime(project));

  return (
    <main className="flex-1 space-y-6 p-6">
      {/* 1) KPI strip */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Avg Utilisation</div>
          <div className="text-xl font-semibold text-gray-900">{avgUtil}%</div>
          <div className="text-xs text-gray-500">Across team</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Over‑capacity</div>
          <div className="text-xl font-semibold text-gray-900">{over}</div>
          <div className="text-xs text-gray-500">{'>= 90% utilised'}</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Under‑utilised</div>
          <div className="text-xl font-semibold text-gray-900">{under}</div>
          <div className="text-xs text-gray-500">{'< 80% utilised'}</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Billable Mix</div>
          <div className="text-xl font-semibold text-gray-900">{billableShare}%</div>
          <div className="text-xs text-gray-500">Billable of total hours</div>
        </div>
      </section>

      {/* 2) Filter row */}
      <div className="flex items-center justify-between gap-3">
        <PeriodFilter period={period} onChange={setPeriod} />
      </div>

      {/* 3) Charts (4 sections) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Utilisation Trend" description="Average utilisation by period">
          <ChartContainer config={{ util: { label: 'Utilisation %', color: 'hsl(var(--chart-2))' } }} className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={byWeek} margin={{ top: 10, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="w" tickLine={false} axisLine={false} />
                <YAxis tickFormatter={v => `${v}%`} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line type="monotone" dataKey="util" stroke="var(--color-util)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>

        <ChartCard title="Utilisation by Member" description="Current period">
          <ChartContainer config={{ util: { label: 'Utilisation %', color: 'hsl(var(--chart-2))' } }} className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byMember} margin={{ top: 10, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickFormatter={v => `${v}%`} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="util" fill="var(--color-util)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>

        <ChartCard title="Billable vs Non‑billable" description="Time mix">
          <ChartContainer
            config={{
              billable: { label: 'Billable', color: 'hsl(var(--chart-1))' },
              nonbillable: { label: 'Non‑billable', color: 'hsl(var(--chart-4))' },
            }}
            className="h-[260px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={[
                    { name: 'Billable', value: mix.billable },
                    { name: 'Non‑billable', value: mix.nonbillable },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  innerRadius={54}
                  strokeWidth={0}
                >
                  <Cell fill="var(--color-billable)" />
                  <Cell fill="var(--color-nonbillable)" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>

        <ChartCard title="Capacity by Member" description="Billable vs available hours">
          <ChartContainer
            config={{
              billable: { label: 'Billable', color: 'hsl(var(--chart-1))' },
              available: { label: 'Available', color: 'hsl(var(--chart-3))' },
            }}
            className="h-[260px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={byMember.map(m => ({
                  name: m.name,
                  billable: m.billable,
                  available: m.available - m.billable,
                }))}
                margin={{ top: 10, right: 16, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="billable" stackId="a" fill="var(--color-billable)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="available" stackId="a" fill="var(--color-available)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>
      </div>

      <Card className={cn('border-gray-200 bg-white')}>
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-gray-900">Tracking Breakdown</CardTitle>
              <CardDescription className="text-gray-600">Breakdown of total time spend on projects</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {' '}
          <div className="bg-white  overflow-scroll">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500  ">Project Name</th>
                  <th className="px-6 py-4  text-sm font-medium text-gray-500  ">Hours Logged</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {trackingLoading || isLoading
                  ? //
                    [...Array(2)].map((_, i) => (
                      <tr key={i}>
                        {[...Array(2)].map((_, j) => (
                          <td key={j} className="px-6 py-4 whitespace-nowrap">
                            <Skeleton className="h-5 mx-auto w-[80px] bg-gray-200" />
                          </td>
                        ))}
                      </tr>
                    ))
                  : getUserProjectsWithTime(project)?.map((item: any, index: number) => (
                      <tr key={`${item.date}-${index}`} className="border-b cursor-pointer border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 tabular-nums text-gray-900 text-left">{item?.projectName}</td>
                        <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-700">{item.totalTime}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
