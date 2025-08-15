"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { MoreHorizontal, Clock, User } from "lucide-react"

const tasks = [
  {
    id: 1,
    title: "Review fabric samples for living room",
    project: "Luxury Penthouse",
    priority: "high",
    dueDate: "Today",
    assignee: "Jane Designer",
    completed: false,
  },
  {
    id: 2,
    title: "Client presentation - Kitchen concepts",
    project: "Modern Office Space",
    priority: "medium",
    dueDate: "Tomorrow",
    assignee: "Mike Johnson",
    completed: false,
  },
  {
    id: 3,
    title: "Source lighting fixtures",
    project: "Boutique Hotel",
    priority: "low",
    dueDate: "Friday",
    assignee: "Sarah Wilson",
    completed: true,
  },
]

export function TasksWidget() {
  const priorityClass = (p: string) =>
    p === "high"
      ? "bg-terracotta-600/10 text-terracotta-600 border border-terracotta-600/30"
      : p === "medium"
        ? "bg-clay-500/10 text-clay-600 border border-clay-500/30"
        : "bg-sage-300/30 text-olive-700 border border-olive-700/20"

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">My Tasks</CardTitle>
        <Button variant="ghost" size="sm">
          View all
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center gap-3 p-3 rounded-lg border ${
              task.completed ? "bg-neutral-50 opacity-60" : "bg-white"
            } hover:bg-neutral-50 transition-colors`}
          >
            <Checkbox checked={task.completed} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4
                  className={`font-medium text-sm ${
                    task.completed ? "line-through text-neutral-400" : "text-neutral-900"
                  }`}
                >
                  {task.title}
                </h4>
                <span
                  className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${priorityClass(task.priority)}`}
                >
                  {task.priority}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-neutral-500">
                <span>{task.project}</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slatex-500" />
                  {task.dueDate}
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3 text-slatex-500" />
                  {task.assignee}
                </div>
              </div>
            </div>

            <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
              <MoreHorizontal className="w-4 h-4 text-slatex-500" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
