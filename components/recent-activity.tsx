"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FileText, MessageSquare, CheckCircle, Upload } from 'lucide-react'

const activities = [
  {
    id: 1,
    type: "comment",
    icon: MessageSquare,
    user: "Mike Johnson",
    action: "commented on Kitchen Design",
    time: "2h ago",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: 2,
    type: "task",
    icon: CheckCircle,
    user: "Sarah Wilson",
    action: "completed lighting task",
    time: "4h ago",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: 3,
    type: "upload",
    icon: Upload,
    user: "Jane Designer",
    action: "uploaded new mockups",
    time: "6h ago",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: 4,
    type: "document",
    icon: FileText,
    user: "Alex Chen",
    action: "created new proposal",
    time: "1d ago",
    avatar: "/placeholder.svg?height=32&width=32",
  },
]

export function RecentActivity() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h2>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={activity.avatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                {activity.user.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <activity.icon className="w-4 h-4 text-gray-500" />
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{activity.user}</span>
                  {' '}{activity.action}
                </p>
              </div>
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
