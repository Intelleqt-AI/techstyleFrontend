'use client';

import { Clock, Pause, Square, ChevronDown, Calendar, ChartBar, DollarSign, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HomeNav } from '@/components/home-nav';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTimeTracking, ModifyTimeTracker } from '@/supabase/API';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import useUser from '@/hooks/useUser';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import useProjects from '@/supabase/hook/useProject';

type Day = { day: string; hours: number };

const daily: Day[] = [
  { day: 'Mon', hours: 6.5 },
  { day: 'Tue', hours: 8 },
  { day: 'Wed', hours: 7.5 },
  { day: 'Thu', hours: 5.5 },
  { day: 'Fri', hours: 6 },
  { day: 'Sat', hours: 2 },
  { day: 'Sun', hours: 0 },
];

// earthy accent for bars
const olive = '#6c7f57';
const oliveDeep = '#4b5d39';

const formatTime = ms => {
  const hours = Math.floor(ms / (1000 * 60 * 60))
    .toString()
    .padStart(2, '0');
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor((ms % (1000 * 60)) / 1000)
    .toString()
    .padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

// For Today
function getFormattedTimeForToday(tasks) {
  const today = new Date();
  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);

  return tasks
    .reduce((totalHours, task) => {
      // 1. Check if task was worked on today
      const taskDate = new Date(task.timerStart);
      if (taskDate < todayStart || taskDate > todayEnd) {
        return totalHours;
      }

      // 2. Calculate time from sessions
      let sessionTime = 0;
      if (Array.isArray(task.session)) {
        sessionTime = task.session.reduce((sum, session) => {
          const sessionDate = new Date(session.date);
          if (sessionDate >= todayStart && sessionDate <= todayEnd) {
            if (session.endTime) {
              // Completed session - always count
              return sum + (Number(session.endTime) - Number(session.startTime));
            } else if (session.startTime && task.isActive && !task.isPaused) {
              // Active session - count current duration
              return sum + (Date.now() - Number(session.startTime));
            }
          }
          return sum;
        }, 0);
      }

      // 3. Add the base totalWorkTime for paused/completed tasks
      let additionalTime = 0;
      if (task.totalWorkTime && (task.isPaused || !task.isActive)) {
        additionalTime = Number(task.totalWorkTime);
      }

      // 4. Convert to hours and add to total
      const taskHours = (sessionTime + additionalTime) / (1000 * 60 * 60);
      return totalHours + taskHours;
    }, 0)
    .toFixed(1);
}

// For Week | Monday - fri
function getFormattedTimeFromMondayToSaturday(tasks) {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  // Get Monday of the current week
  const monday = new Date(now);
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  // Get Friday of the same week
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4); // +4 days = Friday
  friday.setHours(23, 59, 59, 999);

  return tasks
    .reduce((totalHours, task) => {
      // 1. Check if the task was worked on this week (Mon–Fri)
      const taskDate = new Date(task.timerStart);
      if (taskDate < monday || taskDate > friday) {
        return totalHours;
      }

      // 2. Calculate time from sessions
      let sessionTime = 0;
      if (Array.isArray(task.session)) {
        sessionTime = task.session.reduce((sum, session) => {
          const sessionDate = new Date(session.date);
          if (sessionDate >= monday && sessionDate <= friday) {
            if (session.endTime) {
              // Completed session - always count
              return sum + (Number(session.endTime) - Number(session.startTime));
            } else if (session.startTime && task.isActive && !task.isPaused) {
              // Active session - count current duration
              return sum + (Date.now() - Number(session.startTime));
            }
          }
          return sum;
        }, 0);
      }

      // 3. Add saved totalWorkTime for paused/completed tasks
      let additionalTime = 0;
      if (task.totalWorkTime && (task.isPaused || !task.isActive)) {
        additionalTime = Number(task.totalWorkTime);
      }

      // 4. Convert ms → hours and add to total
      const taskHours = (sessionTime + additionalTime) / (1000 * 60 * 60);
      return totalHours + taskHours;
    }, 0)
    .toFixed(1);
}

// For current month
function getFormattedTimeForCurrentMonth(tasks) {
  const now = new Date();

  // First day of month
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  firstDay.setHours(0, 0, 0, 0);

  // Last day of month
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  lastDay.setHours(23, 59, 59, 999);

  return tasks
    .reduce((totalHours, task) => {
      // 1. Check if task was worked on this month
      const taskDate = new Date(task.timerStart);
      if (taskDate < firstDay || taskDate > lastDay) {
        return totalHours;
      }

      // 2. Calculate time from sessions
      let sessionTime = 0;
      if (Array.isArray(task.session)) {
        sessionTime = task.session.reduce((sum, session) => {
          const sessionDate = new Date(session.date);
          if (sessionDate >= firstDay && sessionDate <= lastDay) {
            if (session.endTime) {
              // Completed session - always count
              return sum + (Number(session.endTime) - Number(session.startTime));
            } else if (session.startTime && task.isActive && !task.isPaused) {
              // Active session - count current duration
              return sum + (Date.now() - Number(session.startTime));
            }
          }
          return sum;
        }, 0);
      }

      // 3. Add the base totalWorkTime for paused/completed tasks
      let additionalTime = 0;
      if (task.totalWorkTime && (task.isPaused || !task.isActive)) {
        additionalTime = Number(task.totalWorkTime);
      }

      // 4. Convert to hours and add to total
      const taskHours = (sessionTime + additionalTime) / (1000 * 60 * 60);
      return totalHours + taskHours;
    }, 0)
    .toFixed(1);
}

type Day = {
  day: string;
  hours: number;
};

function getDailyBreakdown(tasks: any[]): Day[] {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  // Calculate Monday of current week
  const monday = new Date(now);
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  // Days we want (Mon → Fri)
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const dailyHours: Day[] = [];

  // Loop only Mon–Fri (5 days)
  for (let i = 0; i < 5; i++) {
    const dayStart = new Date(monday);
    dayStart.setDate(monday.getDate() + i);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const dayName = daysOfWeek[i];

    // Calculate hours for this day
    const dayHours = tasks.reduce((totalHours, task) => {
      const taskDate = new Date(task.timerStart);
      if (taskDate < dayStart || taskDate > dayEnd) {
        return totalHours;
      }

      // Sessions
      let sessionTime = 0;
      if (Array.isArray(task.session)) {
        sessionTime = task.session.reduce((sum, session) => {
          const sessionDate = new Date(session.date);
          if (sessionDate >= dayStart && sessionDate <= dayEnd) {
            if (session.endTime) {
              return sum + (Number(session.endTime) - Number(session.startTime));
            } else if (session.startTime && task.isActive && !task.isPaused) {
              return sum + (Date.now() - Number(session.startTime));
            }
          }
          return sum;
        }, 0);
      }

      // Paused/completed tasks base time
      let additionalTime = 0;
      if (task.totalWorkTime && (task.isPaused || !task.isActive)) {
        additionalTime = Number(task.totalWorkTime);
      }

      return totalHours + (sessionTime + additionalTime) / (1000 * 60 * 60);
    }, 0);

    dailyHours.push({
      day: dayName,
      hours: parseFloat(dayHours.toFixed(1)),
    });
  }

  return dailyHours;
}

export default function HomeTimePage() {
  const [selectedRange, setSelectedRange] = useState('All');
  const [selectedFilter, setSelectedFilter] = useState('Default');
  const [tasks, setTasks] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const queryClient = useQueryClient();
  const { user } = useUser();
  const { data: project, isLoading } = useProjects();

  const { data: trackingData, isLoading: trackingLoading } = useQuery({
    queryKey: ['Time Tracking'],
    queryFn: getTimeTracking,
  });

  const mutation = useMutation({
    mutationFn: ModifyTimeTracker,
    onSuccess: () => {
      queryClient.invalidateQueries(['Time Tracking']);
      toast('Timer Updated');
    },
    onError: () => {
      toast('Error! Try again');
    },
  });

  // Process task data when received
  useEffect(() => {
    if (trackingLoading || !trackingData?.data) return;
    const processedTasks = trackingData.data.sort((a, b) => (a.isPaused === b.isPaused ? 0 : a.isPaused ? 1 : -1));
    const filterByEmail = processedTasks.filter(item => item.creator == user?.email);
    setTasks(filterByEmail);

    // Find the active task
    const active = filterByEmail.find(task => task.isActive && !task.isPaused);
    setActiveTask(active || null);
  }, [trackingData?.data, trackingLoading, user?.email]);

  // Update elapsed time for active task
  useEffect(() => {
    if (!activeTask) {
      setElapsedTime(0);
      return;
    }

    let interval;
    if (activeTask.isActive && !activeTask.isPaused) {
      const startTime = activeTask.startTime || 0;
      const initialTime = startTime === 0 ? activeTask.totalWorkTime : new Date().getTime() - startTime + activeTask.totalWorkTime;

      setElapsedTime(initialTime);

      interval = setInterval(() => {
        const currentTime = new Date().getTime();
        const newTime = startTime === 0 ? activeTask.totalWorkTime : currentTime - startTime + activeTask.totalWorkTime;
        setElapsedTime(newTime);
      }, 1000);
    } else {
      setElapsedTime(activeTask.totalWorkTime || 0);
    }

    return () => clearInterval(interval);
  }, [activeTask]);

  const handlePauseTracking = useCallback(() => {
    if (!activeTask) return;

    const updatedTask = {
      id: activeTask.id, // Ensure ID is included
      isActive: true, // Keep active but paused
      isPaused: true,
      startTime: 0, // Reset start time
      endTime: Date.now(),
      totalWorkTime: activeTask.totalWorkTime + (Date.now() - activeTask.startTime),
      session: activeTask.session.map(s => ({
        ...s,
        ...(s.startTime === activeTask.currentSession
          ? {
              endTime: Date.now(),
              totalWorkTime: Date.now() - s.startTime,
            }
          : {}),
      })),
      currentSession: null,
    };

    mutation.mutate(updatedTask);
  }, [activeTask, mutation]);

  const handleResumeTracking = useCallback(() => {
    if (!activeTask) return;

    const updatedTask = {
      id: activeTask.id,
      isActive: true,
      isPaused: false,
      startTime: Date.now(),
      session: [
        ...activeTask.session,
        {
          date: new Date(),
          startTime: Date.now(),
        },
      ],
      currentSession: Date.now(),
    };

    mutation.mutate(updatedTask);
  }, [activeTask, mutation]);

  const handleStopTracking = useCallback(() => {
    if (!activeTask) return;

    const updatedTask = {
      id: activeTask.id,
      isActive: false,
      isPaused: false,
      startTime: 0,
      endTime: Date.now(),
      totalWorkTime: activeTask.totalWorkTime + (activeTask.isPaused ? 0 : Date.now() - activeTask.startTime),
      session: activeTask.session.map(s => ({
        ...s,
        ...(s.startTime === activeTask.currentSession
          ? {
              endTime: Date.now(),
              totalTime: Date.now() - s.startTime,
            }
          : {}),
      })),
      currentSession: null,
    };

    mutation.mutate(updatedTask);
  }, [activeTask, mutation]);

  const filterTask = useMemo(() => {
    if (!tasks.length) return [];
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const last7Days = new Date();
    last7Days.setDate(currentDate.getDate() - 7);

    // First, filter by date range
    let filteredTasks = [...tasks];

    if (selectedRange === 'Week') {
      filteredTasks = filteredTasks.filter(item => new Date(item.timerStart) >= last7Days);
    } else if (selectedRange === 'Month') {
      filteredTasks = filteredTasks.filter(item => new Date(item.timerStart) >= startOfMonth);
    }

    // Then apply status filters
    if (selectedFilter === 'Active') {
      filteredTasks = filteredTasks.filter(item => item.isActive && !item.isPaused);
    } else if (selectedFilter === 'Paused') {
      filteredTasks = filteredTasks.filter(item => item.isActive && item.isPaused);
    }

    // Sort by `timerStart` (newest first)
    return filteredTasks.sort((a, b) => new Date(b.timerStart) - new Date(a.timerStart));
  }, [selectedRange, selectedFilter, tasks]);

  // Calculate total work time for filtered tasks
  const totalFilteredWorkTime = useMemo(() => {
    if (!filterTask.length) return 0;
    const totalMs = filterTask.reduce((sum, task) => sum + (task.totalWorkTime || 0), 0);
    return totalMs / (1000 * 60 * 60);
  }, [filterTask]);

  const dynamicDaily = getDailyBreakdown(tasks);

  return (
    <main className="space-y-6 p-6">
      {/* Global horizontal nav (stable across Home pages) */}
      <HomeNav />

      {/* Filters */}
      <div className="flex justify-between items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex bg-transparent rounded-xl items-center gap-2">
              {selectedRange} <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36 bg-white">
            <DropdownMenuItem className="cursor-pointer" onClick={() => setSelectedRange('All')}>
              All
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => setSelectedRange('Week')}>
              This Week
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => setSelectedRange('Month')}>
              This Month
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex bg-transparent rounded-xl items-center gap-2">
              <Filter /> {selectedFilter}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36 bg-white">
            <DropdownMenuItem onClick={() => setSelectedFilter('Default')}>Default</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedFilter('Active')}>Active</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedFilter('Paused')}>Paused</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tracker card */}
      {activeTask && (
        <Card className="rounded-2xl">
          <CardContent className="p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[auto,1fr,auto] md:items-center">
              {/* Compact static time display */}
              <div
                aria-label="Elapsed time"
                className="tabular-nums font-bold leading-none tracking-tight text-neutral-900 text-2xl md:text-3xl"
              >
                {formatTime(elapsedTime)}
              </div>

              {/* Context */}
              <div className="space-y-0.5">
                <div className="text-lg font-semibold text-neutral-900">{activeTask?.task?.name || 'Studio Management'}</div>
                <div className="text-sm text-neutral-500">
                  {/* {activeTask?.task?.projectID ? `Project ID: ${activeTask.task.projectID}` : 'Studio Task'} */}
                  {(!isLoading && project.find(p => p.id === activeTask?.task?.projectID)?.name) || 'Studio Task'}
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-start gap-3 md:justify-end">
                <Button
                  variant="outline"
                  className="h-9 rounded-xl bg-transparent px-3.5"
                  onClick={activeTask.isPaused ? handleResumeTracking : handlePauseTracking}
                >
                  <Pause className="mr-2 h-4 w-4" />
                  {activeTask.isPaused ? 'Resume' : 'Pause'}
                </Button>
                <Button variant="outline" className="h-9 rounded-xl bg-transparent px-3.5" onClick={handleStopTracking}>
                  <Square className="mr-2 h-4 w-4" />
                  Stop
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Two-column content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* This Week */}
        <Card className="rounded-2xl">
          <CardContent className="p-5">
            <h2 className="text-base md:text-lg font-semibold text-neutral-900">Time Summary</h2>

            <div className="mt-5 space-y-3.5">
              <div className="flex items-baseline justify-between">
                <span className="text-neutral-600">Today</span>
                <span className="text-2xl font-bold text-neutral-900 md:text-3xl">{getFormattedTimeForToday(tasks)}h</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-neutral-600">This Week</span>
                <span className="text-xl font-semibold md:text-2xl" style={{ color: oliveDeep }}>
                  {getFormattedTimeFromMondayToSaturday(tasks)}h
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-neutral-600">This Month</span>
                <span className="text-xl font-semibold text-neutral-700 md:text-2xl">{getFormattedTimeForCurrentMonth(tasks)}h</span>
              </div>
            </div>

            {/* Daily breakdown */}
            <div className="mt-5">
              <div className="font-medium text-neutral-800">Daily Breakdown</div>
              <ul className="mt-4 space-y-2.5">
                {dynamicDaily.map(d => {
                  // Scale to 8h max, with minimum 2% width so it's always visible
                  const pct = Math.max(2, Math.min(100, (d.hours / 8) * 100));
                  return (
                    <li key={d.day} className="grid grid-cols-[36px,1fr,40px] items-center gap-3">
                      <span className="text-sm text-neutral-600">{d.day}</span>
                      <div className="h-1 rounded-full bg-neutral-200">
                        <div
                          className="h-1 rounded-full"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: olive,
                            transition: 'width 0.5s ease', // Optional: smooth animation
                          }}
                        />
                      </div>
                      <span className="text-sm tabular-nums text-neutral-700">{d.hours}h</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Recent Entries */}
        <Card className="rounded-2xl max-h-[700px] overflow-y-auto">
          <CardContent className="p-5 pt-3">
            <div className="flex items-center justify-between sticky top-0 left-0 bg-white pb-1 pt-3">
              <h2 className="text-base md:text-lg font-semibold text-neutral-900">Recent Entries</h2>
              <a href="#" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
                View All
              </a>
            </div>

            <ul className="mt-5 space-y-3">
              {filterTask.map(task => (
                <li key={task.id} className="flex items-center justify-between rounded-xl border bg-white px-4 py-4">
                  <div className="flex items-start gap-3.5">
                    <div className="flex min-h-10 min-w-10 items-center justify-center rounded-full border bg-neutral-50">
                      <Clock className="h-4 w-4 text-neutral-500" />
                    </div>
                    <div>
                      <div className="text-sm md:text-base font-semibold text-neutral-900">{task?.task?.name || 'Studio Management'}</div>
                      <div className="text-xs md:text-sm text-neutral-500">
                        {(!isLoading && project.find(p => p.id === task?.task?.projectID)?.name) || 'Studio Task'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-sm md:text-base font-semibold text-neutral-900">{formatTime(task?.totalWorkTime)}</div>
                    <div className="text-xs md:text-sm text-neutral-500">
                      {new Date(task?.timerStart).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>

                    <Badge className="rounded-md border-neutral-200 bg-neutral-100 px-3 py-1 text-[11px] font-medium text-neutral-800">
                      {task.isPaused ? 'Paused' : 'Active'}
                    </Badge>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
