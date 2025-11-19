'use client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchOnlyProject } from '@/supabase/API';
import useTask from '@/supabase/hook/useTask';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, Download } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { downloadExcel } from 'react-export-table-to-excel';
import { ChartCard } from './chart-card';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

const MemberProjectBreakdown = ({ trackingData, trackingLoading, user, month }) => {
  const [trackedProject, setTrackedProject] = useState([]);
  const [customLoading, setCustomLoading] = useState(true);
  const [totalItem, setTotalItem] = useState([]);

  const { data, isLoading: taskLoading } = useTask();
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

  function getFormattedTimeForCurrentMonth(tasks) {
    if (!tasks) return;
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

  function getTrackingByUser(email) {
    const filterByEmail = trackingData?.filter(item => item.creator == email);
    return filterByEmail;
  }

  function logAugustSessions() {
    const tasks = getTrackingByUser(user?.email);
    const monthParam = month; // e.g. "2025-08" or "undefined"
    const now = new Date();

    let year = now.getFullYear();
    let monthIndex = now.getMonth();

    // Use month from query if valid
    if (typeof monthParam === 'string' && /^\d{4}-\d{2}$/.test(monthParam) && monthParam !== 'undefined') {
      const [y, m] = monthParam.split('-').map(Number);
      if (!isNaN(y) && !isNaN(m)) {
        year = y;
        monthIndex = m - 1; // month is 0-based
      }
    }

    const monthStart = new Date(year, monthIndex, 1);
    const monthEnd = new Date(year, monthIndex + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);

    // Collect all valid sessions in chosen month
    const allSessions = tasks
      .flatMap(task =>
        (task.session || []).map(session => ({
          task_id: task?.task?.id || 'Studio Task',
          project_id: task?.task?.projectID || 'Studio Project',
          date: new Date(session.date),
          totalTime: session?.totalTime,
          rate: task?.rate || null,
        }))
      )
      .filter(s => s.date >= monthStart && s.date <= monthEnd);

    // Sort by date
    allSessions.sort((a, b) => a.date - b.date);

    // Format for console
    const formatted = allSessions.map(s => {
      const taskName = data?.data?.find(t => t.id === s.task_id)?.name || s.task_id;
      const projectName = project?.find(p => p.id === s.project_id)?.name || s.project_id;

      return {
        date: s.date.toLocaleDateString('en-GB'), // dd/mm/yyyy
        task_id: taskName,
        project_id: projectName,
        rate: s.rate ? `£${s.rate} p/h` : '-',
        hours: typeof s.totalTime === 'number' ? (s.totalTime / (1000 * 60 * 60)).toFixed(2) : '-',
      };
    });

    return formatted;
  }

  function getUserProjectsWithTime(user, projects) {
    // console.log(user, projects);
    if (!user || !projects) return [];
    const userEmail = user?.email;
    const userTracking = getTrackingByUser(userEmail);
    const result = [];

    // Studio Management tracking
    const studioTask = userTracking?.filter(track => track?.task == null) || [];
    const totalStudioWorkTime = getFormattedTimeForCurrentMonth(studioTask);

    if (totalStudioWorkTime) {
      result.push({
        projectID: null,
        projectName: 'Studio Management',
        totalTime: totalStudioWorkTime,
      });
    }

    projects.forEach(project => {
      // const isAssigned = project.assigned?.some(assignee => assignee.email === userEmail);
      if (true) {
        const projectTracking = userTracking?.filter(track => track?.task?.projectID === project.id) || [];
        const totalTime = getFormattedTimeForCurrentMonth(projectTracking);
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

  useEffect(() => {
    if (trackingLoading || !trackingData || isLoading) return;
    setTrackedProject(getUserProjectsWithTime(user, project));
    setCustomLoading(false);
    setTotalItem(logAugustSessions());
  }, [trackingData, trackingLoading, user, isLoading]);

  const handleExport = () => {
    downloadExcel({
      fileName: 'My_Report',
      sheet: 'Employees Hours',
      tablePayload: {
        header: ['Date', 'Task Name', 'Project Name', 'Hours'],
        body: totalItem.map(item => [item.date, item.task_id, item.project_id, item.hours]),
      },
    });
  };

  return (
    <Card className={cn('border-gray-200 bg-white')}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-base font-semibold text-gray-900">Tracking Breakdown</CardTitle>
        <CardDescription className="text-gray-600">Breakdown of current month</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {' '}
        <div className="bg-white  overflow-scroll">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500  ">Date</th>
                <th className="px-6 py-4  text-sm text-center font-medium text-gray-500  ">Task Name</th>
                <th className="px-6 py-4  text-sm font-medium text-gray-500  ">Project Name</th>
                <th className="px-6 py-4  text-sm font-medium text-gray-500  ">Hours Logged</th>
                <th className="px-6 py-4  text-sm font-medium text-gray-500  ">% of Total Time</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {!totalItem || trackingLoading || customLoading
                ? //
                  [...Array(7)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(5)].map((_, j) => (
                        <td key={j} className="px-6 py-4 whitespace-nowrap">
                          <Skeleton className="h-5 mx-auto w-[80px] bg-gray-200" />
                        </td>
                      ))}
                    </tr>
                  ))
                : totalItem?.map((item, index) => (
                    <tr key={item.name} className="border-b cursor-pointer border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 tabular-nums text-gray-900 text-left">{item?.date}</td>
                      <td className="px-6 py-4  whitespace-nowrap capitalize text-sm text-center text-gray-700">
                        {/* {data?.data?.find(task => task.id == item.task_id)?.name || 'Unknown Task'} */}
                        {item.task_id}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-gray-900 text-center">
                        {/* {project?.find(task => task.id == item.project_id)?.name || 'Unknown Project'} */}
                        {item.project_id}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-700">{item.hours}hrs</td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-700">0</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default MemberProjectBreakdown;
