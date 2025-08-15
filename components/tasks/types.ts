export type TaskStatus = "todo" | "in-progress" | "review" | "done"
export type TaskPriority = "low" | "medium" | "high" | "urgent"

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  assignee?: string
  startDate?: string
  dueDate?: string
  phase?: string
  createdAt: string
  updatedAt: string
}

export interface TaskColumn {
  id: TaskStatus
  title: string
  tasks: Task[]
}
