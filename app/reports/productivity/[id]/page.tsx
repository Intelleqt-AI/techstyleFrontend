'use client';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Progress } from '@/components/ui/progress';
import useUsers from '@/hooks/useUsers';
import { useQuery } from '@tanstack/react-query';
import { Clock, DollarSign, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import MemberProjectBreakdown from '@/components/reports/MemberProjectBreakdown';
import { useParams, useSearchParams } from 'next/navigation';
import { getTimeTracking } from '@/supabase/API';
import MemberWeekSummary from '@/components/reports/MemberWeekSummary';
import { ReportBar } from '@/components/reports/ReportBar';

const ReportSingleMember = () => {
  const { id } = useParams();
  const { users, isLoading } = useUsers();
  const [member, setMember] = useState(null);
  const [tracking, setTracking] = useState([]);
  const searchParams = useSearchParams();
  const month = searchParams.get('month');
  const [monthTracking, setMonthTracking] = useState([]);

  const { data: trackingData, isLoading: trackingLoading } = useQuery({
    queryKey: ['Time Tracking'],
    queryFn: getTimeTracking,
  });

  function getFormattedTimeForMonth(tasks, monthParam) {
    console.log(tasks);
    const now = new Date();

    let year = now.getFullYear();
    let monthIndex = now.getMonth();

    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
      const [y, m] = monthParam.split('-').map(Number);
      year = y;
      monthIndex = m - 1; // month is 0-based
    }

    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    lastDay.setHours(23, 59, 59, 999);

    const totalMs = tasks.reduce((total, task) => {
      if (!Array.isArray(task.session)) return total;

      const sessionTime = task.session.reduce((sum, session) => {
        const sessionDate = new Date(session.date);
        if (sessionDate >= firstDay && sessionDate <= lastDay && typeof session.totalTime === 'number') {
          return sum + session.totalTime;
        }
        return sum;
      }, 0);

      return total + sessionTime;
    }, 0);

    const totalMinutes = totalMs / (1000 * 60);
    return totalMinutes / 60;
  }

  function getTasksForMonth(tasks, monthParam) {
    const now = new Date();

    let year = now.getFullYear();
    let monthIndex = now.getMonth();

    // Only use monthParam if it matches YYYY-MM
    if (typeof monthParam === 'string' && /^\d{4}-\d{2}$/.test(monthParam)) {
      const [y, m] = monthParam.split('-').map(Number);
      if (!isNaN(y) && !isNaN(m)) {
        year = y;
        monthIndex = m - 1;
      }
    }

    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    lastDay.setHours(23, 59, 59, 999);

    return tasks.filter(
      task =>
        Array.isArray(task.session) &&
        task.session.some(session => {
          const sessionDate = new Date(session.date);
          return sessionDate >= firstDay && sessionDate <= lastDay;
        })
    );
  }

  useEffect(() => {
    if (isLoading) return;
    setMember(users?.data.filter(item => item.id == id)[0]);
  }, [id, users, isLoading]);

  useEffect(() => {
    if (trackingLoading || !trackingData?.data) return;
    const processedTasks = trackingData?.data.sort((a, b) => (a.isPaused === b.isPaused ? 0 : a.isPaused ? 1 : -1));
    const filterByEmail = processedTasks.filter(item => item.creator == member?.email);
    setTracking(filterByEmail);
  }, [trackingData?.data, trackingLoading, member?.email, month]);

  const hoursThisMonth = getFormattedTimeForMonth(tracking, month);
  const goalCompletion = Math.floor((hoursThisMonth / 40) * 100);

  return (
    <main className="flex-1 space-y-6 p-6">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Hours Logged</div>
          <div className="text-xl font-semibold text-gray-900">{hoursThisMonth.toFixed(2)}h</div>
          <div className="text-xs text-gray-500">{month == 'undefined' ? 'This Month' : month}</div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Billable Ratio</div>
          <div className="text-xl font-semibold text-gray-900">0%</div>
          <div className="text-xs text-gray-500">{month == 'undefined' ? 'This Month' : month}</div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Goal Completion</div>
          <div className="text-xl font-semibold text-gray-900">{goalCompletion}%</div>
          <div className="text-xs text-gray-500">{month == 'undefined' ? 'This Month' : month}</div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Goal Completion</div>
          <div className="text-xl font-semibold text-gray-900">{goalCompletion}%</div>
          <div className="text-xs text-gray-500">{month == 'undefined' ? 'This Month' : month}</div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ReportBar month={month} title={'Daily Hours Logged'} onBarClick={null} tracking={tracking} />
        <MemberWeekSummary />
      </div>
      <MemberProjectBreakdown month={month} user={member} trackingLoading={trackingLoading} trackingData={trackingData?.data} />
    </main>
  );
};

export default ReportSingleMember;
