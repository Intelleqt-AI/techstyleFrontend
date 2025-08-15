"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { MoreHorizontal, Clock, User, Plus } from 'lucide-react'

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
  {
    id: 4,
    title: "Finalize color palette",
    project: "Residential Remodel",
    priority: "high",
    dueDate: "Monday",
    assignee: "Jane Designer",
    completed: false,
  },
]

export function TaskBoard() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">My Tasks</h2>
        <Button size="sm" className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-medium hover:from-yellow-500 hover:to-yellow-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>
      
      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
              task.completed 
                ? 'bg-gray-800/50 border-gray-700 opacity-60' 
                : 'bg-gray-800 border-gray-700 hover:border-gray-600'
            }`}
          >
            <Checkbox checked={task.completed} />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h4 className={`font-medium ${
                  task.completed ? 'line-through text-gray-400' : 'text-white'
                }`}>
                  {task.title}
                </h4>
                <Badge
                  variant={
                    task.priority === 'high' ? 'destructive' :
                    task.priority === 'medium' ? 'default' : 'secondary'
                  }
                  className="text-xs"
                >
                  {task.priority}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="font-medium">{task.project}</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {task.dueDate}
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {task.assignee}
                </div>
              </div>
            </div>
            
            <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-gray-400 hover:text-white">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
