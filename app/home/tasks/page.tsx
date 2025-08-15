"use client"

import { useMemo, useState } from "react"
import { HomeNav } from "@/components/home-nav"
import { DataCardsGrid, type DataCardItem } from "@/components/data-cards"
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
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { TypeChip, StatusBadge } from "@/components/chip"

type TaskStatus = "open" | "in_progress" | "blocked" | "done"
type Task = {
  id: number
  title: string
  project: string
  dueDate: string // ISO
  assignee: string
  status: TaskStatus
  completedAt?: string
}

const tasksSeed: Task[] = [
  {
    id: 1,
    title: "Review material samples",
    project: "Luxury Penthouse",
    dueDate: new Date().toISOString(),
    assignee: "You",
    status: "open",
  },
  {
    id: 2,
    title: "Finalize kitchen layout",
    project: "Modern Office",
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    assignee: "You",
    status: "in_progress",
  },
  {
    id: 3,
    title: "Send moodboard v2",
    project: "Boutique Hotel",
    dueDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    assignee: "You",
    status: "open",
  },
  {
    id: 4,
    title: "Vendor call - lighting",
    project: "Retail Space",
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    assignee: "You",
    status: "blocked",
  },
  {
    id: 5,
    title: "Draft client presentation",
    project: "Luxury Penthouse",
    dueDate: new Date().toISOString(),
    assignee: "You",
    status: "open",
  },
  {
    id: 6,
    title: "Confirm fabric order",
    project: "Boutique Hotel",
    dueDate: new Date(Date.now() - 86400000).toISOString(),
    assignee: "You",
    status: "done",
    completedAt: new Date().toISOString(),
  },
  {
    id: 7,
    title: "Upload CAD updates",
    project: "Modern Office",
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    assignee: "You",
    status: "in_progress",
  },
  {
    id: 8,
    title: "QA site photos",
    project: "Retail Space",
    dueDate: new Date(Date.now() - 86400000 * 4).toISOString(),
    assignee: "You",
    status: "open",
  },
]

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

// CRM-style stat cards
const dataCards: DataCardItem[] = [
  { title: "Total Tasks", value: "12", subtitle: "Across all assigned projects", icon: Hash },
  { title: "Overdue Tasks", value: "3", subtitle: "Past due dates", icon: AlertTriangle },
  { title: "Task Added Today", value: "0", subtitle: "Created today", icon: CalendarIcon },
  { title: "Active Projects", value: "3", subtitle: "Assigned to you", icon: Hash },
]

// Original Kanban data (unchanged except chip)
const taskColumns = [
  {
    title: "To Do",
    count: 1,
    icon: Circle,
    color: "text-gray-600",
    tasks: [
      {
        id: 1,
        title: "Review fabric samples for living room",
        assignee: "Jane Designer",
        project: "Luxury Penthouse",
        priority: "high",
        dueDate: "Today",
      },
    ],
  },
  {
    title: "In Progress",
    count: 1,
    icon: CircleDot,
    color: "text-blue-600",
    tasks: [
      {
        id: 2,
        title: "Client presentation - Kitchen concepts",
        assignee: "Mike Johnson",
        project: "Modern Office Space",
        priority: "medium",
        dueDate: "Tomorrow",
      },
    ],
  },
  {
    title: "In Review",
    count: 1,
    icon: Eye,
    color: "text-orange-600",
    tasks: [
      {
        id: 3,
        title: "Source lighting fixtures",
        assignee: "Sarah Wilson",
        project: "Boutique Hotel",
        priority: "low",
        dueDate: "Friday",
      },
    ],
  },
  { title: "Done", count: 0, icon: CheckCircle2, color: "text-green-600", tasks: [] },
]

export default function MyTasksPage() {
  const [search, setSearch] = useState("")
  const tasks = tasksSeed

  const { openCount, dueToday, overdue, completedThisWeek, filtered } = useMemo(() => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())

    const open = tasks.filter((t) => t.status !== "done").length
    const dueT = tasks.filter((t) => t.status !== "done" && isSameDay(new Date(t.dueDate), today)).length
    const over = tasks.filter(
      (t) => t.status !== "done" && new Date(t.dueDate) < new Date(today.setHours(0, 0, 0, 0)),
    ).length
    const completedWk = tasks.filter(
      (t) => t.status === "done" && t.completedAt && new Date(t.completedAt) >= startOfWeek,
    ).length

    const f = tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(search.toLowerCase()) || t.project.toLowerCase().includes(search.toLowerCase()),
    )

    return { openCount: open, dueToday: dueT, overdue: over, completedThisWeek: completedWk, filtered: f }
  }, [tasks, search])

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
              <Input
                className="pl-10 h-9"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" className="gap-2 bg-gray-900 hover:bg-gray-800">
              <Plus className="w-4 h-4" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {taskColumns.map((column) => (
            <div key={column.title} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <column.icon className={`w-4 h-4 ${column.color}`} />
                  <span className="font-medium text-gray-900">{column.title}</span>
                  <TypeChip label={String(column.count)} />
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="w-6 h-6 p-0 text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="w-6 h-6 p-0 text-gray-400 hover:text-gray-600">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Task Cards */}
              <div className="space-y-3 mb-4">
                {column.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm text-gray-900 leading-tight">{task.title}</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-5 h-5 p-0 text-gray-400 hover:text-gray-600 flex-shrink-0 ml-2"
                      >
                        <Clock className="w-3 h-3" />
                      </Button>
                    </div>

                    <div className="text-xs text-gray-600 mb-2">{task.assignee}</div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">0/0</span>
                      <div className="flex items-center gap-1">
                        <StatusBadge status="high" label="high" />
                      </div>
                    </div>
                  </div>
                ))}

                {column.tasks.length === 0 && column.title === "Done" && (
                  <div className="p-8 text-center">
                    <div className="text-gray-400 mb-2">+ Add Task</div>
                  </div>
                )}
              </div>

              {/* Add Task Button */}
              <Button
                variant="ghost"
                className="w-full text-gray-500 hover:text-gray-700 hover:bg-gray-50 justify-center"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Task
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
