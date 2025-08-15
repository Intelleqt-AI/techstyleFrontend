"use client"

import { create } from "zustand"
import type { Task, ListColumn, TeamMember } from "@/components/tasks/types"

type State = {
  members: TeamMember[]
  listsByProject: Record<string, ListColumn[]>
  tasksByProject: Record<string, Task[]>
  // init/seed
  seedProject: (projectId: string) => void
  // CRUD
  createTask: (t: Omit<Task, "id" | "createdAt" | "updatedAt">) => Task
  updateTask: (id: string, patch: Partial<Task>) => void
  deleteTask: (id: string) => void
  moveTask: (id: string, listId: string) => void
  // Queries
  getTasksByPhase: (projectId: string, phaseId: string) => Task[]
}

const DEFAULT_MEMBERS: TeamMember[] = [
  { id: "u1", name: "Alex Morgan" },
  { id: "u2", name: "Jane Lee" },
  { id: "u3", name: "Mike Chen" },
  { id: "u4", name: "Sara Patel" },
  { id: "u5", name: "Chris Wood" },
  { id: "u6", name: "Dana Park" },
]

const DEFAULT_COLUMNS = [
  "Discovery",
  "Concept Design",
  "Design Development",
  "Technical Drawings",
  "Client Review",
  "Procurement",
  "Site / Implementation",
]

export const useTasksStore = create<State>((set, get) => ({
  members: DEFAULT_MEMBERS,
  listsByProject: {},
  tasksByProject: {},

  seedProject: (projectId) => {
    const current = get().listsByProject
    if (current[projectId]) return // nothing to do; avoid unnecessary set() loops
    const nextCols: ListColumn[] = DEFAULT_COLUMNS.map((t, i) => ({
      id: `l-${i + 1}`,
      title: t,
      order: i,
    }))
    set({ listsByProject: { ...current, [projectId]: nextCols } })
  },

  createTask: (t) => {
    const id = `task_${Math.random().toString(36).slice(2)}`
    const now = Date.now()
    const tasksByProject = { ...get().tasksByProject }
    const projectId = t.projectId
    const entry: Task = {
      ...t,
      id,
      createdAt: now,
      updatedAt: now,
      assigneeIds: t.assigneeIds ?? [],
      tags: t.tags ?? [],
      subtasks: t.subtasks ?? [],
      attachments: t.attachments ?? [],
    }
    tasksByProject[projectId] = [entry, ...(tasksByProject[projectId] || [])]
    set({ tasksByProject })
    return entry
  },

  updateTask: (id, patch) => {
    const tasksByProject = { ...get().tasksByProject }
    for (const pid of Object.keys(tasksByProject)) {
      const exists = tasksByProject[pid].some((t) => t.id === id)
      if (exists) {
        tasksByProject[pid] = tasksByProject[pid].map((t) =>
          t.id === id ? { ...t, ...patch, updatedAt: Date.now() } : t,
        )
        set({ tasksByProject })
        return
      }
    }
  },

  deleteTask: (id) => {
    const tasksByProject = { ...get().tasksByProject }
    for (const pid of Object.keys(tasksByProject)) {
      tasksByProject[pid] = tasksByProject[pid].filter((t) => t.id !== id)
    }
    set({ tasksByProject })
  },

  moveTask: (id, listId) => {
    const tasksByProject = { ...get().tasksByProject }
    for (const pid of Object.keys(tasksByProject)) {
      tasksByProject[pid] = tasksByProject[pid].map((t) => (t.id === id ? { ...t, listId } : t))
    }
    set({ tasksByProject })
  },

  getTasksByPhase: (projectId, phaseId) => {
    return (get().tasksByProject[projectId] || []).filter((t) => t.phaseId === phaseId)
  },
}))
