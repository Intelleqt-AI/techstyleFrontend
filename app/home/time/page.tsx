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
import Modal from 'react-modal';
import { Switch } from '@/components/ui/switch';
import { Label } from 'recharts';
import { Input } from '@/components/ui/input';

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

// const formatTime = (ms) => {
//   const hours = Math.floor(ms / (1000 * 60 * 60))
//     .toString()
//     .padStart(2, "0");
//   const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
//     .toString()
//     .padStart(2, "0");
//   const seconds = Math.floor((ms % (1000 * 60)) / 1000)
//     .toString()
//     .padStart(2, "0");
//   return `${hours}:${minutes}:${seconds}`;
// };

// Also update the formatTime function to handle NaN/undefined cases:
const formatTime = ms => {
  // Handle NaN, undefined, or null values
  if (isNaN(ms) || ms === null || ms === undefined) {
    return '00:00:00';
  }

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, '0');
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor(totalSeconds % 60)
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
  const [modalOpen, setModalOpen] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTimerActive, setIsTimerActive] = useState(false);

  const queryClient = useQueryClient();
  const { user } = useUser();
  const { data: project, isLoading } = useProjects();

  const { data: trackingData, isLoading: trackingLoading } = useQuery({
    queryKey: ['Time Tracking'],
    queryFn: getTimeTracking,
  });

  // const mutation = useMutation({
  //   mutationFn: ModifyTimeTracker,
  //   onSuccess: () => {
  //     queryClient.invalidateQueries(["Time Tracking"]);
  //     toast("Timer Updated");
  //   },
  //   onError: () => {
  //     toast("Error! Try again");
  //   },
  // });

  const mutation = useMutation({
    mutationFn: ModifyTimeTracker,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['Time Tracking']);
      toast('Timer Updated');
      closeModal();
      // Update local state for the specific task
      setTasks(prev => prev.map(task => (task.id === variables.id ? { ...task, ...variables } : task)));
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
        ...(s.startTime == activeTask.currentSession
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
    setSelectedTask(updatedTask);
    // const { task, ...taskWithoutTaskKey } = updatedTask;
    // mutation.mutate(taskWithoutTaskKey);
    mutation.mutate(updatedTask);
  }, [activeTask, mutation]);

  const handleResumeTrackingModal = useCallback(() => {
    if (!selectedTask) return;

    const updatedTask = {
      id: selectedTask.id,
      isActive: true,
      isPaused: false,
      startTime: Date.now(),
      session: [
        ...selectedTask.session,
        {
          date: new Date(),
          startTime: Date.now(),
        },
      ],
      currentSession: Date.now(),
    };

    mutation.mutate(updatedTask, {
      onSuccess: () => {
        setSelectedTask(updatedTask);
        // Also update the active task if this is the active one
        if (activeTask && activeTask.id === selectedTask.id) {
          setActiveTask(updatedTask);
        }
      },
    });
  }, [selectedTask, mutation, activeTask]);

  const handlePauseTrackingModal = useCallback(() => {
    if (!selectedTask) return;

    const updatedTask = {
      id: selectedTask.id,
      isActive: true,
      isPaused: true,
      startTime: 0,
      endTime: Date.now(),
      totalWorkTime: selectedTask.totalWorkTime + (Date.now() - selectedTask.startTime),
      session: selectedTask.session.map(s => ({
        ...s,
        ...(s.startTime === selectedTask.currentSession
          ? {
              endTime: Date.now(),
              totalTime: Date.now() - s.startTime,
            }
          : {}),
      })),
      currentSession: null,
    };

    mutation.mutate(updatedTask, {
      onSuccess: () => {
        setSelectedTask(updatedTask);
        // Also update the active task if this is the active one
        if (activeTask && activeTask.id === selectedTask.id) {
          setActiveTask(updatedTask);
        }
      },
    });
  }, [selectedTask, mutation, activeTask]);

  // const handleStopTracking = useCallback(() => {
  //   if (!activeTask) return;

  //   const updatedTask = {
  //     id: activeTask.id,
  //     isActive: false,
  //     isPaused: false,
  //     startTime: 0,
  //     endTime: Date.now(),
  //     totalWorkTime: activeTask.totalWorkTime + (activeTask.isPaused ? 0 : Date.now() - activeTask.startTime),
  //     session: activeTask.session.map(s => ({
  //       ...s,
  //       ...(s.startTime === activeTask.currentSession
  //         ? {
  //             endTime: Date.now(),
  //             totalTime: Date.now() - s.startTime,
  //           }
  //         : {}),
  //     })),
  //     currentSession: null,
  //   };

  //   mutation.mutate(updatedTask);
  // }, [activeTask, mutation]);

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
        ...(s.startTime == activeTask.currentSession
          ? {
              endTime: Date.now(),
              totalTime: Date.now() - s.startTime,
            }
          : {}),
      })),
      currentSession: null,
    };
    // console.log(activeTask);
    // console.log(updatedTask);
    mutation.mutate(updatedTask);
  }, [activeTask, mutation]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setSelectedTask(null);
  }, []);

  const openTaskModal = useCallback(task => {
    setSelectedTask(task);
    setModalOpen(true);
  }, []);

  const handleResetTracking = useCallback(() => {
    if (!selectedTask) return;

    const updatedTask = {
      ...selectedTask,
      isPaused: false,
      startTime: 0,
      isActive: false,
      endTime: 0,
      totalWorkTime: 0,
    };

    setSelectedTask(updatedTask);
    const { task, ...taskWithoutTaskKey } = updatedTask;
    mutation.mutate(taskWithoutTaskKey);
  }, [selectedTask, mutation]);

  // Handle Start Tracking
  const handleStartTracking = useCallback(() => {
    if (!selectedTask) {
      toast.error('Select Project and Task');
      return;
    }
    mutation.mutate({
      isActive: true,

      startTime: new Date().getTime(),
      timerStart: new Date().getTime(),
      task_id: selectedTask?.id,
      creator: user?.email,
      session: [
        {
          date: new Date(),
          startTime: new Date().getTime(),
        },
      ],
    });
  }, [selectedTask, mutation, user?.email]);

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

  // Live timer for modal
  useEffect(() => {
    if (!selectedTask || !selectedTask.totalWorkTime) {
      setElapsedTime(0);
      return;
    }

    let interval;

    // Ensure all values are numbers and valid
    const startTime = Number(selectedTask.startTime) || 0;
    const totalWorkTime = Number(selectedTask.totalWorkTime) || 0;
    const isActive = Boolean(selectedTask.isActive);
    const isPaused = Boolean(selectedTask.isPaused);

    if (isActive && !isPaused) {
      // Initial calculation with proper number validation
      const initialTime = startTime === 0 ? totalWorkTime : Date.now() - startTime + totalWorkTime;

      setElapsedTime(initialTime);

      // Update every second
      interval = setInterval(() => {
        const currentTime = Date.now();
        const newTime = startTime === 0 ? totalWorkTime : currentTime - startTime + totalWorkTime;

        setElapsedTime(newTime);
      }, 1000);
    } else {
      // For paused or inactive tasks, just show the total work time
      setElapsedTime(totalWorkTime);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedTask]);

  useEffect(() => {
    if (selectedTask?.isActive && !selectedTask?.isPaused) {
      setIsTimerActive(true);
    } else if (selectedTask?.isPaused || !selectedTask?.isActive) {
      setIsTimerActive(false);
    }
  }, [selectedTask]);

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
                    <div
                      className={
                        task?.isActive && !task?.isPaused
                          ? 'flex min-h-10 min-w-10 items-center justify-center rounded-full border bg-green-100'
                          : 'flex min-h-10 min-w-10 items-center justify-center rounded-full border bg-neutral-50'
                      }
                    >
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

                    {/* <Badge className="rounded-md border-neutral-200 bg-neutral-100 px-3 py-1 text-[11px] font-medium text-neutral-800">
                      {task.isPaused ? "Paused" : "Active"}
                    </Badge> */}

                    <Button
                      disabled={isTimerActive}
                      className={`rounded-md border-neutral-200 bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-800 hover:text-white ${
                        isTimerActive ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      onClick={() => openTaskModal(task)}
                    >
                      {task.isActive && task.isPaused ? 'Continue' : 'Pause'}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Task Modal */}
      <Modal
        className="!max-w-[500px] flex flex-col !h-[90vh] py-6"
        isOpen={modalOpen}
        onRequestClose={closeModal}
        contentLabel="Time Tracker Modal"
      >
        <div className="navbar mb-[30px] flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="text-[20px] font-semibold flex items-center gap-2">Time Tracker</div>
          </div>
          <div className="buttons flex items-center gap-3 !mt-0 px-2">
            <button
              onClick={closeModal}
              className="close text-sm text-[#17181B] bg-transparent h-7 w-7 flex items-center justify-center rounded-full transition-all hover:bg-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="m12 13.4l-4.9 4.9q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7l4.9-4.9l-4.9-4.9q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l4.9 4.9l4.9-4.9q.275-.275.7-.275t.7.275t.275.7t-.275.7L13.4 12l4.9 4.9q.275.275.275.7t-.275.7t-.7.275t-.7-.275z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Content */}
        {selectedTask && (
          <div className="h-full">
            <div className="space-y-4 flex-col flex w-full h-full">
              <div className="flex-1">
                <div className="flex w-full justify-between items-center">
                  <div>
                    <div>
                      <p className="text-black text-[36px] font-semibold">
                        {/* {formatTime(selectedTask?.totalWorkTime)} */}
                        {formatTime(elapsedTime)}
                      </p>
                    </div>
                    <p className="text-[#525866] text-[16px] font-medium">Current Session</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedTask.isActive && (
                      <Switch
                        checked={!selectedTask.isPaused && selectedTask.isActive}
                        onCheckedChange={checked => {
                          if (checked) {
                            handleResumeTrackingModal();
                          } else {
                            // Pause tracking
                            handlePauseTracking();
                          }
                        }}
                        id="timer-toggle"
                        className="scale-150 rounded-lg data-[state=checked]:bg-green-500"
                      />
                    )}
                  </div>
                </div>

                <div className="border-b-[5px] pb-[30px]">
                  <button onClick={handleResetTracking} className="rounded-[12px] mt-4 flex items-center gap-2 border p-[10px]">
                    <svg xmlns="http://www.w3.org/2000/svg" width="19" height="18" viewBox="0 0 19 18" fill="none">
                      <path
                        d="M17 9C17 13.1421 13.6421 16.5 9.5 16.5C5.35786 16.5 2 13.1421 2 9C2 4.85786 5.35786 1.5 9.5 1.5C11.9537 1.5 14.1322 2.67833 15.5005 4.5V1.5"
                        stroke="#141B34"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-[#17181B] text-sm font-medium">Reset</span>
                  </button>
                </div>

                <div className="mt-6">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="note">Note</Label>
                    <Input
                      value={selectedTask.note || ''}
                      onChange={e =>
                        setSelectedTask(prev => ({
                          ...prev,
                          note: e.target.value,
                        }))
                      }
                      className="bg-white py-7 rounded-xl"
                      id="note"
                      name="note"
                      placeholder="What are you working on?"
                    />
                  </div>

                  <div className="space-y-2 mt-4 col-span-2">
                    <Label htmlFor="memo">Latest Screen Capture</Label>
                    <div className="rounded-xl py-[50px] flex-col border flex items-center justify-center">
                      <div className="bg-[#ECEFEC] p-[27px] rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="44" height="43" viewBox="0 0 44 43" fill="none">
                          <path
                            opacity="0.4"
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M22.1335 2.6875H21.8665C17.968 2.68746 14.8599 2.68743 12.423 3.01505C9.90684 3.35336 7.83962 4.07022 6.20492 5.70492C4.57022 7.33962 3.85336 9.40684 3.51505 11.923C3.18743 14.3599 3.18746 17.468 3.1875 21.3665V21.6335C3.18746 25.532 3.18743 28.6402 3.51505 31.077C3.85336 33.5932 4.57022 35.6604 6.20492 37.2952C7.83962 38.9299 9.90684 39.6467 12.423 39.985C14.8599 40.3125 17.968 40.3125 21.8667 40.3125H22.1333C26.032 40.3125 29.14 40.3125 31.577 39.985C34.0932 39.6467 36.1604 38.9299 37.7952 37.2952C39.4299 35.6604 40.1467 33.5932 40.485 31.077C40.8125 28.64 40.8125 25.532 40.8125 21.6333V21.3667C40.8125 17.468 40.8125 14.3599 40.485 11.923C40.1467 9.40684 39.4299 7.33962 37.7952 5.70492C36.1604 4.07022 34.0932 3.35336 31.577 3.01505C29.1402 2.68743 26.032 2.68746 22.1335 2.6875Z"
                            fill="#587158"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M13.9349 9.85352C11.9559 9.85352 10.3516 11.4578 10.3516 13.4368C10.3516 15.4159 11.9559 17.0202 13.9349 17.0202C15.9139 17.0202 17.5182 15.4159 17.5182 13.4368C17.5182 11.4578 15.9139 9.85352 13.9349 9.85352ZM12.8955 36.4329C12.677 36.4035 12.4685 36.3716 12.2692 36.3369C15.682 32.2092 19.1601 28.0388 23.0668 25.4192C25.3243 23.9056 27.6462 22.9705 30.0995 22.8553C32.2504 22.7541 34.6052 23.2779 37.2164 24.7467C37.1977 27.1673 37.1357 29.0584 36.9286 30.5989C36.6437 32.7177 36.1143 33.9027 35.2563 34.7605C34.3984 35.6186 33.2134 36.148 31.0946 36.4329C28.9242 36.7248 26.0575 36.7285 21.9951 36.7285C17.9325 36.7285 15.0659 36.7248 12.8955 36.4329Z"
                            fill="#587158"
                          />
                        </svg>
                      </div>
                      <p className="text-[#787C86] text-[16px] font-medium mt-4">No Captures Yet</p>
                    </div>
                  </div>

                  <div className="flex mt-6 mb-2 items-center justify-between">
                    <p className="text-[16px] underline font-medium">View Work Diary</p>
                    <p className="text-[16px] underline font-medium">Add Manual Time</p>
                  </div>
                </div>
              </div>

              <div className="flex pb-8 justify-between items-center">
                {!selectedTask.isActive && (
                  <Button onClick={handleStartTracking} className="w-full rounded-[10px] py-6">
                    Start Tracking
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}
