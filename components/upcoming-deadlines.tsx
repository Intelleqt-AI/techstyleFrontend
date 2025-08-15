"use client"

import { Badge } from "@/components/ui/badge"
import { Calendar, AlertTriangle } from 'lucide-react'

const deadlines = [
  {
    id: 1,
    title: "Client Presentation",
    project: "Luxury Penthouse",
    date: "Today",
    priority: "high",
  },
  {
    id: 2,
    title: "Material Selection",
    project: "Modern Office",
    date: "Tomorrow",
    priority: "medium",
  },
  {
    id: 3,
    title: "Final Review",
    project: "Boutique Hotel",
    date: "Friday",
    priority: "high",
  },
  {
    id: 4,
    title: "Budget Approval",
    project: "Residential Remodel",
    date: "Next Week",
    priority: "low",
  },
]

export function UpcomingDeadlines() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <AlertTriangle className="w-5 h-5 text-yellow-400" />
        <h2 className="text-xl font-bold text-white">Upcoming Deadlines</h2>
      </div>
      
      <div className="space-y-4">
        {deadlines.map((deadline) => (
          <div key={deadline.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
            <div className="p-2 bg-gray-700 rounded-lg">
              <Calendar className="w-4 h-4 text-gray-400" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-white text-sm">
                  {deadline.title}
                </h4>
                <Badge
                  variant={
                    deadline.priority === 'high' ? 'destructive' :
                    deadline.priority === 'medium' ? 'default' : 'secondary'
                  }
                  className="text-xs"
                >
                  {deadline.priority}
                </Badge>
              </div>
              <p className="text-xs text-gray-400">{deadline.project}</p>
            </div>
            
            <div className="text-xs font-medium text-yellow-400">
              {deadline.date}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
