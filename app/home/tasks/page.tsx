'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
  MoreHorizontal,
  Clock,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TypeChip, StatusBadge } from '@/components/chip';
import useTask from '@/supabase/hook/useTask';
import { fetchOnlyProject, fetchProjects, modifyTask } from '@/supabase/API';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useUser from '@/supabase/hook/useUser';
import { toast } from 'sonner';
import { TaskModal } from '@/components/tasks/task-modal';

const updatetaskList = data => {
  return [
    {
      name: 'To Do',
      items: data?.filter(item => item.status == 'todo'),
      status: 'To Do',
      icon: Circle,
      color: 'text-gray-600',
    },
    {
      name: 'In Progress',
      items: data?.filter(item => item.status == 'in-progress'),
      status: 'In Progress',
      icon: CircleDot,
      color: 'text-blue-600',
    },
    {
      name: 'In Review',
      items: data?.filter(item => item.status == 'in-review'),
      status: 'In Review',
      color: 'text-orange-600',
      icon: Eye,
    },
    {
      name: 'Done',
      items: data?.filter(item => item.status == 'done'),
      status: 'Done',
      icon: CheckCircle2,
      color: 'text-green-600',
    },
  ];
};

export default function MyTasksPage() {
  const admins = [
    'david.zeeman@intelleqt.ai',
    'roxi.zeeman@souqdesign.co.uk',
    'risalat.shahriar@intelleqt.ai',
    'dev@intelleqt.ai',
    'saif@intelleqt.ai',
  ];

  const [myTask, setMyTask] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [editing, setEditing] = React.useState<UITask | null>(null);
  const { data: taskData, isLoading: taskLoading } = useTask();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [defaultListId, setDefaultListId] = React.useState<string | undefined>(undefined);
  const { user } = useUser();
  function openNewTask(listId?: string) {
    setEditing(null);
    setDefaultListId(listId);
    setModalOpen(true);
  }
  const [searchText, setSearchText] = useState('');

  function openEditTask(task) {
    setEditing(task);
    setDefaultListId(task.listId);
    setModalOpen(true);
  }

  const handleClose = e => {
    setModalOpen(e);
  };

  function handleSave(payload: Omit<Task, 'id'> & { id?: string }) {
    // if (payload.id) {
    //   setTasks(prev => prev.map(t => (t.id === payload.id ? { ...t, ...payload } : t)));
    // } else {
    //   const newTask: UITask = { ...payload, id: crypto.randomUUID() } as UITask;
    //   setTasks(prev => [newTask, ...prev]);
    // }
  }

  const queryClient = useQueryClient();

  const { mutate, error: deleteError } = useMutation({
    mutationFn: modifyTask,
    onSuccess: () => {
      queryClient.invalidateQueries(['tasks']);
    },
  });

  // Projects
  const {
    data: project,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });

  useEffect(() => {
    if (taskLoading) return;
    setMyTask(taskData?.data);
    let myTask = myTaskList(taskData?.data);

    if (searchText.trim()) {
      myTask = myTask.filter(task => task.name?.toLowerCase().includes(searchText.toLowerCase()));
    }

    setTasks(taskData && taskData.data.length > 0 ? updatetaskList(myTask) : []);
  }, [taskData, taskLoading, user?.email, searchText]);

  const myRecentTask = tasks => {
    const now = new Date();
    return tasks?.filter(task => task.status !== 'done' && new Date(task.dueDate) < now);
  };

  const todayTasks = tasks => {
    const now = new Date();
    return tasks?.filter(task => {
      const createdAt = new Date(task.created_at);
      return (
        createdAt.getDate() === now.getDate() && createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear()
      );
    });
  };

  const myTaskList = tasks => {
    if (!tasks) return;
    if (!user) return [];
    if (admins.includes(user?.email)) {
      return tasks;
    }
    return tasks?.filter(task => {
      if (task.assigned && Array.isArray(task.assigned) && task.assigned.length > 0) {
        return task.assigned.some(assignee => assignee.email === user.email);
      }
      return false;
    });
  };

  const assignedProjectCount = project?.filter(item => item.assigned?.some(person => person.email == user?.email)).length;

  const todayCreatedTask = todayTasks(myTask);
  const overDueTask = myRecentTask(myTask);

  // CRM-style stat cards
  const dataCards: DataCardItem[] = [
    { title: 'Total Tasks', value: myTask?.length, subtitle: 'Across all assigned projects', icon: Hash },
    { title: 'Overdue Tasks', value: overDueTask?.length, subtitle: 'Past due dates', icon: AlertTriangle },
    { title: 'Task Added Today', value: todayCreatedTask?.length, subtitle: 'Created today', icon: CalendarIcon },
    {
      title: 'Active Projects',
      value: admins.some(item => item == user?.email) ? project?.length : assignedProjectCount,
      subtitle: 'Assigned to you',
      icon: Hash,
    },
  ];

  // Task Drag and drop section
  const handleDragStart = (e: React.DragEvent, taskId: string, sourceColumn: string) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.setData('sourceColumn', sourceColumn);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetColumn: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    const sourceColumn = e.dataTransfer.getData('sourceColumn');
    if (!taskId || !sourceColumn || sourceColumn === targetColumn) return;

    // Determine the new status
    let status;
    if (targetColumn === 'To Do') {
      status = 'todo';
    } else if (targetColumn === 'In Progress') {
      status = 'in-progress';
    } else if (targetColumn === 'In Review') {
      status = 'in-review';
    } else if (targetColumn === 'Done') {
      status = 'done';
    }

    setTasks(prevColumns => {
      // Find the source and target column indices
      const sourceColumnIndex = prevColumns.findIndex(col => col.name === sourceColumn);
      const targetColumnIndex = prevColumns.findIndex(col => col.name === targetColumn);

      // Ensure columns exist
      if (sourceColumnIndex === -1 || targetColumnIndex === -1) return prevColumns;

      // Find the task within the source column
      const taskIndex = prevColumns[sourceColumnIndex].items.findIndex(task => task.id === taskId);

      // Ensure task exists
      if (taskIndex === -1) return prevColumns;

      // Get the task and remove it from the source column
      const task = prevColumns[sourceColumnIndex].items[taskIndex];

      // Create a new task object with the updated status
      const updatedTask = {
        ...task,
        status: status, // Update the status property here
      };

      const newColumns = [...prevColumns];
      newColumns[sourceColumnIndex] = {
        ...newColumns[sourceColumnIndex],
        items: newColumns[sourceColumnIndex].items.filter((_, idx) => idx !== taskIndex),
      };

      // Add the updated task to the target column
      newColumns[targetColumnIndex] = {
        ...newColumns[targetColumnIndex],
        items: [...newColumns[targetColumnIndex].items, updatedTask],
      };
      toast.success(`Task moved to ${targetColumn}`);

      return newColumns;
    });

    // Send update to server
    let modifyInfo;
    if (status === 'done') {
      modifyInfo = {
        status,
        phase: 'complete-project',
        id: taskId,
      };
    } else {
      modifyInfo = {
        status,
        id: taskId,
      };
    }
    // Update to DB
    mutate({ newTask: modifyInfo });
  };

  return (
    <div className="flex-1 bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <HomeNav />

        {/* CRM-style Data Cards */}
        <DataCardsGrid items={dataCards} />

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Button variant="outline" size="sm" className="gap-2 h-9 bg-transparent">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {tasks?.map(column => (
            <div
              onDragOver={e => handleDragOver(e)}
              onDrop={e => handleDrop(e, column.name)}
              key={column.name}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <column.icon className={`w-4 h-4 ${column.color}`} />

                  <span className="font-medium text-gray-900">{column.name}</span>
                  <TypeChip label={String(column?.items?.length)} />
                </div>
                <div className="flex items-center gap-1">
                  {/* <Button variant="ghost" size="sm" className="w-6 h-6 p-0 text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button> */}
                  <Button variant="ghost" size="sm" className="w-6 h-6 p-0 text-gray-400 hover:text-gray-600">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Task Cards */}
              <div className="space-y-3 mb-4">
                {column.items.map(task => (
                  <div
                    key={task.id}
                    className="p-3 h-[105px] active:cursor-grabbing cursor-pointer flex flex-col justify-between rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
                    draggable
                    onDragStart={e => handleDragStart(e, task.id, column.name)}
                    onClick={() => openEditTask(task)}
                  >
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm truncate text-gray-900 leading-tight">{task.name}</h4>
                        <Button variant="ghost" size="sm" className="w-5 h-5 p-0 text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2">
                          <Clock className="w-3 h-3" />
                        </Button>
                      </div>

                      <div className="text-xs truncate text-gray-600 mb-2">
                        {(project && project.find(p => p.id === task?.projectID)?.name) || ''}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">
                        {task?.subtasks?.filter(subtask => subtask.selected === true).length}/{task?.subtasks?.length}
                      </span>
                      <div className="flex items-center gap-1">
                        {task?.priority && <StatusBadge status={task?.priority} label={task?.priority} />}
                      </div>
                    </div>
                  </div>
                ))}

                {/* {column.items.length === 0 && column.name === 'Done' && (
                  <div className="p-8 text-center">
                    <div className="text-gray-400 mb-2">+ Add Task</div>
                  </div>
                )} */}
              </div>

              {/* Add Task Button */}
              <Button variant="ghost" className="w-full text-gray-500 hover:text-gray-700 hover:bg-gray-50 justify-center" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </div>
          ))}
        </div>
      </div>

      <TaskModal
        open={modalOpen}
        onOpenChange={handleClose}
        projectId={null}
        team={null}
        defaultListId={defaultListId}
        taskToEdit={editing}
        onSave={handleSave}
        setEditing={setEditing}
      />
    </div>
  );
}
