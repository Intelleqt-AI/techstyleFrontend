"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, DollarSign, Users, ArrowRight } from 'lucide-react'

const projects = [
  {
    id: 1,
    name: "Luxury Penthouse Redesign",
    client: "Smith Family",
    progress: 75,
    budget: "$125,000",
    deadline: "Dec 15, 2024",
    status: "on-track",
    team: 4,
  },
  {
    id: 2,
    name: "Modern Office Space",
    client: "TechCorp Inc.",
    progress: 45,
    budget: "$85,000",
    deadline: "Jan 30, 2025",
    status: "at-risk",
    team: 3,
  },
  {
    id: 3,
    name: "Boutique Hotel Lobby",
    client: "Grandeur Hotels",
    progress: 90,
    budget: "$200,000",
    deadline: "Nov 20, 2024",
    status: "ahead",
    team: 6,
  },
]

export function ProjectOverview() {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Active Projects</h2>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
          View All
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
      
      <div className="space-y-4">
        {projects.map((project) => (
          <div key={project.id} className="p-4 rounded-lg bg-gray-800 border border-gray-700 hover:border-gray-600 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-white mb-1">
                  {project.name}
                </h4>
                <p className="text-sm text-gray-400">{project.client}</p>
              </div>
              <Badge
                variant={
                  project.status === 'on-track' ? 'default' :
                  project.status === 'at-risk' ? 'destructive' : 'secondary'
                }
                className="text-xs"
              >
                {project.status === 'on-track' ? 'On Track' :
                 project.status === 'at-risk' ? 'At Risk' : 'Ahead'}
              </Badge>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Progress</span>
                <span className="font-medium text-white">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2" />
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                {project.budget}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {project.deadline}
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {project.team} members
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
