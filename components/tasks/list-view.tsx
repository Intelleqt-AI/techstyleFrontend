'use client';
import { Button } from '@/components/ui/button';
import { StatusBadge, TypeChip } from '@/components/chip';
import { ChevronRight, Plus } from 'lucide-react';
import type { Task, Phase, TeamMember, ListColumn } from '@/components/tasks/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

type UITask = Task & { startDate?: string; endDate?: string };

function formatStatus(status: string): string {
  switch (status) {
    case 'in-progress':
      return 'In Progress';
    case 'todo':
      return 'Todo';
    case 'done':
      return 'Done';
    case 'in-review':
      return 'In Review';
    default:
      return status;
  }
}

function formatDate(dateString: string): string {
  if (!dateString) return null;
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export default function ListView({
  tasks,
  team,
  phases,
  lists,
  onEditTask,
  onCreateTask,
}: {
  tasks: UITask[];
  team: TeamMember[];
  phases: Phase[];
  lists: (ListColumn & { id: string; colorClass?: string })[];
  onEditTask: (t: UITask) => void;
  onCreateTask: (phaseId?: string) => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
      {tasks &&
        tasks?.map(phase => {
          return (
            <div key={phase.id} className="border-b last:border-b-0 border-gray-200">
              <div className="px-5 py-3 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-900">{phase.name}</span>
                  <TypeChip label={String(phase?.items?.length)} />
                </div>
                <Button variant="ghost" size="sm" onClick={() => onCreateTask(phase.name)} className="gap-1">
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
                      {/* <th className="px-3 py-2 font-medium">List</th> */}
                      <th className="px-3 py-2 font-medium">Start</th>
                      <th className="px-3 py-2 font-medium">End</th>
                      <th className="px-3 py-2 font-medium">Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {phase?.items?.length == 0 ? (
                      <tr>
                        <td className="px-5 py-4 text-sm text-gray-500" colSpan={8}>
                          No tasks in this phase.
                        </td>
                      </tr>
                    ) : (
                      phase?.items?.map(t => {
                        console.log(phase);
                        return (
                          <tr
                            key={t.id}
                            className="border-b last:border-b-0 border-gray-100 hover:bg-gray-50 cursor-pointer"
                            onClick={() => onEditTask(t)}
                          >
                            <td className="px-5 py-3">
                              <div className="text-sm text-gray-900">{t?.name}</div>
                            </td>
                            <td className="px-3 py-3">
                              <StatusBadge status={formatStatus(t?.status)} label={formatStatus(t?.status)} />
                            </td>
                            <td className="px-3 py-3">{t.priority && <StatusBadge status={t.priority} label={t.priority} />}</td>
                            <td className="px-3 py-3">
                              <div className="flex flex-wrap gap-1.5">
                                {!t?.assigned || t.assigned.length === 0 ? (
                                  <span className="text-xs text-gray-500">Unassigned</span>
                                ) : (
                                  <>
                                    {t.assigned.slice(0, 3).map((member, index) => (
                                      <Avatar key={member?.id ?? index} className="w-6 h-6 border-2 border-white">
                                        <AvatarImage src={member?.photoURL} />
                                        <AvatarFallback className="text-xs bg-clay-200 text-clay-700">
                                          {member?.name?.[0] ?? '?'}
                                        </AvatarFallback>
                                      </Avatar>
                                    ))}

                                    {t.assigned.length > 3 && (
                                      <div className="w-6 h-6 rounded-full bg-greige-200 border-2 border-white flex items-center justify-center">
                                        <span className="text-xs text-ink-muted">+{t.assigned.length - 3}</span>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </td>

                            {/* <td className="px-3 py-3">
                              <span className="text-xs text-gray-700">{list?.title ?? '—'}</span>
                            </td> */}
                            <td className="px-3 py-3">
                              <span className="text-xs text-gray-700">{formatDate(t?.startDate) ?? '—'}</span>
                            </td>
                            <td className="px-3 py-3">
                              <span className="text-xs text-gray-700">{t.endDate ?? '—'}</span>
                            </td>
                            <td className="px-3 py-3">
                              <span className="text-xs text-gray-700">{formatDate(t?.dueDate) ?? '—'}</span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
    </div>
  );
}

function groupByPhase(tasks: UITask[], phases: Phase[]) {
  const map: Record<string, UITask[]> = {};
  for (const p of phases) map[p.id] = [];
  for (const t of tasks) {
    if (t.phaseId && map[t.phaseId]) map[t.phaseId].push(t);
  }
  return map;
}
