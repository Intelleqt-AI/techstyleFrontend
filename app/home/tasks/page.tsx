"use client";

import React, { useEffect, useState } from "react";
import { HomeNav } from "@/components/home-nav";
import { DataCardsGrid, type DataCardItem } from "@/components/data-cards";
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
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TypeChip, StatusBadge } from "@/components/chip";
import useTask from "@/supabase/hook/useTask";
import { deleteTask, fetchProjects, modifyTask } from "@/supabase/API";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useUser from "@/supabase/hook/useUser";
import { toast } from "sonner";
import { TaskModal } from "@/components/tasks/task-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteDialog } from "@/components/DeleteDialog";
import { CircleFilled } from "@/components/Delete Animation/DeletionAnimations";
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
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type UITask = any; // keep your own type here if you have one

const updatetaskList = (data: any[]) => {
  return [
    {
      id: "todo",
      name: "To Do",
      items: data?.filter((item) => item.status == "todo") ?? [],
      icon: Circle,
      color: "text-gray-600",
    },
    {
      id: "in-progress",
      name: "In Progress",
      items: data?.filter((item) => item.status == "in-progress") ?? [],
      icon: CircleDot,
      color: "text-blue-600",
    },
    {
      id: "in-review",
      name: "In Review",
      items: data?.filter((item) => item.status == "in-review") ?? [],
      icon: Eye,
      color: "text-orange-600",
    },
    {
      id: "done",
      name: "Done",
      items: data?.filter((item) => item.status == "done") ?? [],
      icon: CheckCircle2,
      color: "text-green-600",
    },
  ];
};

const updatedColName = {
  done: "Done",
  "in-review": "In Review",
  todo: "To Do",
  "in-progress": "In Progress",
};

// Sortable Task Card Component
function SortableTaskCard({
  task,
  project,
  openEditTask,
  openDeleteModal,
}: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-3 h-[105px] cursor-pointer flex flex-col justify-between rounded-lg border bg-gray-50 hover:bg-gray-100 transition-all ${
        isDragging ? "shadow-xl bg-white opacity-50" : "border-gray-200"
      }`}
      onClick={() => openEditTask(task)}>
      <div>
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-sm truncate text-gray-900 leading-tight">
            {task.name}
          </h4>
          <Button
            variant="ghost"
            size="sm"
            className="w-5 h-5 p-0 text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2">
            <Clock className="w-3 h-3" />
          </Button>
        </div>

        <div className="text-xs truncate text-gray-600 mb-2">
          {(project &&
            project.find((p: any) => p.id === task?.projectID)?.name) ||
            ""}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">
          {
            task?.subtasks?.filter((subtask: any) => subtask.selected === true)
              .length
          }
          /{task?.subtasks?.length}
        </span>
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1">
            {task?.priority && (
              <StatusBadge status={task?.priority} label={task?.priority} />
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openDeleteModal(task);
              }}
              className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-red-100 text-gray-400 hover:text-red-600 transition">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Droppable Column Component
function DroppableColumn({
  column,
  project,
  openEditTask,
  openDeleteModal,
  openNewTask,
  isDraggingOver,
}: any) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-xl p-4 shadow-sm transition-all ${
        isDraggingOver
          ? "!border-gray-500 !border-1 border-dashed !bg-[#f9f8f6]"
          : ""
      }`}>
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <column.icon className={`w-4 h-4 ${column.color}`} />
          <span className="font-medium text-gray-900">{column.name}</span>
          <TypeChip label={String(column?.items?.length ?? 0)} />
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-6 h-6 p-0 text-gray-400 hover:text-gray-600">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Task Cards */}
      <div className="space-y-3 mb-4">
        <SortableContext
          items={column.items.map((item: any) => item.id)}
          strategy={verticalListSortingStrategy}>
          {column.items?.map((task: any) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              project={project}
              openEditTask={openEditTask}
              openDeleteModal={openDeleteModal}
            />
          ))}
        </SortableContext>
      </div>

      {/* Add Task Button */}
      <Button
        data-dndkit-disabled-drag-handle
        onClick={(e) => {
          e.stopPropagation();
          openNewTask();
        }}
        variant="ghost"
        className="w-full text-gray-500 hover:text-gray-700 hover:bg-gray-50 justify-center"
        size="sm">
        <Plus className="w-4 h-4 mr-2" />
        Add Task
      </Button>
    </div>
  );
}

export default function MyTasksPage() {
  const admins = [
    "david.zeeman@intelleqt.ai",
    "roxi.zeeman@souqdesign.co.uk",
    "risalat.shahriar@intelleqt.ai",
    "dev@intelleqt.ai",
    "saif@intelleqt.ai",
  ];

  const [myTask, setMyTask] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [editing, setEditing] = React.useState<UITask | null>(null);
  const { data: taskData, isLoading: taskLoading } = useTask();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [defaultListId, setDefaultListId] = React.useState<string | undefined>(
    undefined
  );
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const [activeID, setActiveId] = useState<string | null>(null);
  const [overID, setOverId] = useState<string | null>(null);
  const { user } = useUser();
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 130, // drag starts only after 150ms press
        tolerance: 5, // or minimum 5px pointer movement
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function openNewTask(listId?: string) {
    setEditing(null);
    setDefaultListId(listId);
    setModalOpen(true);
  }

  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState<null | "today" | "overdue">(null);

  function openEditTask(task: any) {
    setEditing(task);
    setDefaultListId(task.listId);
    setModalOpen(true);
  }

  const handleClose = (e: boolean) => {
    setModalOpen(e);
    setEditing(null);
  };

  function handleSave(_payload: Omit<any, "id"> & { id?: string }) {
    // handled elsewhere (DB-driven)
  }

  const { mutate, error: deleteError } = useMutation({
    mutationFn: modifyTask,
    onSuccess: () => queryClient.invalidateQueries(["tasks"]),
  });

  const { data: project } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  useEffect(() => {
    if (taskLoading) return;

    let list = myTaskList(taskData?.data);
    setMyTask(taskData?.data ?? []);

    if (searchText.trim()) {
      const s = searchText.toLowerCase();
      list = list.filter((t) => t.name?.toLowerCase().includes(s));
    }

    if (filter === "today") list = todayTasks(list);
    else if (filter === "overdue") list = myRecentTask(list);

    setTasks(taskData && taskData.data?.length > 0 ? updatetaskList(list) : []);
  }, [taskData, taskLoading, user?.email, searchText, filter]);

  const myRecentTask = (arr: any[]) => {
    const now = new Date();
    return (
      arr?.filter(
        (task) => task.status !== "done" && new Date(task.dueDate) < now
      ) ?? []
    );
  };

  const todayTasks = (arr: any[]) => {
    const now = new Date();
    return (
      arr?.filter((task) => {
        const createdAt = new Date(task.created_at);
        return (
          createdAt.getDate() === now.getDate() &&
          createdAt.getMonth() === now.getMonth() &&
          createdAt.getFullYear() === now.getFullYear()
        );
      }) ?? []
    );
  };

  const myTaskList = (arr: any[]) => {
    if (!arr) return [];
    if (!user) return [];

    let filtered = admins.includes(user?.email)
      ? arr
      : arr.filter((task) => {
          const isAssigned =
            task.assigned &&
            Array.isArray(task.assigned) &&
            task.assigned.some(
              (assignee: any) => assignee.email === user.email
            );
          const isCreator = task.creator === user.email;
          return isAssigned || isCreator;
        });

    // Sort by updated_at (newest first)
    return filtered.sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  };

  const assignedProjectCount = project?.filter((item: any) =>
    item.assigned?.some((person: any) => person.email == user?.email)
  ).length;

  const todayCreatedTask = todayTasks(myTask);
  const overDueTask = myRecentTask(myTask);

  const dataCards: DataCardItem[] = [
    {
      title: "Total Tasks",
      value: myTask?.length,
      subtitle: "Across all assigned projects",
      icon: Hash,
    },
    {
      title: "Overdue Tasks",
      value: overDueTask?.length,
      subtitle: "Past due dates",
      icon: AlertTriangle,
    },
    {
      title: "Task Added Today",
      value: todayCreatedTask?.length,
      subtitle: "Created today",
      icon: CalendarIcon,
    },
    {
      title: "Active Projects",
      value: admins.some((item) => item == user?.email)
        ? project?.length
        : assignedProjectCount,
      subtitle: "Assigned to you",
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

    setTasks((prev) => {
      const activeItems =
        prev.find((col) => col.id === activeContainer)?.items || [];
      const overItems =
        prev.find((col) => col.id === overContainer)?.items || [];

      const activeIndex = activeItems.findIndex((item) => item.id === activeId);
      const overIndex = overItems.findIndex((item) => item.id === overId);

      if (activeIndex === -1) return prev;

      const [activeItem] = activeItems.splice(activeIndex, 1);
      const updatedItem = { ...activeItem, status: overContainer };

      if (overIndex === -1) {
        overItems.push(updatedItem);
      } else {
        overItems.splice(overIndex, 0, updatedItem);
      }

      return prev.map((col) => {
        if (col.id === activeContainer) {
          return { ...col, items: activeItems };
        }
        if (col.id === overContainer) {
          return { ...col, items: overItems };
        }
        return col;
      });
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

    const nextStatus = overContainer as
      | "todo"
      | "in-progress"
      | "in-review"
      | "done";

    const payload =
      nextStatus === "done"
        ? { newTask: { status: nextStatus, id: activeId } }
        : { newTask: { status: nextStatus, id: activeId } };

    mutate(payload);
    toast.success(`Task moved to ${updatedColName[overContainer]}`);
  };

  const findContainer = (id: string) => {
    if (tasks.some((col) => col.id === id)) {
      return id;
    }

    const column = tasks.find((col) =>
      col.items.some((item) => item.id === id)
    );
    return column?.id;
  };

  const {
    mutate: removeTask,
    isLoading: isDeleting,
    error: deleteError2,
  } = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries(["tasks"]);
      toast.success("Task Deleted", {
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
              toast.success("Deletion cancelled");
            }}
            className="px-3 py-1 text-sm bg-black text-white rounded  transition-colors ml-4">
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
    ? tasks
        .find((col) => col.items.some((item) => item.id === activeID))
        ?.items.find((item) => item.id === activeID)
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
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 h-9 bg-transparent">
                  <Filter className="w-4 h-4" />
                  Filter
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="center" className="w-40">
                <DropdownMenuItem onClick={() => setFilter("overdue")}>
                  Overdue
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("today")}>
                  Added Today
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {filter && (
              <Button size={"sm"} variant={"secondary"} className=" capitalize">
                {filter}
                <span
                  onClick={() => setFilter(null)}
                  className="ml-2 inline-flex">
                  <CircleX className="h-4 w-4" />
                </span>
              </Button>
            )}

            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10 h-9"
                placeholder="Search tasks..."
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => openNewTask()}
              size="sm"
              className="gap-2 bg-gray-900 hover:bg-gray-800">
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
          onDragEnd={handleDragEnd}>
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
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="p-3 h-[105px] cursor-pointer flex flex-col justify-between rounded-lg border bg-white shadow-xl border-gray-200 rotate-3">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm truncate text-gray-900 leading-tight">
                      {activeTask.name}
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-5 h-5 p-0 text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2">
                      <Clock className="w-3 h-3" />
                    </Button>
                  </div>

                  <div className="text-xs truncate text-gray-600 mb-2">
                    {(project &&
                      project.find((p: any) => p.id === activeTask?.projectID)
                        ?.name) ||
                      ""}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    {
                      activeTask?.subtasks?.filter(
                        (subtask: any) => subtask.selected === true
                      ).length
                    }
                    /{activeTask?.subtasks?.length}
                  </span>
                  <div className="flex items-center gap-1">
                    <div className="flex items-center gap-1">
                      {activeTask?.priority && (
                        <StatusBadge
                          status={activeTask?.priority}
                          label={activeTask?.priority}
                        />
                      )}
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
        defaultListId={defaultListId}
        taskToEdit={editing}
        onSave={handleSave}
        setEditing={setEditing}
        openDeleteModal={openDeleteModal}
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
