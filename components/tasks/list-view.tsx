"use client"
import { Button } from "@/components/ui/button"
import { StatusBadge, TypeChip } from "@/components/chip"
import { ChevronRight, Plus } from "lucide-react"
import type { Task, Phase, TeamMember, ListColumn } from "@/components/tasks/types"

type UITask = Task & { startDate?: string; endDate?: string }

export default function ListView({
  tasks,
  team,
  phases,
  lists,
  onEditTask,
  onCreateTask,
}: {
  tasks: UITask[]
  team: TeamMember[]
  phases: Phase[]
  lists: (ListColumn & { id: string; colorClass?: string })[]
  onEditTask: (t: UITask) => void
  onCreateTask: (phaseId?: string) => void
}) {
  const tasksByPhase = groupByPhase(tasks, phases)

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
      {phases.map((phase) => {
        const pts = tasksByPhase[phase.id] || []
        return (
          <div key={phase.id} className="border-b last:border-b-0 border-gray-200">
            <div className="px-5 py-3 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900">{phase.name}</span>
                <TypeChip label={String(pts.length)} />
              </div>
              <Button variant="ghost" size="sm" onClick={() => onCreateTask(phase.id)} className="gap-1">
                <Plus className="h-4 w-4" />
                Add task
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[800px] w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b border-gray-200">
                    <th className="px-5 py-2 font-medium">Task</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Priority</th>
                    <th className="px-3 py-2 font-medium">Assignees</th>
                    <th className="px-3 py-2 font-medium">List</th>
                    <th className="px-3 py-2 font-medium">Start</th>
                    <th className="px-3 py-2 font-medium">End</th>
                    <th className="px-3 py-2 font-medium">Due</th>
                  </tr>
                </thead>
                <tbody>
                  {pts.length === 0 ? (
                    <tr>
                      <td className="px-5 py-4 text-sm text-gray-500" colSpan={8}>
                        No tasks in this phase.
                      </td>
                    </tr>
                  ) : (
                    pts.map((t) => {
                      const list = lists.find((l) => l.id === t.listId)
                      const assignees = t.assigneeIds || []
                      return (
                        <tr
                          key={t.id}
                          className="border-b last:border-b-0 border-gray-100 hover:bg-gray-50 cursor-pointer"
                          onClick={() => onEditTask(t)}
                        >
                          <td className="px-5 py-3">
                            <div className="text-sm text-gray-900">{t.title}</div>
                          </td>
                          <td className="px-3 py-3">
                            <StatusBadge status={t.status} label={t.status} />
                          </td>
                          <td className="px-3 py-3">
                            <StatusBadge status={t.priority} label={t.priority} />
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex flex-wrap gap-1.5">
                              {assignees.length === 0 ? (
                                <span className="text-xs text-gray-500">Unassigned</span>
                              ) : (
                                assignees.map((id) => {
                                  const m = team.find((tm) => tm.id === id)
                                  return <TypeChip key={id} label={m ? m.name : id} />
                                })
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-xs text-gray-700">{list?.title ?? "—"}</span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-xs text-gray-700">{t.startDate ?? "—"}</span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-xs text-gray-700">{t.endDate ?? "—"}</span>
                          </td>
                          <td className="px-3 py-3">
                            <span className="text-xs text-gray-700">{t.dueDate ?? "—"}</span>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function groupByPhase(tasks: UITask[], phases: Phase[]) {
  const map: Record<string, UITask[]> = {}
  for (const p of phases) map[p.id] = []
  for (const t of tasks) {
    if (t.phaseId && map[t.phaseId]) map[t.phaseId].push(t)
  }
  return map
}
