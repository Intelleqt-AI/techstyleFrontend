"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FileText, MessageSquare, CheckCircle, Upload } from 'lucide-react'

const activities = [
  {
    id: 1,
    type: "comment",
    icon: MessageSquare,
    user: "Mike Johnson",
    action: "commented on",
    target: "Kitchen Design Concepts",
    time: "2 hours ago",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: 2,
    type: "task",
    icon: CheckCircle,
    user: "Sarah Wilson",
    action: "completed task",
    target: "Source lighting fixtures",
    time: "4 hours ago",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: 3,
    type: "upload",
    icon: Upload,
    user: "Jane Designer",
    action: "uploaded files to",
    target: "Penthouse Project",
    time: "6 hours ago",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  {
    id: 4,
    type: "document",
    icon: FileText,
    user: "Alex Chen",
    action: "created proposal for",
    target: "Hotel Lobby Redesign",
    time: "1 day ago",
    avatar: "/placeholder.svg?height=32&width=32",
  },
]

export function RecentActivityWidget() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={activity.avatar || "/placeholder.svg"} />
              <AvatarFallback className="text-xs">
                {activity.user.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <activity.icon className="w-4 h-4 text-neutral-400" />
                <p className="text-sm text-neutral-900">
                  <span className="font-medium">{activity.user}</span>
                  {' '}{activity.action}{' '}
                  <span className="font-medium">{activity.target}</span>
                </p>
              </div>
              <p className="text-xs text-neutral-400">{activity.time}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
