"use client"

import { Badge } from "@/components/ui/badge"
import { Calendar, Clock } from 'lucide-react'

const tasks = [
  {
    id: 1,
    title: "Client Presentation",
    project: "Luxury Penthouse",
    date: "Today",
    time: "2:00 PM",
    priority: "high",
  },
  {
    id: 2,
    title: "Material Selection Review",
    project: "Modern Office",
    date: "Tomorrow",
    time: "10:00 AM",
    priority: "medium",
  },
  {
    id: 3,
    title: "Final Design Approval",
    project: "Boutique Hotel",
    date: "Friday",
    time: "3:30 PM",
    priority: "high",
  },
  {
    id: 4,
    title: "Budget Review Meeting",
    project: "Residential Remodel",
    date: "Next Week",
    time: "11:00 AM",
    priority: "low",
  },
]

export function UpcomingTasks() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-yellow-500" />
        <h2 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h2>
      </div>
      
      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="p-2 bg-white rounded-lg border border-gray-200">
              <Calendar className="w-4 h-4 text-gray-500" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-gray-900 text-sm">
                  {task.title}
                </h4>
                <Badge
                  variant={
                    task.priority === 'high' ? 'destructive' :
                    task.priority === 'medium' ? 'default' : 'secondary'
                  }
                  className={`text-xs ${
                    task.priority === 'high' ? 'bg-red-50 text-red-700 border-red-200' :
                    task.priority === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                    'bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  {task.priority}
                </Badge>
              </div>
              <p className="text-xs text-gray-600 mb-1">{task.project}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{task.date}</span>
                <span>•</span>
                <span>{task.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
