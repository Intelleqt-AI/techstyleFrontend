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
import { useParams } from 'next/navigation';
import { getTimeTracking } from '@/supabase/API';
import MemberWeekSummary from '@/components/reports/MemberWeekSummary';
import { ReportBar } from '@/components/reports/ReportBar';

// for month
function getFormattedTimeForCurrentMonth(tasks) {
  const now = new Date();

  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
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
  const totalHours = totalMinutes / 60;

  return totalHours;
}

// function getFormattedTimeForCurrentMonth(tasks) {
//   const year = new Date().getFullYear(); // or hardcode like 2025 if needed
//   const julyStart = new Date(year, 6, 1); // July is month index 6
//   const julyEnd = new Date(year, 7, 0); // August 0th = last day of July
//   julyEnd.setHours(23, 59, 59, 999);

//   const totalMs = tasks.reduce((total, task) => {
//     if (!Array.isArray(task.session)) return total;

//     const sessionTime = task.session.reduce((sum, session) => {
//       const sessionDate = new Date(session.date);
//       if (sessionDate >= julyStart && sessionDate <= julyEnd && typeof session.totalTime === 'number') {
//         return sum + session.totalTime;
//       }
//       return sum;
//     }, 0);

//     return total + sessionTime;
//   }, 0);

//   const totalHours = totalMs / (1000 * 60 * 60);
//   return totalHours;
// }

const ReportSingleMember = () => {
  const { id } = useParams();
  const { users, isLoading } = useUsers();
  const [member, setMember] = useState(null);
  const [tracking, setTracking] = useState([]);

  const { data: trackingData, isLoading: trackingLoading } = useQuery({
    queryKey: ['Time Tracking'],
    queryFn: getTimeTracking,
  });

  useEffect(() => {
    if (isLoading) return;
    setMember(users?.data.filter(item => item.id == id)[0]);
  }, [id, users, isLoading]);

  // Process task data when received
  useEffect(() => {
    if (trackingLoading || !trackingData?.data) return;
    const processedTasks = trackingData.data
      .filter(item => item.isActive)
      .sort((a, b) => (a.isPaused === b.isPaused ? 0 : a.isPaused ? 1 : -1));
    const filterByEmail = processedTasks.filter(item => item.creator == member?.email);
    setTracking(filterByEmail);
  }, [trackingData?.data, trackingLoading, member?.email]);

  return (
    <main className="flex-1 space-y-6 p-6">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Hours Logged</div>
          <div className="text-xl font-semibold text-gray-900">{getFormattedTimeForCurrentMonth(tracking).toFixed(2)}h</div>
          <div className="text-xs text-gray-500">This Month</div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Billable Ratio</div>
          <div className="text-xl font-semibold text-gray-900">0%</div>
          <div className="text-xs text-gray-500">This Month</div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Goal Completion</div>
          <div className="text-xl font-semibold text-gray-900">{Math.floor((getFormattedTimeForCurrentMonth(tracking) / 40) * 100)}%</div>
          <div className="text-xs text-gray-500">This Month</div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Goal Completion</div>
          <div className="text-xl font-semibold text-gray-900">{Math.floor((getFormattedTimeForCurrentMonth(tracking) / 40) * 100)}%</div>
          <div className="text-xs text-gray-500">This Month</div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ReportBar title={'Daily Hours Logged'} onBarClick={null} tracking={tracking} />
        <MemberWeekSummary />
      </div>
      <MemberProjectBreakdown user={member} trackingLoading={trackingLoading} trackingData={trackingData?.data} />
    </main>
  );
};

export default ReportSingleMember;
