'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { ProjectNav } from '@/components/project-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Edit,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Package,
  TrendingUp,
  FileText,
  ArrowRight,
  Upload,
  X,
  Trash2,
} from 'lucide-react';
import useProjects from '@/supabase/hook/useProject';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteCover, getTask, modifyProject, uploadCover } from '@/supabase/API';
import Image from 'next/image';
import projectCover from '/public/project_cover.jpg';
import useClient from '@/hooks/useClient';
import { useRouter } from 'next/navigation';
import Modal from 'react-modal';
import { toast } from 'sonner';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { DeleteDialog } from '@/components/DeleteDialog';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import debounce from 'lodash/debounce';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const blockers = [
  {
    id: 1,
    title: 'No Active Blocker',
    assignee: 'Sarah Wilson',
    priority: 'high',
    daysBlocked: 3,
    avatar: 'SW',
  },
];

const recentActivity = [
  // {
  //   id: 1,
  //   type: 'message',
  //   user: 'Jane Designer',
  //   avatar: 'JD',
  //   action: 'shared kitchen layout revisions',
  //   time: '2 hours ago',
  // },
  // {
  //   id: 2,
  //   type: 'file',
  //   user: 'Tom Wilson',
  //   avatar: 'TW',
  //   action: 'uploaded electrical schematics',
  //   time: '4 hours ago',
  // },
  // {
  //   id: 3,
  //   type: 'task',
  //   user: 'Sarah Johnson',
  //   avatar: 'SJ',
  //   action: 'completed material selection',
  //   time: '6 hours ago',
  // },
];

const recentFiles = [
  // {
  //   id: 1,
  //   name: 'Kitchen_Layout_v3.pdf',
  //   type: 'PDF',
  //   size: '2.4 MB',
  //   uploadedBy: 'Jane Designer',
  //   uploadedAt: '2 hours ago',
  // },
  // {
  //   id: 2,
  //   name: 'Electrical_Schematics.dwg',
  //   type: 'DWG',
  //   size: '1.8 MB',
  //   uploadedBy: 'Tom Wilson',
  //   uploadedAt: '4 hours ago',
  // },
  // {
  //   id: 3,
  //   name: 'Material_Samples.jpg',
  //   type: 'JPG',
  //   size: '3.2 MB',
  //   uploadedBy: 'Sarah Johnson',
  //   uploadedAt: '6 hours ago',
  // },
];

const formatTodayDate = () => {
  const date = new Date();
  const month = date.toLocaleString('en-US', { month: 'short' });
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
};

const calculateProjectProgress = (projectId: string, tasks: Task[] | undefined, isLoading: boolean): number => {
  if (isLoading || !tasks) return 0;

  const projectTasks = tasks.filter(item => item.projectID === projectId);
  if (projectTasks.length === 0) return 0;

  const completedTasks = projectTasks.filter(task => task.status === 'done');
  const progress = Math.floor((completedTasks.length / projectTasks.length) * 100);

  return progress;
};

// Helper functions
const getCompletedTasks = (tasks, projectId) => {
  return tasks?.filter(task => task.projectID === projectId && task.status === 'done').length || 0;
};

const getInProgressTasks = (tasks, projectId) => {
  return tasks?.filter(task => task.projectID === projectId && (task.status === 'in-progress' || task.status === 'in-review')).length || 0;
};

const getRemainingTasks = (tasks, projectId) => {
  return tasks?.filter(task => task.projectID === projectId && (task.status === 'todo' || task.status === '' || !task.status)).length || 0;
};

const MAX_FILE_SIZE = 50 * 1024 * 1024;

export default function ProjectOverviewPage({ params }: { params: { id: string } }) {
  const [selectedProject, setSelectedProject] = useState(null);
  const [uploadModal, setUploadModal] = useState(false);
  const [file, setFile] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [renamingIndex, setRenamingIndex] = useState(-1);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: project, isLoading: projectLoading, refetch } = useProjects();
  // Get clients
  const { data: clientData, isLoading: loadingClient, refetch: refetchClient } = useClient();

  const mutation = useMutation({
    mutationFn: modifyProject,
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      toast.success('Phase Updated');
    },
    onError: error => {
      console.log(error);
      toast.error('Error! Try again');
    },
  });

  const {
    data: taskData,
    isLoading: taskLoading,
    error: taskError,
    refetch: taskRefetch,
  } = useQuery({
    queryKey: ['task'],
    queryFn: getTask,
  });

  const UploadCloseModal = () => {
    setUploadModal(false);
    setFile([]);
  };
  const openUploadModal = () => setUploadModal(true);

  // Image Upload Function
  const attachmentMutation = useMutation({
    mutationFn: async ({ file, uuid }) => {
      toast.loading('Uploading...', { id: 'upload-toast' });
      try {
        const result = await uploadCover({ file, id: uuid });
        toast.dismiss('upload-toast'); // Dismiss loading toast
        toast.success('Uploaded successfully!');
        setFile(null); // Clear selected image after upload
        refetch();
        UploadCloseModal();
        return result;
      } catch (err) {
        toast.dismiss('upload-toast'); // Dismiss in case of error
        toast.error(`Upload failed: ${err.message}`);
        throw err;
      }
    },
  });

  // File delete Function
  const deleteMutation = useMutation({
    mutationFn: deleteCover,
    onMutate: () => {
      toast.loading('Deleting...', { id: 'delete-toast' });
    },
    onSuccess: () => {
      toast.dismiss('delete-toast');
      toast.success(`Deleted successfully!`);
      queryClient.invalidateQueries('projects');
      refetch();
      UploadCloseModal();
    },
    onError: () => {
      toast.dismiss('delete-toast');
      toast.error('Failed to delete image.');
    },
  });

  // File upload handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      if (droppedFiles.some(file => file.size > MAX_FILE_SIZE)) {
        setError('One or more files exceed the 50MB limit');
        return;
      }
      const processedFiles = droppedFiles.map(file => {
        return Object.assign(file, {
          preview: URL.createObjectURL(file),
          originalName: file.name,
          id: Math.random().toString(36).substring(2),
        });
      }) as any[];
      setFile(prev => [...prev, ...processedFiles]);
      setError('');
    }
  };

  const handleSelectByClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFile(prev => [...prev, ...selectedFiles]);
  };

  const handleRemoveFile = (index: number) => {
    const fileToRemove = file[index] as any;
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    const updatedFiles = file.filter((_, i) => i !== index);
    setFile(updatedFiles);
    if (renamingIndex === index) {
      setRenamingIndex(-1);
    }
  };

  const handleFileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // console.log(file, params.id);
    attachmentMutation.mutate({ file, uuid: params.id });
  };

  const deleteImage = name => {
    deleteMutation.mutate({ file: name, id: params?.id });
  };

  const handleDeleteTask = () => {
    deleteImage(selectedProject?.images[0]?.name);
  };

  useEffect(() => {
    if (projectLoading || !params?.id) return;

    const foundProject = project?.find(data => data.id == params?.id);
    setSelectedProject(foundProject);
  }, [project, projectLoading]);

  // Create debounced mutation once
  const debouncedMutateRef = useRef(
    debounce((project: any) => {
      mutation.mutate(project);
    }, 500)
  );

  useEffect(() => {
    return () => {
      debouncedMutateRef.current.cancel();
    };
  }, []);

  const updatePhase = (index: number, updates: any) => {
    setSelectedProject(prev => {
      const updatedPhases = [...(prev?.phases || [])];
      updatedPhases[index] = { ...updatedPhases[index], ...updates };

      const newProject = prev ? { ...prev, phases: updatedPhases } : { phases: updatedPhases };
      debouncedMutateRef.current(newProject);
      return newProject;
    });
  };

  return (
    <div className="flex-1 bg-neutral-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <ProjectNav projectId={params.id} />

        {/* Hero Header */}
        <Card className="border border-greige-500/30 shadow-sm overflow-hidden">
          <div className="relative h-48">
            {/* <img
              src={selectedProject?.image || "/images/luxury-penthouse.png"}
              alt={selectedProject?.name}
              className="w-full h-full object-cover"
            /> */}
            <Image
              width={400}
              height={400}
              className="w-full brightness-75 h-full object-cover"
              src={
                selectedProject?.images[0]
                  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/Cover/${selectedProject?.id}/${selectedProject?.images[0]?.name}`
                  : projectCover
              }
              alt=""
              loading="lazy"
            />

            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-start justify-between">
                <div className="text-white drop-shadow-md">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold">{selectedProject?.name}</h1>
                    <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-sage-300/30 text-white/90 backdrop-blur-sm border border-white/20">
                      On Track
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    {selectedProject?.client && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {clientData?.data?.find(client => client?.id == selectedProject?.client)?.name}
                      </div>
                    )}
                    {(selectedProject?.location || selectedProject?.city || selectedProject?.country) && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{selectedProject?.location || `${selectedProject?.city}, ${selectedProject?.country}`}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                  onClick={openUploadModal}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* KPI Rail */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpiStats.map((stat) => (
            <Card
              key={stat.title}
              className="border border-greige-500/30 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <stat.icon className="w-4 h-4 text-slatex-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-700">
                      {stat.title}
                    </p>
                    <p className="text-lg font-semibold text-neutral-900">
                      {stat.value}
                    </p>
                    <p className="text-xs text-neutral-600">{stat.subtitle}</p>
                    <p className={`text-xs mt-1 ${stat.color}`}>{stat.trend}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div> */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Budget Utilization Card */}
          <Card className="border border-greige-500/30 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {/* <DollarSign className="w-4 h-4 text-slatex-600" /> */}
                <span> {selectedProject?.currency?.symbol || '£'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-700">Budget Utilization</p>
                  <p className="text-lg font-semibold text-neutral-900">
                    {selectedProject?.currency?.symbol || '£'}
                    {Number(selectedProject?.budget).toLocaleString('en-GB', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className="text-xs text-neutral-600">
                    {(() => {
                      // Calculate utilization based on payment schedule
                      let utilizedPercentage = 0;
                      let utilizedAmount = 0;

                      if (selectedProject?.paymentSchedule === '50-50') {
                        utilizedPercentage = 50;
                        utilizedAmount = (selectedProject?.budget || 0) * 0.5;
                      } else if (selectedProject?.paymentSchedule === '33-33-33') {
                        utilizedPercentage = 33;
                        utilizedAmount = (selectedProject?.budget || 0) * 0.33;
                      } else if (selectedProject?.paymentSchedule === '25-25-25-25') {
                        utilizedPercentage = 25;
                        utilizedAmount = (selectedProject?.budget || 0) * 0.25;
                      } else {
                        // Default to 0% if payment schedule is unknown
                        utilizedPercentage = 0;
                        utilizedAmount = 0;
                      }

                      return `${utilizedPercentage}% of ${selectedProject?.currency?.symbol || '£'}${Number(
                        selectedProject?.budget
                      ).toLocaleString('en-GB', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })} utilized`;
                    })()}
                  </p>
                  <p className="text-xs mt-1 text-olive-700">
                    {selectedProject?.paymentSchedule ? `Schedule: ${selectedProject.paymentSchedule}` : 'No schedule set'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profit Margin Card */}
          <Card className="border border-greige-500/30 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4 text-slatex-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-700">Profit Margin</p>
                  <p className="text-lg font-semibold text-neutral-900">0%</p>
                  <p className="text-xs text-neutral-600">{selectedProject?.currency?.symbol || '£'}0 projected</p>
                  <p className="text-xs mt-1 text-olive-700">+2% vs estimate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tasks Complete Card */}
          <Card className="border border-greige-500/30 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-slatex-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-700">Tasks Complete</p>
                  <p className="text-lg font-semibold text-neutral-900">
                    {taskData?.data?.filter(task => task.projectID === selectedProject?.id && task.status === 'done').length || 0}/
                    {taskData?.data?.filter(task => task.projectID === selectedProject?.id).length || 0}
                  </p>
                  <p className="text-xs text-neutral-600">
                    {Math.round(
                      ((taskData?.data?.filter(task => task.projectID === selectedProject?.id && task.status === 'done').length || 0) /
                        (taskData?.data?.filter(task => task.projectID === selectedProject?.id).length || 1)) *
                        100
                    )}
                    % completion
                  </p>
                  <p className="text-xs mt-1 text-ochre-700">
                    {taskData?.data?.filter(
                      task =>
                        task.projectID === selectedProject?.id &&
                        task.dueDate === new Date().toISOString().split('T')[0] &&
                        task.status !== 'done'
                    ).length || 0}{' '}
                    due today
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* POs Delayed Card */}
          <Card className="border border-greige-500/30 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-slatex-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-700">POs Delayed</p>
                  <p className="text-lg font-semibold text-neutral-900">5</p>
                  <p className="text-xs text-neutral-600">2 need approval</p>
                  <p className="text-xs mt-1 text-terracotta-600">Action required</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline Stripe */}
        <Card className="border border-greige-500/30 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-neutral-900">Project Timeline</h3>
              <div className="flex items-center gap-2 text-sm text-neutral-700">
                <Calendar className="w-4 h-4" />
                <span>Today: {formatTodayDate()}</span>
              </div>
            </div>
            <div className="relative">
              {selectedProject?.phases?.length && (
                <div className={`flex items-center justify-between gap-5 `}>
                  {selectedProject?.phases?.map((phase, index) => {
                    const now = new Date();
                    // Convert start and end dates to Date objects
                    const start = phase.startDate ? new Date(phase.startDate) : null;
                    const end = phase.endDate ? new Date(phase.endDate) : null;

                    // Check if phase is currently running
                    const isCurrent = start && end && now >= start && now <= end;

                    return (
                      <div key={phase.name} className="flex w-full flex-col  justify-center items-center relative">
                        <div>
                          {/* <Slider
                            value={[phase.progress ?? 0]}
                            max={100}
                            step={1}
                            className={cn('w-[100%] my-3')}
                            onValueChange={([val]) => updatePhase(index, { progress: val })}
                          ></Slider> */}

                          <TooltipProvider>
                            <Tooltip delayDuration={10}>
                              <TooltipTrigger asChild>
                                <Slider
                                  value={[phase.progress ?? 0]}
                                  max={100}
                                  step={1}
                                  className={cn('w-[100%] my-3')}
                                  onValueChange={([val]) => updatePhase(index, { progress: val })}
                                />
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p>{phase.progress ?? 0}%</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <div className="mt-2 text-center">
                            <div className={`text-xs font-medium ${isCurrent ? 'text-clay-600' : 'text-neutral-700'}`}>{phase?.name}</div>
                            <div className={`text-xs ${isCurrent ? 'text-clay-800' : 'text-neutral-500'}`}>
                              {start
                                ? start.toLocaleDateString('en-GB', {
                                    month: 'short',
                                    day: 'numeric',
                                  })
                                : ''}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Procurement Radar */}
        <Card className="border border-greige-500/30 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-slatex-600" />
                <h3 className="text-sm font-medium text-neutral-900">Procurement Status</h3>
              </div>
              <Button
                onClick={() => router.push(`/projects/${selectedProject?.id}/procurement`)}
                variant="outline"
                size="sm"
                className="border-greige-500/30 bg-transparent"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Open Procurement
              </Button>
            </div>
            <div className="bg-terracotta-600/10 border border-terracotta-600/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-terracotta-600" />
                <span className="text-sm font-medium text-terracotta-600">Action Required</span>
              </div>
              <p className="text-sm text-terracotta-600">
                <strong>5 items overdue delivery</strong> • 2 POs need approval
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Task Progress & Blockers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border border-greige-500/30 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-neutral-900">Task Progress</h3>
                <span className="text-sm text-neutral-700">
                  {calculateProjectProgress(selectedProject?.id, taskData?.data, taskLoading)}% Complete
                </span>
              </div>

              <Progress
                value={calculateProjectProgress(selectedProject?.id, taskData?.data, taskLoading)}
                className="[&>div]:bg-clay-500 mb-4"
              />

              {taskData?.data && (
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-neutral-900">{getCompletedTasks(taskData.data, selectedProject?.id)}</div>
                    <div className="text-xs text-neutral-600">Completed</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-neutral-900">{getInProgressTasks(taskData.data, selectedProject?.id)}</div>
                    <div className="text-xs text-neutral-600">In Progress</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-neutral-900">{getRemainingTasks(taskData.data, selectedProject?.id)}</div>
                    <div className="text-xs text-neutral-600">Remaining</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border border-greige-500/30 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-neutral-900">Active Blockers</h3>
                <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-terracotta-600/10 text-terracotta-600 border border-terracotta-600/30">
                  0 Active
                </span>
              </div>
              <div className="space-y-3">
                {
                  !blockers.map(blocker => (
                    <div key={blocker.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="bg-neutral-900 text-white text-xs font-semibold">{blocker.avatar}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium text-neutral-900">{blocker.title}</div>
                          <div className="text-xs text-neutral-600">
                            {blocker.assignee} • {blocker.daysBlocked} days blocked
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
                            blocker.priority === 'high'
                              ? 'bg-terracotta-600/10 text-terracotta-600 border border-terracotta-600/30'
                              : 'bg-ochre-300/20 text-ochre-700 border border-ochre-700/20'
                          }`}
                        >
                          {blocker.priority}
                        </span>
                        <Button size="sm" variant="outline" className="text-xs border-greige-500/30 bg-transparent">
                          Unblock
                        </Button>
                      </div>
                    </div>
                  ))
                }

                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="text-sm font-medium text-neutral-900">No Active Blocker</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity & Files */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border border-greige-500/30 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-neutral-900">Recent Activity</h3>
                <Button variant="ghost" size="sm" className="text-xs text-clay-600 hover:text-clay-700">
                  View All
                </Button>
              </div>
              <div className="space-y-4">
                {recentActivity.map(activity => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-neutral-900 text-white text-xs font-semibold">{activity.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-neutral-900">
                        <span className="font-medium">{activity.user}</span> {activity.action}
                      </p>
                      <p className="text-xs text-neutral-600">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-greige-500/30 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-neutral-900">Latest Files</h3>
                <Button variant="ghost" size="sm" className="text-xs text-clay-600 hover:text-clay-700">
                  <ArrowRight className="w-4 h-4 mr-1" />
                  Open Docs
                </Button>
              </div>
              <div className="space-y-3">
                {recentFiles.map(file => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-slatex-600" />
                      <div>
                        <div className="text-sm font-medium text-neutral-900">{file.name}</div>
                        <div className="text-xs text-neutral-600">
                          {file.uploadedBy} • {file.uploadedAt}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-neutral-600">{file.size}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upload Modal */}
      <Modal
        className="!h-[600px] !max-w-[700px] !py-7"
        isOpen={uploadModal}
        onRequestClose={UploadCloseModal}
        contentLabel="Upload Documents Modal"
      >
        <div className="navbar flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold flex items-center gap-2">
              <p>Upload Documents</p>
            </div>
          </div>
          <div className="buttons flex items-center gap-3 !mt-0 px-2">
            <button
              onClick={UploadCloseModal}
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

        {selectedProject?.images.length > 0 ? (
          <div className="relative w-full h-44">
            <Image
              width={400}
              height={400}
              className="w-full h-full object-cover"
              src={
                selectedProject?.images[0]
                  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/Cover/${selectedProject?.id}/${selectedProject?.images[0]?.name}`
                  : projectCover
              }
              alt=""
              loading="lazy"
            />

            <button
              onClick={() => handleDeleteTask()}
              className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
            >
              <Trash2 size={14} />
            </button>
            {/* <Dialog>
              <DialogTrigger>
              </DialogTrigger>
              <DeleteDialog
                task={null}
                handleDeleteTask={() => handleDeleteTask()}
              />
            </Dialog> */}
          </div>
        ) : (
          <>
            <div className="w-full max-w-lg mx-auto">
              {/* File Drop Area */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => document.getElementById('fileInput')?.click()}
                className="border-dashed cursor-pointer mt-10 w-full border-2 flex flex-col gap-5 items-center justify-center py-6 rounded-2xl border-gray-300 hover:border-gray-400 transition-colors"
              >
                <div className="flex flex-col items-center gap-3">
                  <input id="fileInput" type="file" multiple onChange={handleSelectByClick} className="hidden" />
                  <div className="bg-gray-100 w-24 h-24 flex items-center justify-center rounded-full">
                    <Upload size={23} />
                  </div>
                  <div className="text-center">
                    <p className="text-lg mb-1 font-medium">Drag and Drop or Click </p>
                    <p className="text-sm text-gray-600">to upload multiple documents (max: 50MB each)</p>
                  </div>
                  {error && <p className="text-red-500 text-sm font-semibold">{error}</p>}
                </div>
              </div>

              {/* File List */}
              {file && file?.length > 0 && (
                <div className="mt-6 border rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Selected Files ({file.length})</h3>
                    <button
                      onClick={() => {
                        file.forEach(file => {
                          if ((file as any).preview) URL.revokeObjectURL((file as any).preview);
                        });
                        setFile([]);
                      }}
                      className="text-sm hover:text-red-700"
                    >
                      Remove All
                    </button>
                  </div>

                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {file.map((file, index) => (
                      <div key={(file as any).id || index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <div className="p-2 rounded flex-shrink-0">
                              <svg
                                className="w-6 h-6 text-black"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                ></path>
                              </svg>
                            </div>
                            <span className="truncate flex-1">{(file as any).name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleRemoveFile(index)} className="text-black hover:text-red-700">
                              <X size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {file.length > 0 && (
                    <button onClick={handleFileSubmit} className="mt-4 w-full bg-black text-white py-2 px-4 rounded-md transition-colors">
                      Upload {file.length} {file.length === 1 ? 'File' : 'Files'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
