"use client";

import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NewProjectDialog } from "@/components/project-wizard/new-project-dialog";
import { Plus, Calendar, Building, Store } from "lucide-react";
import { ProjectNavMain } from "@/components/project-nav-main";
import { useQuery } from "@tanstack/react-query";
import { fetchProjects } from "@/supabase/API";

// Mock data
const projects = [
  {
    id: "chelsea-penthouse",
    name: "Chelsea Penthouse",
    code: "LUX-001",
    client: "Amanda Richardson",
    type: "Residential",
    status: "In Progress",
    progress: 68,
    budget: "£850,000",
    spent: "£578,000",
    startDate: "2024-01-15",
    endDate: "2024-08-30",
    team: [
      { name: "Jane Designer", avatar: "/avatars/jane.jpg" },
      { name: "Tom Manager", avatar: "/avatars/tom.jpg" },
      { name: "Sarah Procurement", avatar: "/avatars/sarah.jpg" },
    ],
    image: "/images/luxury-penthouse.png",
    phase: "Design Development",
    nextMilestone: "Client presentation",
    daysUntilMilestone: 5,
  },
  {
    id: "cotswold-country-home",
    name: "Cotswold Country Home",
    code: "COT-002",
    client: "The Atkinson Family",
    type: "Residential",
    status: "Planning",
    progress: 25,
    budget: "£1,200,000",
    spent: "£180,000",
    startDate: "2024-03-01",
    endDate: "2024-12-15",
    team: [
      { name: "Mike Designer", avatar: "/avatars/mike.jpg" },
      { name: "Lisa Manager", avatar: "/avatars/lisa.jpg" },
    ],
    image: "/images/modern-office.png",
    phase: "Concept Design",
    nextMilestone: "Planning approval",
    daysUntilMilestone: 12,
  },
  {
    id: "bath-boutique-hotel-lobby",
    name: "Bath Boutique Hotel Lobby",
    code: "BTH-003",
    client: "Grandeur Hotels UK",
    type: "Commercial",
    status: "On Hold",
    progress: 45,
    budget: "£450,000",
    spent: "£202,500",
    startDate: "2023-11-01",
    endDate: "2024-06-30",
    team: [
      { name: "Alex Designer", avatar: "/avatars/alex.jpg" },
      { name: "Emma Manager", avatar: "/avatars/emma.jpg" },
      { name: "Chris Procurement", avatar: "/avatars/chris.jpg" },
    ],
    image: "/images/hotel-lobby.png",
    phase: "Technical Drawings",
    nextMilestone: "Material selection",
    daysUntilMilestone: 0,
  },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case "Residential":
      return <Building className="w-3 h-3 mr-1" />;
    case "Commercial":
      return <Store className="w-3 h-3 mr-1" />;
    default:
      return <Building className="w-3 h-3 mr-1" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "Residential":
      return "bg-white text-gray-700 border-gray-300";
    case "Commercial":
      return "bg-white text-gray-700 border-gray-300";
    default:
      return "bg-white text-gray-700 border-gray-300";
  }
};

// Format date to "15 Aug 2025" format
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function ProjectsPage() {
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [viewMode, setViewMode] = useState<"board" | "table">("board");
  const [project, setProject] = useState([]);
  const [filteredProjects, setfilteredProjects] = useState([]);

  // Projects
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["projects"],
    queryFn: fetchProjects,
  });

  useEffect(() => {
    if (isLoading) return;
    setProject(data);
  }, [data, isLoading]);

  // const filteredProjects = projects;

  useEffect(() => {
    setfilteredProjects(projects);
  }, [projects]);

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto space-y-6">
        <ProjectNavMain activeTab="all" counts={{ active: 3 }} />

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1">
            <div className="bg-white border border-gray-200 rounded-lg p-1 flex gap-1">
              <button
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  viewMode === "board"
                    ? "text-white hover:text-white"
                    : "text-gray-700 hover:text-white"
                }`}
                style={{
                  backgroundColor:
                    viewMode === "board" ? "rgb(17, 24, 39)" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (viewMode !== "board") {
                    e.currentTarget.style.backgroundColor = "rgb(17, 24, 39)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (viewMode !== "board") {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
                onClick={() => setViewMode("board")}>
                Board
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  viewMode === "table"
                    ? "text-white hover:text-white"
                    : "text-gray-700 hover:text-white"
                }`}
                style={{
                  backgroundColor:
                    viewMode === "table" ? "rgb(17, 24, 39)" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (viewMode !== "table") {
                    e.currentTarget.style.backgroundColor = "rgb(17, 24, 39)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (viewMode !== "table") {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
                onClick={() => setViewMode("table")}>
                Table
              </button>
            </div>
          </div>

          <Button
            size="sm"
            className="gap-2 bg-primary text-primary-foreground hover:opacity-90"
            onClick={() => setShowNewProjectDialog(true)}>
            <Plus className="w-4 h-4" />
            Add Project
          </Button>
        </div>
      </div>

      {/* Projects Content */}
      {viewMode === "board" ? (
        /* Projects Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Link key={project?.id} href={`/projects/${project?.id}`}>
              <Card className="border-borderSoft bg-white hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-0">
                  {/* Project Image */}
                  <div className="relative h-48 bg-greige-100 rounded-t-lg overflow-hidden">
                    <img
                      src={project?.image || "/placeholder.svg"}
                      alt={project?.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30">
                        {project?.phase}
                      </Badge>
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="p-4 space-y-4">
                    {/* Header */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-ink line-clamp-1">
                          {project?.name}
                        </h3>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getTypeColor(project?.type)}`}>
                          <div className="flex items-center">
                            {getTypeIcon(project?.type)}
                            {project?.type}
                          </div>
                        </Badge>
                      </div>
                      <p className="text-sm text-ink-muted">
                        {project?.code} • {project?.client}
                      </p>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-ink-muted">Progress</span>
                        <span className="font-medium text-ink">
                          {project?.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-greige-200 rounded-full h-1">
                        <div
                          className="bg-sage-500 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${project?.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Date Range */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-ink-muted">Date</span>
                      <span className="font-medium text-ink">
                        {formatDate(project?.startDate)} -{" "}
                        {formatDate(project?.endDate)}
                      </span>
                    </div>

                    {/* Budget */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-ink-muted">Budget</span>
                      <div className="text-right">
                        <div className="font-medium text-ink">
                          {project?.budget}
                        </div>
                        <div className="text-xs text-ink-muted">
                          {project?.spent} spent
                        </div>
                      </div>
                    </div>

                    {/* Team */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-ink-muted">Team</span>
                      <div className="flex -space-x-2">
                        {project?.team.slice(0, 3).map((member, index) => (
                          <Avatar
                            key={index}
                            className="w-6 h-6 border-2 border-white">
                            <AvatarImage
                              src={member.avatar || "/placeholder.svg"}
                            />
                            <AvatarFallback className="text-xs bg-clay-200 text-clay-700">
                              {member.name[0]}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {project?.team.length > 3 && (
                          <div className="w-6 h-6 rounded-full bg-greige-200 border-2 border-white flex items-center justify-center">
                            <span className="text-xs text-ink-muted">
                              +{project?.team.length - 3}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Next Milestone */}
                    {project?.nextMilestone && (
                      <div className="pt-2 border-t border-borderSoft">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-ink-muted">Next milestone</span>
                          <div className="text-right">
                            <div className="font-medium text-ink">
                              {project?.nextMilestone}
                            </div>
                            <div className="text-xs text-ink-muted">
                              {project?.daysUntilMilestone === 0
                                ? "Due today"
                                : `${project?.daysUntilMilestone} days`}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        /* Projects Table */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Project
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Client
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Progress
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Budget
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Timeline
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                    Team
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {filteredProjects.map((project, index) => (
                  <tr key={project?.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <Link
                        href={`/projects/${project?.id}`}
                        className="flex items-center gap-3 hover:text-primary">
                        <div className="w-10 h-10 bg-greige-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={project?.image || "/placeholder.svg"}
                            alt={project?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium text-ink">
                            {project?.name}
                          </div>
                          <div className="text-sm text-ink-muted">
                            {project?.code}
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="py-4 px-4 text-sm text-ink">
                      {project?.client}
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        variant="outline"
                        className={`text-xs ${getTypeColor(project?.type)}`}>
                        <div className="flex items-center">
                          {getTypeIcon(project?.type)}
                          {project?.type}
                        </div>
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          project?.status === "In Progress"
                            ? "bg-sage-50 text-sage-700 border-sage-200"
                            : project?.status === "Planning"
                            ? "bg-clay-50 text-clay-700 border-clay-200"
                            : "bg-greige-50 text-greige-700 border-greige-200"
                        }`}>
                        {project?.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-greige-200 rounded-full h-1">
                          <div
                            className="bg-sage-500 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${project?.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-ink">
                          {project?.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <div className="font-medium text-ink">
                          {project.budget}
                        </div>
                        <div className="text-ink-muted">
                          {project.spent} spent
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-ink">
                      <div>
                        <div>{formatDate(project.startDate)}</div>
                        <div className="text-ink-muted">
                          to {formatDate(project.endDate)}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex -space-x-2">
                        {project.team.slice(0, 3).map((member, memberIndex) => (
                          <Avatar
                            key={memberIndex}
                            className="w-6 h-6 border-2 border-white">
                            <AvatarImage
                              src={member.avatar || "/placeholder.svg"}
                            />
                            <AvatarFallback className="text-xs bg-clay-200 text-clay-700">
                              {member.name[0]}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {project.team.length > 3 && (
                          <div className="w-6 h-6 rounded-full bg-greige-200 border-2 border-white flex items-center justify-center">
                            <span className="text-xs text-ink-muted">
                              +{project.team.length - 3}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-greige-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-greige-400" />
          </div>
          <h3 className="text-lg font-medium text-ink mb-2">
            No projects found
          </h3>
          <p className="text-ink-muted mb-4">
            {"Get started by creating your first project"}
          </p>
          <Button
            onClick={() => setShowNewProjectDialog(true)}
            className="bg-clay-600 hover:bg-clay-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New project
          </Button>
        </div>
      )}

      {/* New Project Dialog */}
      <NewProjectDialog
        open={showNewProjectDialog}
        onOpenChange={setShowNewProjectDialog}
      />
    </div>
  );
}
