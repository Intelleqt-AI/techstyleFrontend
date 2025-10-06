'use client';

import type React from 'react';

import { Input } from '@/components/ui/input';
import { BreadcrumbBar } from '@/components/breadcrumb-bar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from 'react-modal';
import { AlertCircle, FolderKanban, Package, Play, UserPlus, Bell, History, Plus, Search, Command } from 'lucide-react';
import { Switch } from './ui/switch';
import { Label } from '@/components/ui/label';

import { toast } from 'sonner';
import { addTimeTracker, fetchOnlyProject, fetchProjects, getTask, getTimeTracking, modifyTask } from '@/supabase/API';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useUser from '@/hooks/useUser';
import { TaskModal } from './tasks/task-modal';
import NotificationButton from './ui/Notification';

type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'neutral' | 'notify' | 'activity' | 'primary';
  isOpen?: boolean;
};

const IconButton = ({ children, variant = 'neutral', className, isOpen = false, ...props }: IconButtonProps) => {
  const base =
    'w-11 h-11 flex items-center justify-center rounded-[12px] transition-all duration-200 relative focus-visible:outline-none focus-visible:ring-2';
  const variants: Record<NonNullable<IconButtonProps['variant']>, string> = {
    // neutral greige chip
    neutral: 'bg-greige-100 hover:bg-greige-300 text-slatex-700 focus-visible:ring-greige-500/40',
    // notifications use clay tint
    notify: cn('bg-clay-50 hover:bg-clay-100 text-ink focus-visible:ring-clay-300', isOpen && 'translate-y-0.5'),
    // activity uses subtle neutral tint
    activity: cn('bg-neutral-50 hover:bg-neutral-100 text-ink focus-visible:ring-neutral-300', isOpen && 'translate-y-0.5'),
    // primary action uses deep navy
    primary: cn('bg-primary text-primary-foreground hover:opacity-90 focus-visible:ring-neutral-200', isOpen && 'translate-y-0.5'),
  };
  return (
    <button className={cn(base, variants[variant], className)} data-state={isOpen ? 'open' : 'closed'} {...props}>
      {children}
    </button>
  );
};

export function TopBar() {
  const [modalOpen, setModalOpen] = useState(false);
  const [activatedTask, setActivatedTask] = useState([]);
  const [studioTask, setStudioTask] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [projects, setProjects] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [note, setNote] = useState('');
  const { user } = useUser();

  const [filteredTask, setFilteredTask] = useState([]);
  const [task, setTask] = useState(null);
  // const { handleAction } = useActionMenu();
  const [TaskmodalOpen, setTaskmodalOpen] = useState(false);
  const [ProjectmodalOpen, setProjectmodalOpen] = useState(false);
  const [ProductmodalOpen, setProductmodalOpen] = useState(false);

  const queryClient = useQueryClient();
  const router = useRouter();

  // Projects
  const {
    data: projectData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['fetchOnlyProject'],
    queryFn: () => fetchOnlyProject({ projectID: null }),
  });

  const { data: trackingData, isLoading: trackingLoading } = useQuery({
    queryKey: ['Time Tracking'],
    queryFn: getTimeTracking,
  });

  const mutation = useMutation({
    mutationFn: addTimeTracker,
    onSuccess: () => {
      queryClient.invalidateQueries(['Time Tracking']);
      toast('Timer Update');
      closeModal();
    },
    onError: () => {
      toast('Error! Try again');
    },
  });

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setSelectedProject('');
    setFilteredTask([]);
    setNote('');
    setSelectedTask(null);
  }, []);

  const handleNavigate = useCallback(() => {
    if (activatedTask?.length === 0) {
      setModalOpen(true);
    } else {
      router.push('/home/time');
    }
  }, [activatedTask, router]);

  const afterCloseModal = useCallback(() => {
    closeModal();
  }, [closeModal]);

  const handleStartTracking = useCallback(() => {
    if (!selectedTask && !studioTask) {
      toast.error('Select Project and Task');
      return;
    }
    mutation.mutate({
      isActive: true,
      startTime: new Date().getTime(),
      timerStart: new Date().getTime(),
      task_id: selectedTask?.id || null,
      creator: user?.email,
      currentSession: new Date().getTime(),
      note,
      session: [
        {
          date: new Date(),
          startTime: new Date().getTime(),
        },
      ],
    });
  }, [selectedTask, mutation, note, user?.email]);

  useEffect(() => {
    if (isLoading) return;
    setProjects(projectData);
  }, [isLoading, projectData]);

  // Task
  const {
    data: taskData,
    isLoading: taskLoading,
    error: taskError,
    refetch: refetchTask,
  } = useQuery({
    queryKey: ['task'],
    queryFn: getTask,
  });

  useEffect(() => {
    setFilteredTask(task?.filter(item => String(item.projectID) === String(selectedProject)));
  }, [selectedProject, task]);

  useEffect(() => {
    if (taskLoading) return;
    setTask(taskData.data);
  }, [taskLoading, taskData]);

  useEffect(() => {
    if (trackingLoading) return;
    setActivatedTask(
      trackingData?.data?.filter(item => item.isActive === true && item.isPaused === false).filter(item => item.creator == user?.email)
    );
  }, [trackingData?.data, trackingLoading, user?.email]);

  const dropdownNavigateContacts = useCallback(() => {
    router.push('/crm/contacts/new');
  }, [router]);

  const dropdownOpenTaskModal = useCallback(() => {
    setTaskmodalOpen(true);
  }, []);

  const dropdownOpenProjectModal = useCallback(() => {
    setProjectmodalOpen(true);
  }, []);

  const dropdownOpenProductModal = useCallback(() => {
    setProductmodalOpen(true);
  }, []);

  const memoizedTaskItems = useMemo(() => {
    return filteredTask?.map(item => (
      <SelectItem key={item.id} value={item}>
        {item.name}
      </SelectItem>
    ));
  }, [filteredTask]);

  const handleClose = (e: boolean) => {
    setTaskmodalOpen(e);
  };

  return (
    <header className="h-14 bg-white flex items-center justify-between px-6 border-b border-gray-200">
      <div className="flex items-center gap-6 flex-1">
        <BreadcrumbBar />

        <div className="flex-1 max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search or ask AI..." className="pl-10 pr-16 bg-neutral-50 text-sm h-9 w-full" />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs px-2 py-1 rounded bg-greige-100 text-taupe-700">
              <Command className="w-3 h-3" />K
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mr-6">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <NotificationButton />
            </TooltipTrigger>
            <TooltipContent>
              <p>Notifications</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="bg-neutral-50 hover:bg-neutral-100 text-ink focus-visible:ring-neutral-300 w-11 h-11 flex items-center justify-center rounded-[12px] transition-all duration-200 relative focus-visible:outline-none focus-visible:ring-2  "
                aria-label="Activity Log"
                onClick={handleNavigate}
              >
                <History className="w-5 h-5 stroke-[1.75]" />
                {activatedTask?.length > 0 && <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-slate-500" />}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Activity Log</p>
            </TooltipContent>
          </Tooltip>

          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="w-11 h-11 flex items-center justify-center rounded-[12px] transition-all duration-200 relative focus-visible:outline-none focus-visible:ring-2 bg-primary text-primary-foreground hover:opacity-90 focus-visible:ring-neutral-200"
                  >
                    <Plus className="w-5 h-5 stroke-[1.75]" />
                  </button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Quick Add</p>
              </TooltipContent>
            </Tooltip>

            <DropdownMenuContent className="w-56 bg-white border border-borderSoft shadow-lg" align="end">
              <DropdownMenuItem onClick={dropdownOpenTaskModal} className="flex items-center gap-2 hover:bg-neutral-50 focus:bg-neutral-50">
                Task
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 hover:bg-neutral-50 focus:bg-neutral-50">Meeting</DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 hover:bg-neutral-50 focus:bg-neutral-50">AI Note</DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2 hover:bg-neutral-50 focus:bg-neutral-50">
                Purchase Order
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TooltipProvider>
      </div>

      <TaskModal
        open={TaskmodalOpen}
        onOpenChange={handleClose}
        projectId={null}
        team={null}
        taskToEdit={null}
        onSave={null}
        setEditing={null}
        status={null}
      />

      <Modal
        className="!max-w-[500px] flex !h-auto flex-col py-6"
        isOpen={modalOpen}
        onRequestClose={afterCloseModal}
        contentLabel="Example Modal"
      >
        <div className="navbar mb-[10px] flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="text-[20px] font-semibold flex items-center gap-2">Time Tracker</div>
          </div>
          {/* Delete and Close Modal Section */}
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
        {/* Content */}
        <div className="h-full">
          <div className="space-y-4 flex-col flex w-full h-full">
            <div className=" flex-1">
              <div className="flex w-full justify-between items-center ">
                <div>
                  {/* <div>
                    <p className="text-black text-[36px] font-semibold">{formatTime(elapsedTime)}</p>
                  </div>
                  <p className="text-[#525866] text-[16px] font-medium">Current Session</p> */}
                </div>
                <div className="flex items-center space-x-2">
                  {/* {filteredTask?.isActive == true && (
                    <Switch
                      checked={!filteredTask?.isPaused}
                      onCheckedChange={checked => {
                        if (checked) {
                          handleResumeTracking();
                        } else {
                          handlePauseTracking();
                        }
                      }}
                      id="airplane-mode"
                      className="scale-150 data-[state=checked]:bg-green-500"
                    />
                  )} */}
                </div>
              </div>
              {/* reset */}
              {/* <div className="border-b-[5px] pb-[30px]">
                <button className="rounded-[12px] mt-4 flex items-center gap-2 border p-[10px]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="18" viewBox="0 0 19 18" fill="none">
                    <path
                      d="M17 9C17 13.1421 13.6421 16.5 9.5 16.5C5.35786 16.5 2 13.1421 2 9C2 4.85786 5.35786 1.5 9.5 1.5C11.9537 1.5 14.1322 2.67833 15.5005 4.5V1.5"
                      stroke="#141B34"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <span className="text-[#17181B] text-sm font-medium">Reset</span>
                </button>
              </div> */}
              {/* Form */}

              {/* Filter Button */}
              <div className="my-5">
                <div className="">
                  <div className="flex items-center justify-end gap-3">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className={`w-4 h-4 ${studioTask ? 'text-black' : 'text-gray-400'}`} />
                      <span className={`text-sm font-medium ${studioTask ? 'text-black' : 'text-gray-600'}`}>Start Studio Management</span>
                    </div>

                    <Switch className="rounded-lg" checked={studioTask} onCheckedChange={setStudioTask} aria-label="Toggle urgent tasks" />
                  </div>
                </div>
              </div>

              <div className="mt-0">
                <div className="space-y-2 col-span-2 mb-3">
                  <Label htmlFor="memo">
                    Note <span className="text-xs text-gray-500">(optional)</span>
                  </Label>
                  <Input
                    onChange={e => setNote(e.target.value)}
                    className="bg-white py-7 rounded-xl"
                    id="memo"
                    name="memo"
                    placeholder="What are you working on?"
                  />
                </div>
                {/* Projects */}
                {!studioTask && (
                  <div className="space-y-2 mt-2">
                    <Label htmlFor="memo">Projects</Label>
                    <Select required value={selectedProject} onValueChange={value => setSelectedProject(value)}>
                      <SelectTrigger className="bg-white rounded-[10px] w-full px-3 py-[10px] border">
                        <SelectValue placeholder="Select Project" />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-[999] max-h-[250px]">
                        <SelectItem key="default" disabled value="none">
                          Select Project
                        </SelectItem>
                        {projects?.map(item => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Tasks */}
                {!studioTask && (
                  <div className="space-y-2 mt-2">
                    <Label htmlFor="task">Task</Label>
                    <Select required onValueChange={value => setSelectedTask(value)}>
                      <SelectTrigger className="bg-white rounded-[10px] w-full px-3 py-[10px] border">
                        <SelectValue placeholder="Select Task" />
                      </SelectTrigger>
                      <SelectContent className="bg-white z-[999] max-h-[250px] overflow-auto">{memoizedTaskItems}</SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex pb-2 mt-3 justify-between items-center">
              <Button type="submit" onClick={handleStartTracking} className="w-full rounded-[10px] py-6">
                <Play /> Start Tracking
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </header>
  );
}
