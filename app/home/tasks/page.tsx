'use client';
// @ts-nocheck

import React, { useEffect, useState } from 'react';
import { HomeNav } from '@/components/home-nav';
import { DataCardsGrid, type DataCardItem } from '@/components/data-cards';
import {
  CalendarIcon,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Search,
  Plus,
  Circle,
  CircleDot,
  Eye,
  Hash,
  Clock,
  CircleX,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TypeChip, StatusBadge } from '@/components/chip';
import useTask from '@/supabase/hook/useTask';
import { addTimeTracker, deleteTask, fetchProjects, getTimeTracking, modifyTask, ModifyTimeTracker } from '@/supabase/API';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useUser from '@/supabase/hook/useUser';
import { toast } from 'sonner';
import { TaskModal } from '@/components/tasks/task-modal';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DeleteDialog } from '@/components/DeleteDialog';
import { CircleFilled } from '@/components/Delete Animation/DeletionAnimations';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  useDroppable,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useRouter } from 'next/navigation';

type UITask = any; // keep your own type here if you have one

const updatetaskList = (data: any[]) => {
  return [
    {
      id: 'todo',
      name: 'To Do',
      items: data?.filter(item => item.status == 'todo') ?? [],
      icon: Circle,
      color: 'text-gray-600',
    },
    {
      id: 'in-progress',
      name: 'In Progress',
      items: data?.filter(item => item.status == 'in-progress') ?? [],
      icon: CircleDot,
      color: 'text-blue-600',
    },
    {
      id: 'in-review',
      name: 'In Review',
      items: data?.filter(item => item.status == 'in-review') ?? [],
      icon: Eye,
      color: 'text-orange-600',
    },
    {
      id: 'done',
      name: 'Done',
      items: data?.filter(item => item.status == 'done') ?? [],
      icon: CheckCircle2,
      color: 'text-green-600',
    },
  ];
};

const AnimatedClock = ({ running = false, className = '' }: { running?: boolean; className?: string }) => {
  return (
    <>
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Clock circle */}
        <circle cx="12" cy="12" r="10" />

        {/* Hour hand */}
        <line x1="12" y1="12" x2="12" y2="7" className={running ? 'hour-hand' : ''} />

        {/* Minute hand */}
        <line x1="12" y1="12" x2="16" y2="12" className={running ? 'minute-hand' : ''} />
      </svg>

      <style jsx>{`
        .hour-hand {
          transform-origin: 12px 12px;
          animation: spinHour 6s linear infinite;
        }

        .minute-hand {
          transform-origin: 12px 12px;
          animation: spinMinute 1s linear infinite;
        }

        @keyframes spinHour {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spinMinute {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
};

const updatedColName = {
  done: 'Done',
  'in-review': 'In Review',
  todo: 'To Do',
  'in-progress': 'In Progress',
};

// Memoized Sortable Task Card to avoid unnecessary re-renders
// compact card to reduce per-item DOM footprint
const SortableTaskCard = React.memo(function SortableTaskCardInner({
  task,
  handleTrackingClick,
  project,
  openEditTask,
  openDeleteModal,
  getTrackingButtonClass,
}: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    willChange: 'transform',
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-3 h-[105px] flex flex-col justify-between rounded-lg border bg-gray-50 hover:bg-gray-100 transition-all ${
        isDragging ? 'shadow-xl bg-white opacity-50 cursor-grabbing' : 'border-gray-200'
      }`}
      onClick={() => openEditTask(task)}
    >
      <div>
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium capitalize text-sm truncate text-gray-900 leading-tight">{task.name}</h4>
          <Button
            onClick={e => handleTrackingClick(e, task.id)}
            variant="ghost"
            size="sm"
            className={`w-5 h-5 p-0 text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2 ${
              getTrackingButtonClass(task.id) ? 'bg-black text-white' : ''
            }`}
          >
            {/* <Clock className={` w-3 h-3 `} /> */}
            <AnimatedClock running={getTrackingButtonClass(task.id)} />
          </Button>
        </div>

        <div className="text-xs capitalize truncate text-gray-600 mb-2">
          {(project && project.find((p: any) => p.id === task?.projectID)?.name) || ''}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">
          {task?.subtasks?.filter((subtask: any) => subtask.selected === true).length}/{task?.subtasks?.length}
        </span>
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1">{task?.priority && <StatusBadge status={task?.priority} label={task?.priority} />}</div>
          <div className="flex items-center gap-1">
            <button
              onClick={e => {
                e.stopPropagation();
                openDeleteModal(task);
              }}
              className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-red-100 text-gray-400 hover:text-red-600 transition"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

// Droppable Column component (memoized)
const DroppableColumn = React.memo(function DroppableColumnInner({
  column,
  project,
  openEditTask,
  handleTrackingClick,
  openDeleteModal,
  openNewTask,
  isDraggingOver,
  getTrackingButtonClass,
  visibleCount,
  onLoadMore,
}: any) {
  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    <div
      ref={setNodeRef}
      className={`bg-white  border border-gray-200 rounded-xl p-4 shadow-sm transition-all ${
        isDraggingOver ? '!border-gray-500  !border-1 border-dashed !bg-[#f9f8f6]' : ''
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <column.icon className={`w-4 h-4 ${column.color}`} />
          <span className="font-medium text-gray-900">{column.name}</span>
          <TypeChip label={String(column?.items?.length ?? 0)} />
        </div>
        <div className="flex items-center gap-1">
          <Button
            onClick={e => {
              e.stopPropagation();
              openNewTask(column.id);
            }}
            variant="ghost"
            size="sm"
            className="w-6 h-6 p-0 text-gray-400 hover:text-gray-600"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Task Cards */}
      <div className="space-y-3  h-full  max-h-[600px] overflow-y-auto scrollbar-hide">
        <SortableContext
          items={(column.items || []).slice(0, visibleCount).map((item: any) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          {(column.items || []).slice(0, visibleCount).map((task: any) => (
            <SortableTaskCard
              handleTrackingClick={handleTrackingClick}
              key={task.id}
              task={task}
              project={project}
              openEditTask={openEditTask}
              openDeleteModal={openDeleteModal}
              getTrackingButtonClass={getTrackingButtonClass}
            />
          ))}
        </SortableContext>

        {/* Load more */}
        {visibleCount < (column.items?.length || 0) && (
          <div className="flex items-center mt-1 justify-center">
            <button
              className="w-full text-gray-500 py-2 hover:text-black  flex text-xs justify-center items-center gap-1 font-medium"
              onClick={e => {
                e.stopPropagation();
                onLoadMore(column.id);
              }}
            >
              <span>Load More</span>
              <ChevronDown className="w-4 h-4 " />
            </button>
          </div>
        )}

        {/* Add Task Button */}
        {/* <Button
          data-dndkit-disabled-drag-handle
          onClick={e => {
            e.stopPropagation();
            openNewTask();
          }}
          variant="ghost"
          className="w-full text-gray-500 hover:text-gray-700 hover:bg-gray-50 justify-center"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button> */}
      </div>
    </div>
  );
});

export default function MyTasksPage() {
  const admins = [
    'david.zeeman@intelleqt.ai',
    'roxi.zeeman@souqdesign.co.uk',
    'risalat.shahriar@intelleqt.ai',
    'dev@intelleqt.ai',
    'saif@intelleqt.ai',
  ];

  // Sortable Task Card Component
  // (moved to module scope for memoization)

  const [myTask, setMyTask] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [visibleCounts, setVisibleCounts] = React.useState<Record<string, number>>({});
  const [editing, setEditing] = React.useState<UITask | null>(null);
  const { data: taskData, isLoading: taskLoading } = useTask();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [defaultStatus, setDefaultStatus] = React.useState<string | undefined>(undefined);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const router = useRouter();

  const [activeID, setActiveId] = useState<string | null>(null);
  const [overID, setOverId] = useState<string | null>(null);
  const { user } = useUser();
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 120, // increase delay to reduce accidental drags and thrash
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const openNewTask = React.useCallback((status?: string) => {
    setDefaultStatus(status);
    setEditing(null);
    setModalOpen(true);
  }, []);

  const [searchText, setSearchText] = useState('');
  const [filter, setFilter] = useState<null | 'today' | 'overdue' | 'archive'>(null);

  const openEditTask = React.useCallback((task: any) => {
    setEditing(task);
    setModalOpen(true);
  }, []);

  // Initialize visible counts per column when tasks change
  useEffect(() => {
    if (!tasks || tasks.length === 0) return;
    setVisibleCounts(prev => {
      const next: Record<string, number> = { ...prev };
      tasks.forEach((col: any) => {
        if (typeof next[col.id] === 'undefined') next[col.id] = 10;
      });
      return next;
    });
  }, [tasks]);

  const handleLoadMore = React.useCallback(
    (columnId: string) => {
      setVisibleCounts(prev => {
        const current = prev[columnId] || 10;
        const col = tasks.find((c: any) => c.id === columnId);
        const total = col?.items?.length || 0;
        const nextCount = Math.min(current + 10, total);
        return { ...prev, [columnId]: nextCount };
      });
    },
    [tasks]
  );

  const handleClose = (e: boolean) => {
    setModalOpen(e);
    setEditing(null);
  };

  function handleSave(_payload: Omit<any, 'id'> & { id?: string }) {
    // handled elsewhere (DB-driven)
  }

  const { data: trackingData, isLoading: trackingLoading } = useQuery({
    queryKey: ['Time Tracking'],
    queryFn: getTimeTracking,
  });

  const { mutate, error: deleteError } = useMutation({
    mutationFn: modifyTask,
    onSuccess: () => queryClient.invalidateQueries(['tasks']),
  });

  const { data: project } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });

  // Start Time Tracking
  const mutation = useMutation({
    mutationFn: addTimeTracker,
    onSuccess: () => {
      queryClient.invalidateQueries(['Time Tracking']);
      toast.success('Timer Started');
    },
    onError: () => {
      toast('Error! Try again');
    },
  });

  // Pause Tracking
  const pauseMutation = useMutation({
    mutationFn: ModifyTimeTracker,
    onSuccess: () => {
      queryClient.invalidateQueries(['Time Tracking']);
      toast.success('Timer Stopped');
    },
    onError: () => {
      toast('Error! Try again');
    },
  });

  // Handle Start Tracking
  const handleStartTracking = id => {
    if (!id) {
      toast.error('Invalid Task');
      return;
    }
    mutation.mutate({
      isPaused: false,
      isActive: true,
      startTime: new Date().getTime(),
      timerStart: new Date().getTime(),
      task_id: id,
      creator: user?.email,
      currentSession: new Date().getTime(),
      session: [
        {
          date: new Date(),
          startTime: new Date().getTime(),
        },
      ],
    });
  };

  // Handle Pause Tracking
  const handlePauseTracking = item => {
    if (!item || item.startTime === 0) return;

    const startTime = item.startTime;
    const currentTime = new Date().getTime();
    const newWorkTimeMs = currentTime - startTime;
    const previousWorkTimeMs = item.totalWorkTime || 0;
    const totalWorkTimeMs = previousWorkTimeMs + newWorkTimeMs;

    const updatedTask = {
      ...item,
      isPaused: true,
      startTime: 0,
      totalWorkTime: totalWorkTimeMs,
      endTime: currentTime,
      session: item.session.map(s => {
        if (s.startTime === Number(item.currentSession)) {
          const endTime = Date.now();
          return {
            ...s,
            endTime,
            totalTime: endTime - s.startTime,
          };
        }
        return s;
      }),
      currentSession: null,
    };

    const { task, ...taskWithoutTaskKey } = updatedTask;
    pauseMutation.mutate(taskWithoutTaskKey);
  };

  const getTrackingButtonClass = (taskId: string | number) => {
    if (trackingLoading) return 'text-gray-900 bg-white';
    const trackingItems = trackingData?.data?.filter(item => item.task_id === taskId);
    const hasRunning = trackingItems?.some(item => item.isActive && !item.isPaused);
    return hasRunning;
  };

  // Handle Task button click
  const handleTrackingClick = (e: React.MouseEvent, taskId: string | number) => {
    e.stopPropagation();

    router.push(`/home/time`);
    return;

    // const trackingItems = trackingData?.data || [];
    // const runningItems = trackingItems.filter(item => item.isActive && !item.isPaused);

    // const clickedTask = trackingItems.find(item => item.task_id === taskId);
    // const isClickedRunning = clickedTask && clickedTask.isActive && !clickedTask.isPaused;

    // console.log(clickedTask);

    // if (isClickedRunning) {
    //   handlePauseTracking(clickedTask);
    // } else if (runningItems.length > 0) {
    //   toast.warning('Another task is already running. Please pause it before starting a new one.');
    // } else {
    //   // handleStartTracking(taskId);
    // }
  };

  const showArchiveTask = tasks => {
    if (!tasks) return;
    const tempTask = tasks.filter(item => item.isArchived);
    return tempTask;
  };

  useEffect(() => {
    if (taskLoading) return;
    let list = myTaskList(taskData?.data);
    setMyTask(list);

    if (searchText.trim()) {
      const s = searchText.toLowerCase();
      list = list.filter(t => t.name?.toLowerCase().includes(s));
    }
    if (filter === 'today') list = todayTasks(list);
    else if (filter === 'overdue') list = myRecentTask(list);
    else if (filter === 'archive') {
      list = showArchiveTask(list);
    }

    const removedArhive = list.filter(item => !item.isArchived);
    setTasks(taskData && taskData.data?.length > 0 ? updatetaskList(filter === 'archive' ? list : removedArhive) : []);
  }, [taskData, taskLoading, user?.email, searchText, filter]);

  const myRecentTask = (arr: any[]) => {
    const now = new Date();
    return arr?.filter(task => task.status !== 'done' && task.dueDate && new Date(task.dueDate) < now) ?? [];
  };

  const todayTasks = (arr: any[]) => {
    const now = new Date();
    return (
      arr?.filter(task => {
        const createdAt = new Date(task.created_at);
        return (
          createdAt.getDate() === now.getDate() && createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear()
        );
      }) ?? []
    );
  };

  const myTaskList = (arr: any[]) => {
    if (!arr) return [];
    if (!user) return [];

    let filtered = admins.includes(user?.email)
      ? arr
      : arr.filter(task => {
          const isAssigned =
            task.assigned && Array.isArray(task.assigned) && task.assigned.some((assignee: any) => assignee.email === user.email);
          const isCreator = task.creator === user.email;
          return isAssigned || isCreator;
        });

    // Sort by updated_at (newest first)
    return filtered.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  };

  const assignedProjectCount = project?.filter((item: any) => item.assigned?.some((person: any) => person.email == user?.email)).length;

  const todayCreatedTask = todayTasks(myTask);
  const overDueTask = myRecentTask(myTask);

  const dataCards: DataCardItem[] = [
    {
      title: 'Total Tasks',
      value: myTask?.length,
      subtitle: 'Across all assigned projects',
      icon: Hash,
    },
    {
      title: 'Overdue Tasks',
      value: overDueTask?.length,
      subtitle: 'Past due dates',
      icon: AlertTriangle,
    },
    {
      title: 'Task Added Today',
      value: todayCreatedTask?.length,
      subtitle: 'Created today',
      icon: CalendarIcon,
    },
    {
      title: 'Active Projects',
      value: admins.some(item => item == user?.email) ? project?.length : assignedProjectCount,
      subtitle: 'Assigned to you',
      icon: Hash,
    },
  ];

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Find the containers
    const activeContainer = findContainer(activeId as string);
    const overContainer = findContainer(overId as string);

    setOverId(overContainer);

    if (!activeContainer || !overContainer) return;
    if (activeContainer === overContainer) return;

    setTasks(prev => {
      const prevClone = prev.map(col => ({ ...col, items: [...col.items] }));

      const activeCol = prevClone.find(col => col.id === activeContainer);
      const overCol = prevClone.find(col => col.id === overContainer);
      if (!activeCol || !overCol) return prev;

      const activeIndex = activeCol.items.findIndex(item => item.id === activeId);
      const overIndex = overCol.items.findIndex(item => item.id === overId);
      if (activeIndex === -1) return prev;

      const activeItem = activeCol.items[activeIndex];
      // remove from activeCol immutably
      activeCol.items = activeCol.items.filter((_, idx) => idx !== activeIndex);

      const updatedItem = { ...activeItem, status: overContainer };

      if (overIndex === -1) {
        overCol.items = [...overCol.items, updatedItem];
      } else {
        overCol.items = [...overCol.items.slice(0, overIndex), updatedItem, ...overCol.items.slice(overIndex)];
      }

      return prevClone;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId == overID) return;

    const overContainer = findContainer(overId);
    if (!overContainer) return;

    const nextStatus = overContainer as 'todo' | 'in-progress' | 'in-review' | 'done';

    const payload =
      nextStatus === 'done' ? { newTask: { status: nextStatus, id: activeId } } : { newTask: { status: nextStatus, id: activeId } };

    mutate(payload);
    toast.success(`Task moved to ${updatedColName[overContainer]}`);
  };

  const findContainer = (id: string) => {
    if (tasks.some(col => col.id === id)) {
      return id;
    }

    const column = tasks.find(col => col.items.some(item => item.id === id));
    return column?.id;
  };

  useEffect(() => {
    document.title = 'My Task | TechStyles';
  }, []);

  const {
    mutate: removeTask,
    isLoading: isDeleting,
    error: deleteError2,
  } = useMutation({
    mutationFn: deleteTask,
    onSuccess: e => {
      if (e.error) {
        console.log(e.error);
        if (e.error?.code === '23503') {
          toast.error('Task cant be delete . Tracker was enabled from this task');
        }
        return;
      }
      queryClient.invalidateQueries(['tasks']);
      toast.success('Task Deleted', {
        duration: 1000,
        dismissible: true,
      });
      setIsDeleteOpen(false);
    },
  });

  const openDeleteModal = (task: any) => {
    setIsDeleteOpen(true);
    setSelectedTask(task);
  };

  const handleDeleteTimer = (id: string) => {
    setTimeout(() => {
      let secondsLeft = 5;
      let timer: any, updateInterval: any;
      const createToastContent = (seconds: number) => (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <CircleFilled />
            <div>
              <div className="font-sm">Deleting Task...</div>
              <div className="text-xs opacity-70">{seconds}s remaining</div>
            </div>
          </div>
          <button
            onClick={() => {
              clearTimeout(timer);
              clearInterval(updateInterval);
              toast.dismiss(t);
              toast.success('Deletion cancelled');
            }}
            className="px-3 py-1 text-sm bg-black text-white rounded  transition-colors ml-4"
          >
            Cancel
          </button>
        </div>
      );

      const t = toast.warning(createToastContent(secondsLeft), {
        duration: Infinity,
      });

      updateInterval = setInterval(() => {
        secondsLeft--;
        if (secondsLeft > 0) {
          toast.warning(createToastContent(secondsLeft), {
            id: t,
            duration: Infinity,
          });
        }
      }, 1000);

      timer = setTimeout(() => {
        removeTask(id);
        clearInterval(updateInterval);
        toast.dismiss(t);
      }, 5000);
    }, 100);
  };

  const handleDelete = (id: string) => {
    handleDeleteTimer(id);
  };

  // if (!isClient) return null; // Prevent SSR hydration errors

  // Get the active task for drag overlay
  const activeTask = activeID
    ? tasks.find(col => col.items.some(item => item.id === activeID))?.items.find(item => item.id === activeID)
    : null;

  return (
    <div className="flex-1 bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <HomeNav />
        <DataCardsGrid items={dataCards} />

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 h-9 bg-transparent">
                  <Filter className="w-4 h-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="center" className="w-40">
                <DropdownMenuItem onClick={() => setFilter('archive')}>Archive</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('overdue')}>Overdue</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('today')}>Added Today</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {filter && (
              <Button size={'sm'} variant={'secondary'} className=" capitalize">
                {filter}
                <span onClick={() => setFilter(null)} className="ml-2 inline-flex">
                  <CircleX className="h-4 w-4" />
                </span>
              </Button>
            )}

            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input value={searchText} onChange={e => setSearchText(e.target.value)} className="pl-10 h-9" placeholder="Search tasks..." />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={() => openNewTask()} size="sm" className="gap-2 bg-gray-900 hover:bg-gray-800">
              <Plus className="w-4 h-4" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Kanban Board */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {tasks?.map((column: any) => (
              <DroppableColumn
                key={column.id}
                column={column}
                project={project}
                openEditTask={openEditTask}
                openDeleteModal={openDeleteModal}
                openNewTask={openNewTask}
                isDraggingOver={overID === column.id}
                handleTrackingClick={handleTrackingClick}
                getTrackingButtonClass={getTrackingButtonClass}
                visibleCount={visibleCounts[column.id] || 10}
                onLoadMore={handleLoadMore}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="p-3 h-[105px] cursor-grabbing flex flex-col justify-between rounded-lg border bg-white shadow-xl border-gray-200 rotate-3">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium capitalize text-sm truncate text-gray-900 leading-tight">{activeTask.name}</h4>
                    <Button variant="ghost" size="sm" className="w-5 h-5 p-0 text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2">
                      <Clock className="w-3 h-3" />
                    </Button>
                  </div>

                  <div className="text-xs capitalize truncate text-gray-600 mb-2">
                    {(project && project.find((p: any) => p.id === activeTask?.projectID)?.name) || ''}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    {activeTask?.subtasks?.filter((subtask: any) => subtask.selected === true).length}/{activeTask?.subtasks?.length}
                  </span>
                  <div className="flex items-center gap-1">
                    <div className="flex items-center gap-1">
                      {activeTask?.priority && <StatusBadge status={activeTask?.priority} label={activeTask?.priority} />}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <TaskModal
        open={modalOpen}
        onOpenChange={handleClose}
        projectId={null}
        team={null}
        taskToEdit={editing}
        onSave={handleSave}
        setEditing={setEditing}
        openDeleteModal={openDeleteModal}
        status={defaultStatus}
      />

      <DeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => handleDelete(selectedTask?.id)}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        itemName={selectedTask?.name}
        requireConfirmation={false}
      />
    </div>
  );
}
