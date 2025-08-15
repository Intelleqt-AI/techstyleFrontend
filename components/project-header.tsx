"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Share, MoreHorizontal } from 'lucide-react'
import { cn } from "@/lib/utils"

interface ProjectHeaderProps {
  projectName: string
  clientName: string
  location: string
  status: 'on-track' | 'at-risk' | 'ahead'
}

export function ProjectHeader({ 
  projectName, 
  clientName, 
  location, 
  status 
}: ProjectHeaderProps) {
  return (
    <div className="h-10 flex items-center justify-between px-6 bg-white border-b border-gray-100">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold text-gray-900">{projectName}</h1>
        <Badge
          className={cn(
            'text-xs',
            status === 'on-track' ? 'bg-green-50 text-green-700 border-green-200' :
            status === 'at-risk' ? 'bg-red-50 text-red-700 border-red-200' : 
            'bg-blue-50 text-blue-700 border-blue-200'
          )}
        >
          {status === 'on-track' ? 'On Track' :
           status === 'at-risk' ? 'At Risk' : 'Ahead'}
        </Badge>
        <span className="text-sm text-gray-600">{clientName} • {location}</span>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm">
          <Share className="w-4 h-4 mr-2" />
          Share
        </Button>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
