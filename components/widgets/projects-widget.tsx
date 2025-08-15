"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Calendar, DollarSign, Users } from "lucide-react"

const projects = [
  {
    id: 1,
    name: "Luxury Penthouse Redesign",
    client: "Smith Family",
    progress: 75,
    budget: "£125,000",
    deadline: "Dec 15, 2025",
    status: "on-track",
    team: 4,
  },
  {
    id: 2,
    name: "Modern Office Space",
    client: "TechCorp Inc.",
    progress: 45,
    budget: "£85,000",
    deadline: "Jan 30, 2026",
    status: "at-risk",
    team: 3,
  },
  {
    id: 3,
    name: "Boutique Hotel Lobby",
    client: "Grandeur Hotels",
    progress: 90,
    budget: "£200,000",
    deadline: "Nov 20, 2025",
    status: "ahead",
    team: 6,
  },
]

export function ProjectsWidget() {
  const statusBadge = (s: string) =>
    s === "on-track"
      ? "bg-sage-300/30 text-olive-700 border border-olive-700/20"
      : s === "at-risk"
        ? "bg-terracotta-600/10 text-terracotta-600 border border-terracotta-600/30"
        : "bg-clay-500/10 text-clay-700 border border-clay-500/30"

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Active Projects</CardTitle>
        <Button variant="ghost" size="sm">
          View all
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {projects.map((project) => (
          <div key={project.id} className="p-4 rounded-lg border bg-white hover:bg-neutral-50 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-medium text-sm text-neutral-900 mb-1">{project.name}</h4>
                <p className="text-xs text-neutral-500">{project.client}</p>
              </div>
              <span
                className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${statusBadge(project.status)}`}
              >
                {project.status === "on-track" ? "On Track" : project.status === "at-risk" ? "At Risk" : "Ahead"}
              </span>
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">Progress</span>
                <span className="font-medium text-neutral-900">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-2 [&>div]:bg-clay-500" />
            </div>

            <div className="flex items-center justify-between text-xs text-neutral-600">
              <div className="flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-slatex-500" />
                {project.budget}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slatex-500" />
                {project.deadline}
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3 text-slatex-500" />
                {project.team} members
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
