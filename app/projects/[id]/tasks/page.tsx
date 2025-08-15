"use client"

import * as React from "react"
import { ProjectNav } from "@/components/project-nav"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { StatusBadge, TypeChip } from "@/components/chip"
import {
  Plus,
  Filter,
  User,
  Clock,
  MoreHorizontal,
  Circle,
  CircleDot,
  Eye,
  CheckCircle2,
  FileText,
  Hammer,
  Palette,
} from "lucide-react"
import { TaskModal } from "@/components/tasks/task-modal"
import type { Task, ListColumn, TeamMember, Phase } from "@/components/tasks/types"
import TimelineView from "@/components/tasks/timeline-view"
import ListView from "@/components/tasks/list-view"

type UITask = Task & {
  startDate?: string
  endDate?: string
  assignees?: string[]
}

const TEAM: TeamMember[] = [
  { id: "jd", name: "Jane Designer" },
  { id: "mj", name: "Mike Johnson" },
  { id: "sw", name: "Sarah Wilson" },
  { id: "tb", name: "Tom Builder" },
]

const PHASES: Phase[] = [
  { id: "phase-concept", name: "Concept" },
  { id: "phase-design-dev", name: "Design Development" },
  { id: "phase-technical", name: "Technical Drawings" },
  { id: "phase-review", name: "Client Review" },
  { id: "phase-procurement", name: "Procurement" },
  { id: "phase-site", name: "Site / Implementation" },
]

const LISTS: (ListColumn & { icon: any; colorClass: string; id: string })[] = [
  { id: "concept", title: "Design Concepts", icon: Palette, colorClass: "text-purple-600" },
  { id: "design-dev", title: "Design Development", icon: CircleDot, colorClass: "text-amber-600" },
  { id: "technical", title: "Technical Drawings", icon: FileText, colorClass: "text-orange-600" },
  { id: "review", title: "Client Review", icon: Eye, colorClass: "text-rose-600" },
  { id: "procurement", title: "Procurement", icon: Circle, colorClass: "text-emerald-600" },
  { id: "site", title: "Site / Implementation", icon: Hammer, colorClass: "text-slate-600" },
  { id: "complete", title: "Complete", icon: CheckCircle2, colorClass: "text-gray-600" },
]

function seedTasks(projectId: string): UITask[] {
  return [
    // Concept — Jan → Feb 2025
    {
      id: "t1",
      projectId,
      title: "Initial mood board creation",
      listId: "concept",
      phaseId: "phase-concept",
      priority: "high",
      status: "in_progress",
      assigneeIds: ["jd"],
      startDate: "2025-01-08",
      endDate: "2025-01-28",
      tags: ["Moodboard"],
      description: "",
      attachments: [],
      subtasks: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: "t2",
      projectId,
      title: "Color palette selection",
      listId: "concept",
      phaseId: "phase-concept",
      priority: "medium",
      status: "done",
      assigneeIds: ["mj"],
      startDate: "2025-02-01",
      endDate: "2025-02-15",
      tags: ["Colors"],
      description: "",
      attachments: [],
      subtasks: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },

    // Design Development — Feb → Apr 2025
    {
      id: "t3",
      projectId,
      title: "3D rendering of living space",
      listId: "design-dev",
      phaseId: "phase-design-dev",
      priority: "high",
      status: "in_progress",
      assigneeIds: ["sw"],
      startDate: "2025-02-18",
      endDate: "2025-03-25",
      tags: ["3D"],
      description: "",
      attachments: [],
      subtasks: [{ id: "s1", title: "Lighting pass", done: false }],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: "t9",
      projectId,
      title: "Materials study",
      listId: "design-dev",
      phaseId: "phase-design-dev",
      priority: "medium",
      status: "todo",
      assigneeIds: ["jd"],
      startDate: "2025-03-28",
      endDate: "2025-04-18",
      tags: ["Materials"],
      description: "",
      attachments: [],
      subtasks: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },

    // Technical Drawings — Apr → May 2025
    {
      id: "t4",
      projectId,
      title: "Floor plan revisions",
      listId: "technical",
      phaseId: "phase-technical",
      priority: "medium",
      status: "in_review",
      assigneeIds: ["tb"],
      startDate: "2025-04-20",
      endDate: "2025-05-08",
      tags: ["Plans"],
      description: "",
      attachments: [],
      subtasks: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: "t10",
      projectId,
      title: "Elevations and sections",
      listId: "technical",
      phaseId: "phase-technical",
      priority: "medium",
      status: "todo",
      assigneeIds: ["mj"],
      startDate: "2025-05-10",
      endDate: "2025-05-28",
      tags: ["Drawings"],
      description: "",
      attachments: [],
      subtasks: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },

    // Client Review — May → Jun 2025
    {
      id: "t5",
      projectId,
      title: "Client review session",
      listId: "review",
      phaseId: "phase-review",
      priority: "low",
      status: "todo",
      assigneeIds: ["jd", "mj"],
      startDate: "2025-05-30",
      endDate: "2025-05-30", // single-day
      tags: [],
      description: "",
      attachments: [],
      subtasks: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: "t5b",
      projectId,
      title: "Feedback incorporation",
      listId: "review",
      phaseId: "phase-review",
      priority: "medium",
      status: "todo",
      assigneeIds: ["jd"],
      startDate: "2025-06-02",
      endDate: "2025-06-18",
      tags: [],
      description: "",
      attachments: [],
      subtasks: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },

    // Procurement — Jun → Jul 2025
    {
      id: "t6",
      projectId,
      title: "Procurement shortlist",
      listId: "procurement",
      phaseId: "phase-procurement",
      priority: "medium",
      status: "todo",
      assigneeIds: ["sw"],
      startDate: "2025-06-20",
      endDate: "2025-07-05",
      tags: [],
      description: "",
      attachments: [],
      subtasks: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: "t11",
      projectId,
      title: "Supplier quotes",
      listId: "procurement",
      phaseId: "phase-procurement",
      priority: "high",
      status: "todo",
      assigneeIds: ["sw"],
      startDate: "2025-07-08",
      endDate: "2025-07-22",
      tags: [],
      description: "",
      attachments: [],
      subtasks: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },

    // Site / Implementation — Jul → Aug 2025
    {
      id: "t7",
      projectId,
      title: "Site prep",
      listId: "site",
      phaseId: "phase-site",
      priority: "high",
      status: "todo",
      assigneeIds: ["tb"],
      startDate: "2025-07-25",
      endDate: "2025-08-08",
      tags: [],
      description: "",
      attachments: [],
      subtasks: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: "t7b",
      projectId,
      title: "Site walkthrough",
      listId: "site",
      phaseId: "phase-site",
      priority: "high",
      status: "todo",
      assigneeIds: ["tb"],
      startDate: "2025-08-10",
      endDate: "2025-08-10", // single-day
      tags: [],
      description: "",
      attachments: [],
      subtasks: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: "t12",
      projectId,
      title: "Final install",
      listId: "site",
      phaseId: "phase-site",
      priority: "high",
      status: "todo",
      assigneeIds: ["sw"],
      startDate: "2025-08-12",
      endDate: "2025-08-25",
      tags: [],
      description: "",
      attachments: [],
      subtasks: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },

    // Due-date only example (shows as diamond)
    {
      id: "t-due-photos",
      projectId,
      title: "Photoshoot",
      listId: "site",
      phaseId: "phase-site",
      priority: "low",
      status: "todo",
      assigneeIds: ["jd"],
      dueDate: "2025-08-28",
      tags: [],
      description: "",
      attachments: [],
      subtasks: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ]
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

function displayDue(iso?: string) {
  if (!iso) return ""
  try {
    const d = new Date(iso + "T00:00:00")
    return d.toLocaleDateString(undefined, { weekday: "short" })
  } catch {
    return ""
  }
}

export default function ProjectTasksPage({ params }: { params: { id: string } }) {
  const projectId = params.id
  const [tasks, setTasks] = React.useState<UITask[]>(seedTasks(projectId))
  const [modalOpen, setModalOpen] = React.useState(false)
  const [defaultListId, setDefaultListId] = React.useState<string | undefined>(undefined)
  const [editing, setEditing] = React.useState<UITask | null>(null)
  const [activeTab, setActiveTab] = React.useState<"board" | "list" | "timeline">("board")

  function openNewTask(listId?: string) {
    setEditing(null)
    setDefaultListId(listId)
    setModalOpen(true)
  }

  function openEditTask(task: UITask) {
    setEditing(task)
    setDefaultListId(task.listId)
    setModalOpen(true)
  }

  function handleSave(payload: Omit<Task, "id"> & { id?: string }) {
    if (payload.id) {
      setTasks((prev) => prev.map((t) => (t.id === payload.id ? { ...t, ...payload } : t)))
    } else {
      const newTask: UITask = { ...payload, id: crypto.randomUUID() } as UITask
      setTasks((prev) => [newTask, ...prev])
    }
  }

  const boardLists = LISTS
  function subtaskProgress(t: UITask) {
    const total = t.subtasks.length
    const done = t.subtasks.filter((s) => s.done).length
    return { done, total }
  }

  return (
    <div className="flex-1 bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <ProjectNav projectId={projectId} />

        {/* View Toggle */}
        <div className="flex items-center justify-between">
          <div className="bg-white rounded-lg border border-gray-200 p-1 inline-flex gap-1">
            <button
              onClick={() => setActiveTab("board")}
              className={`h-9 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "board" ? "text-white bg-gray-900" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              Board
            </button>
            <button
              onClick={() => setActiveTab("list")}
              className={`h-9 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "list" ? "text-white bg-gray-900" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              List
            </button>
            <button
              onClick={() => setActiveTab("timeline")}
              className={`h-9 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === "timeline"
                  ? "text-white bg-gray-900"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              Timeline
            </button>
          </div>

          <div className="flex items-center gap-3">
            {activeTab !== "timeline" && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-md border-[var(--clay-border)] text-[var(--clay-foreground)] bg-white"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            )}
            <Button className="bg-gray-900 text-white hover:bg-gray-800 rounded-md" onClick={() => openNewTask()}>
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </div>
        </div>

        {/* Board View */}
        {activeTab === "board" && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="overflow-x-auto">
              <div className="flex gap-6 min-w-max pb-2">
                {boardLists.map((col) => {
                  const colTasks = tasks.filter((t) => t.listId === col.id)
                  return (
                    <div key={col.id} className="w-80 flex-shrink-0">
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            {React.createElement(col.icon, { className: `w-4 h-4 ${col.colorClass}` })}
                            <span className="font-medium text-gray-900">{col.title}</span>
                            <TypeChip label={String(colTasks.length)} />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-6 h-6 p-0 text-gray-400 hover:text-gray-600"
                            title="Add task"
                            aria-label="Add task"
                            onClick={() => openNewTask(col.id)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="space-y-3 mb-4 min-h-[200px]">
                          {colTasks.map((task) => {
                            const memberInitials =
                              (task.assigneeIds && task.assigneeIds.length > 0) || (task.assignees?.length ?? 0) > 0
                                ? getInitials(
                                    TEAM.find(
                                      (m) => m.id === (task.assigneeIds?.[0] ?? task.assignees?.[0] ?? "__none__"),
                                    )?.name ?? "",
                                  )
                                : ""
                            const { done, total } = subtaskProgress(task)
                            return (
                              <div
                                key={task.id}
                                className={`p-3 rounded-lg border bg-white hover:shadow-sm transition-all cursor-pointer ${
                                  task.status === "done"
                                    ? "border-gray-200 opacity-60"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                                onClick={() => openEditTask(task)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => e.key === "Enter" && openEditTask(task)}
                              >
                                <div className="flex items-start gap-3 mb-2">
                                  <Checkbox checked={task.status === "done"} disabled className="mt-0.5" />
                                  <div className="flex-1 min-w-0">
                                    <h4
                                      className={`font-medium text-sm text-gray-900 leading-tight ${
                                        task.status === "done" ? "line-through text-gray-400" : ""
                                      }`}
                                    >
                                      {task.title}
                                    </h4>
                                    <div className="mt-2 flex items-center gap-2">
                                      <StatusBadge status={task.priority} label={task.priority} />
                                      {total > 0 && (
                                        <span className="text-[11px] text-gray-500">
                                          {done}/{total}
                                        </span>
                                      )}
                                    </div>
                                    <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                                      <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {displayDue(task.endDate ?? task.startDate)}
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        {memberInitials}
                                      </div>
                                    </div>
                                  </div>

                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-6 h-6 p-0 text-gray-400 hover:text-gray-600 flex-shrink-0"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      openEditTask(task)
                                    }}
                                    title="More"
                                    aria-label="More"
                                  >
                                    <MoreHorizontal className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            )
                          })}

                          {colTasks.length === 0 && (
                            <div className="text-sm text-gray-500 px-2 py-6 text-center">
                              {"No tasks yet. Add the first task."}
                            </div>
                          )}

                          <Button
                            variant="ghost"
                            className="w-full text-gray-600 hover:text-gray-800 hover:bg-gray-100 justify-center border-2 border-dashed border-gray-200 hover:border-gray-300 py-8"
                            size="sm"
                            onClick={() => openNewTask(col.id)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Task
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* List View */}
        {activeTab === "list" && (
          <ListView
            tasks={tasks}
            team={TEAM}
            phases={PHASES}
            lists={LISTS}
            onEditTask={openEditTask}
            onCreateTask={() => openNewTask(undefined)}
          />
        )}

        {/* Timeline View */}
        {activeTab === "timeline" && (
          <TimelineView
            tasks={tasks}
            setTasks={setTasks}
            phases={PHASES}
            lists={LISTS}
            team={TEAM}
            onEditTask={openEditTask}
            onCreateTask={() => openNewTask(undefined)}
          />
        )}
      </div>

      <TaskModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        projectId={projectId}
        lists={LISTS}
        phases={PHASES}
        team={TEAM}
        defaultListId={defaultListId}
        taskToEdit={
          editing
            ? {
                ...editing,
                assignees: editing.assignees ?? editing.assigneeIds,
              }
            : undefined
        }
        onSave={handleSave}
      />
    </div>
  )
}
