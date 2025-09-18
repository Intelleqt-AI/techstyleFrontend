'use client';

import * as React from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  CalendarIcon,
  Check,
  TagIcon,
  Users,
  GitBranch,
  Flag,
  Paperclip,
  ListTodo,
  GripVertical,
  Trash2,
  Folder,
  CircleDot,
  TypeIcon,
  Plus,
  Search,
  X,
  Smile,
  ImageIcon,
  Clock3,
  Palette,
  FileText,
  Eye,
  Circle,
  Hammer,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { TypeChip } from '@/components/chip';
import type { ListColumn, Phase, TeamMember, Task, Subtask, Priority, Status, Attachment } from '@/components/tasks/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import useProjects from '@/supabase/hook/useProject';
import useUser from '@/supabase/hook/useUser';
import {
  addNewTask,
  createNotification,
  fetchOnlyProject,
  fetchProjects,
  getAllFiles,
  getUsers,
  modifyTask,
  uploadDoc,
} from '@/supabase/API';
import { toast } from 'sonner';
import DraggableSubtasks2 from './DraggableSubtasks2';
import { AnimatePresence, motion } from 'framer-motion';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const initialTask: Task = {
  name: '',
  tag: '',
  progress: 0,
  dueDate: '',
  subtasks: [],
  attachments: [],
  priority: '',
  description: '',
  status: 'todo',
  assignee: '',
  phase: 'initial',
  projectID: '',
  comments: [],
  assigned: [],
  startTime: 0,
  endTime: 0,
  isActive: false,
  isPaused: false,
  totalWorkTime: 0,
  note: '',
};

const lists: (ListColumn & { icon: any; colorClass: string; id: string })[] = [
  {
    id: 'concept',
    title: 'Design Concepts',
    icon: Palette,
    colorClass: 'text-purple-600',
  },
  {
    id: 'design-dev',
    title: 'Design Development',
    icon: CircleDot,
    colorClass: 'text-amber-600',
  },
  {
    id: 'technical',
    title: 'Technical Drawings',
    icon: FileText,
    colorClass: 'text-orange-600',
  },
  {
    id: 'review',
    title: 'Client Review',
    icon: Eye,
    colorClass: 'text-rose-600',
  },
  {
    id: 'procurement',
    title: 'Procurement',
    icon: Circle,
    colorClass: 'text-emerald-600',
  },
  {
    id: 'site',
    title: 'Site / Implementation',
    icon: Hammer,
    colorClass: 'text-slate-600',
  },
  {
    id: 'complete',
    title: 'Complete',
    icon: CheckCircle2,
    colorClass: 'text-gray-600',
  },
];

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  projectId: string;
  projectName?: string;
  lists: ListColumn[];
  phases: Phase[];
  team: TeamMember[];
  defaultListId?: string;
  taskToEdit?: (Omit<Task, 'assigneeIds'> & { assignees?: string[] }) | null;
  onSave: (payload: Omit<Task, 'id'> & { id?: string }) => void;
};

export function TaskModal({ open, onOpenChange, projectId, projectName, team, phase, taskToEdit, onSave }: Props) {
  // Core form state
  const [taskValues, setTaskValues] = React.useState(taskToEdit ? taskToEdit : initialTask);
  const [activeTab, setActiveTab] = React.useState(1);
  const [subTaskText, setSubTaskText] = React.useState('');
  const [comment, setComment] = React.useState({
    name: '',
    value: '',
    time: '',
    profileImg: '',
  });

  const queryClient = useQueryClient();
  // Users Dropdown
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);
  const [teamMembers, setTeamMembers] = React.useState([]);
  const [selectedMembers, setSelectedMembers] = React.useState([]);
  const form2 = useForm({});
  const lastInputRef = React.useRef(null);
  // const { data, isLoading: projectLoading } = useProjects();
  const { user, isLoading: userLoading } = useUser();
  const { data = [], isLoading: projectLoading } = useQuery({
    queryKey: ['fetchOnlyProject'],
    queryFn: () => fetchOnlyProject({ projectID: null }),
  });

  // Mention dropdown
  const mentionRef = React.useRef(null);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [filteredUsers, setFilteredUsers] = React.useState(teamMembers);
  const textareaRef = React.useRef(null);

  // set if a user mention another user in comment
  const [mention, setMention] = React.useState(null);
  const [notification, setNotification] = React.useState(null);

  // set if a user mention another user in subTask
  const [mentionSub, setMentionSub] = React.useState([]);
  const [subNotification, setSubNotification] = React.useState(null);
  const fileInputRef = React.useRef(null);
  const [file, setFile] = React.useState(null);
  const [totalDocs, setTotalDocs] = React.useState([]);

  React.useEffect(() => {
    if (taskToEdit) {
      setTaskValues(prevValues => ({
        ...prevValues,
        ...taskToEdit,
      }));
    }
  }, [taskToEdit]);

  React.useEffect(() => {
    if (!open) return;
    if (projectId && phase) {
      setTaskValues(prevValues => ({
        ...prevValues,
        projectID: projectId,
        phase,
      }));
    } else if (projectId) {
      setTaskValues(prevValues => ({
        ...prevValues,
        projectID: projectId,
      }));
    }
  }, [open, projectId, phase]);

  const [subtasks, setSubtasks] = React.useState<Subtask[]>(
    taskToEdit?.subtasks?.length ? taskToEdit.subtasks : [{ id: crypto.randomUUID(), title: '', done: false }]
  );

  const handleCloseModal = e => {
    onOpenChange(false);
    setTaskValues(initialTask);
    onOpenChange(false);
  };

  // Get Users
  const {
    data: users,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  // Define the mutation
  const mutation = useMutation({
    mutationFn: async input => {
      if (taskToEdit || taskValues?.id) {
        return modifyTask(input);
      } else {
        return addNewTask(input);
      }
    },
    onSuccess: e => {
      toast.success('Task Updated');
      console.log(e);
      setSubTaskText('');
      setTaskValues(prev => ({
        ...prev,
        id: e?.[0]?.id,
      }));
      queryClient.invalidateQueries(['tasks']);
    },
    onError: e => {
      toast.error('Error! Try again');
    },
  });

  // Create nofitioan
  const notificationMutation = useMutation({
    mutationFn: createNotification,
    onSuccess: () => {
      setMention(null);
      setMentionSub([]);
      setNotification(null);
    },
    onError: () => {
      toast('Error! Try again');
    },
  });

  // Task submit
  const handleSubmit = () => {
    if (taskValues?.name?.trim().length < 1) {
      toast.error('Enter task name');
      return;
    }
    if (selectedMembers.length > 0 && taskToEdit) {
      selectedMembers.map(item => {
        if (item.email == user?.email) {
          return;
        } else {
          const notification = {
            id: Date.now(),
            link: '/my-task',
            type: 'task',
            itemID: taskToEdit?.id,
            title: `${taskValues.name}`,
            isRead: false,
            message: `${taskValues.name}`,
            timestamp: Date.now(),
            creator: user,
          };
          notificationMutation.mutate({ email: item.email, notification });
        }
      });
    }
    if (mentionSub.length > 0) {
      mentionSub.map(item => {
        if (item.email == user.email) {
          return;
        } else {
          const notification = {
            id: Date.now(),
            link: '/my-task',
            type: 'subtask',
            itemID: taskToEdit?.id,
            title: `${user.name}`,
            isRead: false,
            message: `${taskValues.name}`,
            timestamp: Date.now(),
            creator: user,
          };
          notificationMutation.mutate({ email: item.email, notification });
        }
      });
    }
    // This will trigger if comment submitted
    if (notification) {
      notificationMutation.mutate({ email: mention.email, notification });
    }
    mutation.mutate({ newTask: taskValues, user: user });
    onOpenChange(false);
    // customCloseHandle();
  };

  // Handle Click Save
  const handleClickSave = () => {
    handleSubmit();
    setTimeout(() => {
      // afterCloseModal();
    }, 1000);
  };
  const handleCommentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent full page reload

    if (!comment.value.trim()) return; // ignore empty comments

    const newComment = {
      ...comment,
      time: new Date().toLocaleString(),
      name: user?.name || 'Anonymous',
      profileImg: user?.photoURL || '',
    };

    // Update notifications if mention exists
    if (mention) {
      const notification = {
        id: Date.now(),
        link: '/my-task',
        type: 'comment',
        itemID: taskValues?.id || taskValues?.id,
        title: taskValues?.name,
        isRead: false,
        message: newComment.value,
        timestamp: Date.now(),
        creator: user,
      };
      setNotification(notification);
    }

    // Update local task state
    setTaskValues(prev => ({
      ...prev,
      comments: [...(prev.comments || []), newComment],
    }));

    // Send mutation to server
    mutation.mutate({
      newTask: {
        ...taskValues,
        comments: [...(taskValues?.comments || []), newComment],
      },
      user,
    });

    // Clear input
    setComment({ value: '', name: '', time: '', profileImg: '' });
  };

  // Update taskValues with the values from task
  // React.useEffect(() => {
  //   if (phase) {
  //     setTaskValues(prevValues => ({
  //       ...prevValues,
  //       phase: phase,
  //     }));
  //   }
  // }, [modalOpen, phase]);

  // React.useEffect(() => {
  //   setTaskValues(prevValues => ({
  //     ...prevValues,
  //     ...(taskToEdit || initialTask),
  //     projectID: projectId || prevValues.projectID,
  //   }));
  // }, [taskToEdit, projectId]);

  // Handle changes in the textarea
  const handleCommentChanges = e => {
    const { value } = e.target;
    setComment(prev => ({ ...prev, value: value }));
    if (value.includes('@')) {
      const cursorPosition = e.target.selectionStart;
      const textBeforeCursor = value.slice(0, cursorPosition);
      const lastAtSymbolIndex = textBeforeCursor.lastIndexOf('@');
      if (lastAtSymbolIndex !== -1) {
        const searchText = textBeforeCursor.slice(lastAtSymbolIndex + 1);
        const filtered = teamMembers.filter(user => user.name.toLowerCase().includes(searchText.toLowerCase()));
        setFilteredUsers(filtered);
        setShowDropdown(true);
      } else {
        setShowDropdown(false);
      }
    } else {
      setShowDropdown(false);
    }
  };

  // Handle selecting a user from the dropdown
  const handleSelectUser = user => {
    const { value } = comment;
    const cursorPosition = textareaRef.current.selectionStart;
    const textBeforeCursor = value.slice(0, cursorPosition);
    const textAfterCursor = value.slice(cursorPosition);
    const lastAtSymbolIndex = textBeforeCursor.lastIndexOf('@');
    const newText = textBeforeCursor.slice(0, lastAtSymbolIndex) + `@${user.name}` + textAfterCursor;
    setComment(prev => ({ ...prev, value: newText }));
    setShowDropdown(false);
    textareaRef.current.focus();
    const newCursorPosition = lastAtSymbolIndex + user.name.length + 1;
    textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
    setMention(user);
  };

  const draggableSubtasksRef = React.useRef(null);
  // create new Subtask
  const handleCreateSubTask = () => {
    setTaskValues(prevTask => ({
      ...prevTask,
      subtasks: [
        ...prevTask.subtasks,
        {
          order: taskValues.subtasks.length + 1 || 1,
          id: Date.now(),
          text: subTaskText,
        },
      ],
    }));
    // Focus on the last input in the DraggableSubtasks component
    if (draggableSubtasksRef.current) {
      draggableSubtasksRef.current.focusLastInput();
    }
  };

  const handleModifySubTask = (e, id) => {
    const newText = e.target.value;
    setTaskValues(prev => ({
      ...prev,
      subtasks: prev.subtasks.map(subtask => (subtask.id === id ? { ...subtask, text: newText } : subtask)),
    }));
  };

  // const handleEnter = (e, id) => {
  //   if (e.key === 'Enter') {
  //     handleModifySubTask(e, id);
  //     requestAnimationFrame(() => {
  //       if (textArea.current) {
  //         textArea.current.focus();
  //       }
  //     });
  //   }
  // };

  // Set users from DB
  React.useEffect(() => {
    if (isLoading) return;
    setTeamMembers(users?.data);
  }, [isLoading, users]);

  const handleSubTaskSelect = (id: number) => {
    const updatedSubTasks = taskValues?.subtasks?.map(item => (item?.id === id ? { ...item, selected: !item.selected } : item));
    setTaskValues(prevTask => ({
      ...prevTask,
      subtasks: updatedSubTasks,
    }));
  };

  const handleMemberSelect = member => {
    setSelectedMembers([...selectedMembers, member]);
    setTeamMembers(teamMembers.filter(m => m.email !== member.email));
    setTaskValues(prev => ({
      ...prev,
      assigned: prev.assigned ? [...prev.assigned, member] : [member],
    }));
    setIsOpen(false);
  };

  const handleMemberRemove = member => {
    setSelectedMembers(prev => prev.filter(m => m.email !== member.email));
    setTeamMembers(prev => [...prev, member]);
    setTaskValues(prev => ({
      ...prev,
      assigned: prev.assigned ? prev.assigned.filter(m => m.email !== member.email) : [],
    }));
  };

  const updateTask = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTaskValues(prevTask => {
      const newValues = {
        ...prevTask,
        [name]: value,
      };
      return newValues;
    });
  };

  // Submit Task after enter name
  const handleSubmitOnBlur = () => {
    if (taskValues?.name.length < 1) {
      toast.error('Enter Task Name');
      return;
    }
    mutation.mutate({ newTask: taskValues, user: user });
  };

  const handleDeleteSubTask = (e, id) => {
    e.stopPropagation();
    setTaskValues(prevTask => ({
      ...prevTask,
      subtasks: prevTask.subtasks.filter(subtask => subtask.id !== id),
    }));
  };

  const [touched, setTouched] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);
  const titleRef = React.useRef<HTMLInputElement>(null);

  // Cmd/Ctrl + Enter to save
  const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLFormElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  }, []);

  function toggleAssignee(member: any) {
    setTaskValues(prev => {
      const alreadyAssigned = prev.assigned.some((a: any) => a.id === member.id);

      return {
        ...prev,
        assigned: alreadyAssigned
          ? prev.assigned.filter((a: any) => a.id !== member.id) // remove
          : [...prev.assigned, member], // add object
      };
    });
  }

  // Label rail (160px) with small icon + label
  const Labeled = React.memo(
    ({
      icon,
      label,
      children,
      alignTop = false,
    }: {
      icon: React.ReactNode;
      label: string;
      children: React.ReactNode;
      alignTop?: boolean;
    }) => {
      return (
        <div className="grid grid-cols-[160px_1fr] gap-4 items-center">
          <div className={cn('flex items-center gap-2 text-[13px] text-gray-600', alignTop && 'self-start pt-1')}>
            <span className="text-gray-500">{icon}</span>
            <span className="truncate">{label}</span>
          </div>
          <div>{children}</div>
        </div>
      );
    }
  );

  function initialsOf(name: string): string {
    if (!name) return '';

    const parts = name.trim().split(/\s+/);

    if (parts.length > 1) {
      // Take first char of first and last word
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }

    // Only one word -> take first 2 letters
    return name.substring(0, 2).toUpperCase();
  }

  function AssigneesMultiSelect({ users }) {
    const [openPop, setOpenPop] = React.useState(false);
    const selected = taskValues?.assigned || [];

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Popover open={openPop} onOpenChange={setOpenPop}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={openPop}
                className="w-full justify-between bg-white h-9 text-sm rounded-xl"
              >
                <span className="flex items-center gap-2 overflow-hidden">
                  {selected?.length > 0 ? (
                    <>
                      <div className="flex -space-x-2">
                        {selected.slice(0, 4).map(m => (
                          <Avatar key={m.id} className="h-6 w-6 ring-2 ring-white">
                            {/* @ts-ignore optional avatarUrl */}
                            <AvatarImage src={(m as any).avatarUrl || ''} alt={m.name} />
                            <AvatarFallback className="text-[10px]">{initialsOf(m?.name)}</AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <span className="truncate text-sm text-gray-600">
                        {selected.length} selected
                        {selected.length > 4 ? ' +' + (selected.length - 4) : ''}
                      </span>
                    </>
                  ) : (
                    <span className="flex items-center gap-2 text-gray-500">
                      <Search className="h-4 w-4" />
                      Search teammates…
                    </span>
                  )}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[360px] rounded-xl border border-gray-200 shadow-md" align="start">
              <Command>
                <CommandInput
                  placeholder="Search teammates…"
                  className=" focus-visible:ring-gray-300 focus-visible:ring-offset-0 focus:outline-none"
                />
                <CommandEmpty>No member on this project</CommandEmpty>
                <CommandList className="max-h-64">
                  <CommandGroup>
                    {users?.map(m => {
                      const checked = taskValues?.assigned?.some(a => a.id === m.id);
                      return (
                        <CommandItem key={m.id} value={m.name} className="flex items-center gap-2">
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleAssignee(m)}
                            className="focus-visible:ring-gray-300 data-[state=checked]:bg-gray-900 data-[state=checked]:text-white"
                          />
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={m.avatarUrl || ''} alt={m.name} />
                            <AvatarFallback className="text-[10px]">{initialsOf(m?.name)}</AvatarFallback>
                          </Avatar>
                          <span className="truncate">{m.name}</span>
                          {taskValues?.assigned?.some(a => a.id === m.id) && <Check className="ml-auto h-4 w-4 text-gray-500" />}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {selected?.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                setTaskValues(prev => ({
                  ...prev,
                  assigned: [],
                }))
              }
            >
              Clear
            </Button>
          )}
        </div>

        {taskValues?.assigned?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {taskValues?.assigned?.map(m => (
              <span onClick={() => toggleAssignee(m)}>
                <TypeChip key={m.id} label={m.name} className="cursor-pointer" />
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  function handleAddComment() {
    const body = newComment.trim();
    if (!body) return;
    const me = team.find(t => t.id === assignees[0]) ?? ({ id: 'me', name: 'You' } as TeamMember);
    const c: Comment = {
      id: crypto.randomUUID(),
      author: { id: me.id, name: (me as any).name || 'You' },
      body,
      createdAt: Date.now(),
    };
    setComments(prev => [c, ...prev]);
    setNewComment('');
    setActivity(prev => [
      {
        id: crypto.randomUUID(),
        text: 'Added a comment',
        createdAt: Date.now(),
      },
      ...prev,
    ]);
  }

  // handle Task Save
  const handleSave = e => {
    e.preventDefault();
    handleClickSave();
  };

  // File Upload Handler

  // Get All Files
  const {
    data: files,
    isLoading: attachentLoading,
    error: attachentError,
    refetch: attachentRefetch,
  } = useQuery({
    queryKey: ['GetAllFiles', taskValues?.id],
    queryFn: () => getAllFiles(taskValues?.id),
    enabled: !!taskValues?.id,
  });

  // File Upload Function
  const attachmentMutation = useMutation({
    mutationFn: uploadDoc,
    onMutate: () => {
      toast.loading('Uploading...', { id: 'upload-toast' });
    },
    onSuccess: data => {
      // queryClient.invalidateQueries(['tasks']);
      attachentRefetch();
      toast.dismiss('upload-toast');
      toast.success(`Uploaded successfully!`);
    },
    onError: () => {
      toast.dismiss('upload-toast');
      toast.error('Failed to upload document.');
    },
  });

  const handleFileChange = event => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE) {
        setFile(null);
        toast('File size must be less than 5MB!');
      } else {
        setFile(selectedFile);
        attachmentMutation.mutate({
          file: selectedFile,
          id: taskValues?.id,
          projectID: taskValues?.projectID,
          task: taskValues,
        });
      }
    }
  };

  // File Upload Button
  // const handleButtonClick = () => {
  //   fileInputRef.current.click();
  // };

  return (
    <Sheet open={open} onOpenChange={e => handleCloseModal(e)}>
      {/* Single rounded grey surface with balanced padding (28px top/side) */}
      <SheetContent
        onOpenAutoFocus={e => e.preventDefault()}
        side="right"
        className="v0-task-sheet w-full sm:max-w-[700px] md:max-w-[720px] h-full px-8 md:px-9 pt-10 md:pt-10 pb-0 bg-gray-50 rounded-2xl shadow-xl flex flex-col overflow-hidden"
      >
        <form
          ref={formRef}
          onSubmit={e => handleSave(e)}
          onKeyDown={handleKeyDown}
          className="flex-1 pt-5 overflow-auto thin-scrollbar pr-2 overscroll-contain pb-20"
          aria-label="Task form"
        >
          {/* Title row */}
          <div className="pb-6">
            <div className="grid grid-cols-[160px_1fr] gap-4 items-center">
              <div className="flex items-center gap-2 text-[13px] text-gray-600">
                <TypeIcon className="h-4 w-4 text-gray-500" />
                <span>Task Title</span>
              </div>
              <Input
                type="text"
                name="name"
                value={taskValues.name}
                onChange={updateTask}
                onBlur={() => handleSubmitOnBlur()}
                autoFocus={false}
                placeholder="Add task name..."
                className={cn(
                  'bg-white h-10 text-[16px] md:text-[17px] font-medium rounded-xl',
                  !taskValues.name.trim() && touched && 'border-red-300 focus-visible:ring-red-200'
                )}
                aria-invalid={!taskValues.name.trim() && touched}
              />
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <Labeled icon={<Folder className="h-4 w-4" />} label="Project">
              <Select
                value={taskValues?.projectID || projectId || ''}
                onValueChange={value => {
                  const e = {
                    target: {
                      name: 'projectID',
                      value: value,
                    },
                  };
                  updateTask(e);
                }}
              >
                <SelectTrigger className="w-full bg-white h-9 text-sm rounded-xl">
                  <SelectValue placeholder="Select Project" />
                </SelectTrigger>
                <SelectContent className="bg-white z-[99] max-h-[300px] overflow-y-auto ">
                  {!projectId && (
                    <SelectItem disabled value="Select Project">
                      Select Project
                    </SelectItem>
                  )}
                  {projectId
                    ? data
                        ?.filter(item => item.id == projectId)
                        .map(item => (
                          <SelectItem key={item.id} value={item?.id}>
                            {item.name}
                          </SelectItem>
                        ))
                    : data
                    ? data?.map(item => (
                        <SelectItem key={item.id} value={item?.id}>
                          {item.name}
                        </SelectItem>
                      ))
                    : data?.map(item => (
                        <SelectItem key={item.id} value={item?.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            </Labeled>

            <AnimatePresence mode="popLayout">
              {taskValues?.projectID && (
                <motion.div
                  key="phase-select"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <Labeled icon={<GitBranch className="h-4 w-4" />} label="Phase">
                    <Select
                      value={taskValues?.phase || ''}
                      onValueChange={value => {
                        const e = {
                          target: {
                            name: 'phase',
                            value,
                          },
                        };
                        updateTask(e);
                      }}
                    >
                      <SelectTrigger className="w-full bg-white h-9 text-sm rounded-xl">
                        <SelectValue placeholder="No phase" />
                      </SelectTrigger>
                      <SelectContent>
                        {data
                          ?.find(item => item.id == taskValues?.projectID)
                          ?.phases?.map(selectItem => (
                            <SelectItem value={selectItem?.id}>{selectItem?.name}</SelectItem>
                          ))}

                        {data?.find(item => item.id == taskValues?.projectID)?.phases?.length == undefined && (
                          <SelectItem disabled>No phases</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </Labeled>
                </motion.div>
              )}
            </AnimatePresence>

            <Labeled icon={<CircleDot className="h-4 w-4" />} label="Status">
              <Select
                value={taskValues?.status || ''}
                onValueChange={value => {
                  const e = {
                    target: {
                      name: 'status',
                      value: value,
                    },
                  };
                  updateTask(e);
                }}
              >
                <SelectTrigger className="w-full bg-white h-9 text-sm rounded-xl">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To‑do</SelectItem>
                  <SelectItem value="in-progress">In progress</SelectItem>
                  <SelectItem value="in-review">In review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </Labeled>

            <Labeled icon={<Flag className="h-4 w-4" />} label="Priority">
              <Select
                value={taskValues?.priority || ''}
                onValueChange={value => {
                  const e = {
                    target: {
                      name: 'priority',
                      value: value,
                    },
                  };
                  updateTask(e);
                }}
              >
                <SelectTrigger className="w-full bg-white h-9 text-sm rounded-xl">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </Labeled>

            <Labeled icon={<CalendarIcon className="h-4 w-4" />} label="Start Date">
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal bg-white h-9 text-sm rounded-xl',
                        !taskValues?.startDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                      {taskValues?.startDate ? format(toDateFromYMD(taskValues?.startDate), 'PPP') : 'Pick start date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 rounded-xl border border-gray-200 shadow-md" align="start">
                    <Calendar
                      mode="single"
                      selected={taskValues?.startDate ? toDateFromYMD(taskValues?.startDate) : null}
                      onSelect={d =>
                        setTaskValues(prev => ({
                          ...prev,
                          startDate: d ? format(d, 'yyyy-MM-dd') : undefined,
                        }))
                      }
                      initialFocus
                      // setStartDate(d ? format(d, 'yyyy-MM-dd') : undefined)
                    />
                  </PopoverContent>
                </Popover>
                {taskValues?.startDate && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => setTaskValues(prev => ({ ...prev, startDate: null }))}>
                    Clear
                  </Button>
                )}
              </div>
            </Labeled>

            <Labeled icon={<CalendarIcon className="h-4 w-4" />} label="Due Date">
              <div className="grid grid-cols-1 sm:grid-cols-1 gap-2.5">
                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal bg-white h-9 text-sm rounded-xl',
                          !taskValues?.dueDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                        {taskValues?.dueDate ? format(toDateFromYMD(taskValues?.dueDate), 'PPP') : 'Pick due date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 rounded-xl border border-gray-200 shadow-md" align="start">
                      <Calendar
                        mode="single"
                        selected={taskValues?.dueDate ? toDateFromYMD(taskValues?.dueDate) : undefined}
                        onSelect={d =>
                          setTaskValues(prev => ({
                            ...prev,
                            dueDate: d ? format(d, 'yyyy-MM-dd') : undefined,
                          }))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {taskValues?.dueDate && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setTaskValues(prev => ({ ...prev, dueDate: null }))}>
                      Clear
                    </Button>
                  )}
                </div>
                {/* <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    step={1}
                    placeholder="1"
                    value={typeof estimateHours === 'number' ? String(estimateHours) : ''}
                    onChange={e => {
                      const v = e.target.value;
                      if (v === '') setEstimateHours(undefined);
                      else {
                        const n = Number(v);
                        setEstimateHours(Number.isNaN(n) ? undefined : Math.max(1, Math.floor(n)));
                      }
                    }}
                    className="bg-white h-9 text-sm rounded-xl"
                    aria-label="Duration (days)"
                  />
                  <span className="text-xs text-gray-500">Duration (days)</span>
                </div> */}
              </div>
            </Labeled>

            {/* <Labeled icon={<TagIcon className="h-4 w-4" />} label="Tags">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a tag and press Enter (e.g., Kitchen)"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTagFromInput();
                      }
                    }}
                    className="bg-white h-9 text-sm rounded-xl"
                  />
                  <Button type="button" variant="outline" onClick={addTagFromInput} className="bg-white h-9 rounded-xl">
                    Add
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map(t => (
                      <TypeChip
                        key={t}
                        label={
                          <span className="inline-flex items-center gap-1">
                            <span>{t}</span>
                            <button
                              type="button"
                              className="ml-0.5 rounded hover:bg-gray-100"
                              onClick={() => removeTag(t)}
                              aria-label={`Remove ${t}`}
                              title="Remove"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        }
                      />
                    ))}
                  </div>
                )}
              </div>
            </Labeled> */}

            <Labeled icon={<Users className="h-4 w-4" />} label="Assignees">
              <AssigneesMultiSelect users={data?.find(item => item.id == taskValues?.projectID)?.assigned} />
            </Labeled>

            <div className="grid grid-cols-[160px_1fr] gap-4 items-start">
              <div className="flex items-center gap-2 text-[13px] text-gray-600 self-start pt-1">
                <span className="text-gray-500">
                  <TypeIcon className="h-4 w-4" />
                </span>
                <span className="truncate">Description</span>
              </div>
              <div>
                <Textarea
                  placeholder="Add details… use @ to mention teammates. Attach files below."
                  id="description"
                  name="description"
                  rows={5}
                  value={taskValues?.description || ''}
                  onChange={e => {
                    setTaskValues(prev => ({
                      ...prev,
                      description: e.target.value,
                    }));
                  }}
                  className="min-h-[104px] bg-white text-sm rounded-xl"
                />
              </div>
            </div>

            <Labeled icon={<Paperclip className="h-4 w-4" />} label="Attachment" alignTop>
              <div className="space-y-2">
                <Input id="files" type="file" multiple onChange={handleFileChange} className="bg-white h-9 text-sm rounded-xl" />
                {files?.data?.length > 0 && (
                  <ul className="text-xs text-gray-600 list-disc pl-5">
                    {files?.data?.map(a => (
                      <li key={a.name + a.size}>
                        {a.name} ({Math.round(a.size / 1024)} KB)
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </Labeled>

            <Labeled icon={<ListTodo className="h-4 w-4" />} label="Sub Tasks" alignTop>
              {/* <div className="space-y-2">
                {subtasks.map((s, idx) => (
                  <div
                    key={s.id}
                    className={cn(
                      'flex items-center gap-2 rounded-xl bg-white/80 border border-gray-200 pl-2 pr-2 h-10',
                      s?.title?.trim() === '' && idx === subtasks?.length - 1 && 'opacity-80'
                    )}
                  >
                    <Checkbox
                      checked={s.done}
                      // onCheckedChange={v => updateSubtask(s.id, { done: Boolean(v) })}
                      className="mr-1 focus-visible:ring-gray-300 data-[state=checked]:bg-gray-900 data-[state=checked]:text-white"
                      aria-label="Toggle subtask"
                    />
                    <Input
                      value={s.title}
                      // onChange={e => updateSubtask(s.id, { title: e.target.value })}
                      // onKeyDown={e => {
                      //   if (e.key === 'Enter') {
                      //     e.preventDefault();
                      //     if (s?.title?.trim() !== '') addSubtask();
                      //   }
                      // }}
                      placeholder={idx === subtasks?.length - 1 ? 'Subtask…' : ''}
                      className="flex-1 border-0 shadow-none focus-visible:ring-0 bg-transparent h-9 text-sm"
                    />
                    <GripVertical className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    {s?.title?.trim() !== '' && (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-gray-700"
                        // onClick={() => removeSubtask(s.id)}
                        aria-label="Remove subtask"
                        title="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <div className="flex justify-end">
                  <Button type="button" variant="ghost" size="sm" className="gap-1">
                    <Plus className="h-4 w-4" /> Add subtask
                  </Button>
                </div>
              </div> */}
              <DraggableSubtasks2
                member={teamMembers}
                taskId={taskValues?.id}
                subtasks={taskValues?.subtasks}
                setTaskValues={setTaskValues}
              />
            </Labeled>
          </div>

          {/* Comments & Activity with rounded segmented tabs */}
          <div className="mt-6">
            <Separator className="mb-3" />
            <Tabs defaultValue="comments" className="w-full">
              <div className="flex items-center justify-between">
                <TabsList className="bg-gray-200/60 rounded-full p-1 h-10">
                  <TabsTrigger
                    value="comments"
                    className="rounded-full h-8 px-4 text-sm font-medium text-gray-700 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                  >
                    Comments
                  </TabsTrigger>
                  <TabsTrigger
                    value="activity"
                    className="rounded-full h-8 px-4 text-sm font-medium text-gray-700 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm"
                  >
                    Activity
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="comments" className="mt-4">
                <div className="rounded-2xl border border-gray-200 bg-white">
                  <form className="border relative rounded-xl py-3 px-4">
                    <Textarea
                      name="value"
                      ref={textareaRef}
                      value={comment.value}
                      onChange={handleCommentChanges}
                      required
                      placeholder="Add Comment..."
                      className="border-none bg-white outline-none focus:ring-0 focus:shadow-none"
                    />

                    {showDropdown && (
                      <div
                        ref={mentionRef}
                        className="absolute w-[300px] max-h-[230px] overflow-auto bg-white z-[9999] top-[20%] left-[40%] border border-gray-200 shadow-lg rounded-lg mt-2"
                      >
                        <ul>
                          {filteredUsers.map(user => (
                            <li
                              key={user.id}
                              className="py-2 text-sm px-4 hover:bg-gray-100 cursor-pointer"
                              onClick={() => handleSelectUser(user)}
                            >
                              {user.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-2">
                      <button onClick={handleCommentSubmit} type="button" className="py-2 mt-3 px-4 bg-[#17181B] rounded-lg text-white">
                        Comment
                      </button>

                      <div className="flex items-center gap-1">{/* Your additional buttons/icons here */}</div>
                    </div>
                  </form>
                </div>

                {taskValues?.comments?.length > 0 && (
                  <ul className="mt-4 space-y-3">
                    {taskValues?.comments?.map(c => (
                      <li key={c.id} className="rounded-xl border border-gray-200 bg-white p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-[10px]">{initialsOf(c?.name)}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium text-gray-900">{c?.name}</span>
                              <span className="text-xs text-gray-500">{c?.time}</span>
                            </div>
                            <p className="mt-1 text-sm text-gray-800 whitespace-pre-wrap">{c?.value}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>

              <TabsContent value="activity" className="mt-4">
                <ul className="space-y-3">
                  {/* {activity.length === 0 ? (
                    <li className="text-sm text-gray-500">No activity yet.</li>
                  ) : (
                    activity.map(a => (
                      <li key={a.id} className="rounded-xl border border-gray-200 bg-white p-3 flex items-center gap-3 text-sm">
                        <Clock3 className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-800">{a.text}</span>
                        <span className="ml-auto text-xs text-gray-500">{format(a.createdAt, 'PP p')}</span>
                      </li>
                    ))
                  )} */}
                </ul>
              </TabsContent>
            </Tabs>
          </div>
        </form>

        {/* Sticky footer dock with aligned actions */}
        <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50">
          <div className="h-16 px-7 md:px-7 flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" className="h-10" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button
              type="button"
              className="h-10 bg-gray-900 text-white hover:bg-gray-800"
              onClick={() => formRef.current?.requestSubmit()}
            >
              Save <span className="ml-2 text-xs opacity-70">{'⌘⏎'}</span>
            </Button>
          </div>
        </div>

        {/* Scoped styles: neutral focus ring, rounded overlays, subtle scrollbar, close button inset */}
        <style jsx global>{`
          .v0-task-sheet > button[aria-label='Close'] {
            top: 22px !important;
            right: 18px !important;
          }
          .v0-task-sheet .thin-scrollbar::-webkit-scrollbar {
            width: 10px;
          }
          .v0-task-sheet .thin-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .v0-task-sheet .thin-scrollbar::-webkit-scrollbar-thumb {
            background-color: rgba(0, 0, 0, 0.12);
            border-radius: 8px;
            border: 2px solid transparent;
            background-clip: content-box;
          }
          .v0-task-sheet .thin-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(0, 0, 0, 0.12) transparent;
          }

          /* Neutral ring and no browser blue outlines within the sheet only */
          .v0-task-sheet {
            --ring: 0 0% 65%;
          }
          .v0-task-sheet :is(input, textarea, select, button, [role='combobox'], .cmdk-input):focus {
            outline: none !important;
          }
          .v0-task-sheet .cmdk-input:focus-visible {
            box-shadow: 0 0 0 2px hsl(0 0% 85%) !important;
            border-radius: 0.75rem;
          }

          /* Neutralize blue text selection inside the task sheet */
          .v0-task-sheet ::selection {
            background-color: hsl(0 0% 84%); /* light neutral gray */
            color: hsl(222 47% 11%); /* near-black text */
          }
          /* Ensure inputs and textareas follow the same selection color */
          .v0-task-sheet input::selection,
          .v0-task-sheet textarea::selection {
            background-color: hsl(0 0% 84%);
            color: hsl(222 47% 11%);
          }
        `}</style>
      </SheetContent>
    </Sheet>
  );
}

function toDateFromYMD(ymd: string) {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}
