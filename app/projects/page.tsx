'use client';

import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { NewProjectDialog } from '@/components/project-wizard/new-project-dialog';
import { Plus, Calendar, Building, Store } from 'lucide-react';
import { ProjectNavMain } from '@/components/project-nav-main';
import { useQuery } from '@tanstack/react-query';
import { fetchProjects, getTask } from '@/supabase/API';
import useClient from '@/hooks/useClient';
import projectCover from '/public/project_cover.jpg';
import Image from 'next/image';
import dayjs from 'dayjs';

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'residential':
      return <Building className="w-3 h-3 mr-1" />;
    case 'commercial':
      return <Store className="w-3 h-3 mr-1" />;
    default:
      return <Building className="w-3 h-3 mr-1" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'Residential':
      return 'bg-white text-gray-700 border-gray-300';
    case 'Commercial':
      return 'bg-white text-gray-700 border-gray-300';
    default:
      return 'bg-white text-gray-700 border-gray-300';
  }
};

// Format date to "15 Aug 2025" format
const formatDate = (dateString: string) => {
  if (!dateString) return;
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const calculateProjectProgress = (projectId: string, tasks: Task[] | undefined, isLoading: boolean): number => {
  if (isLoading || !tasks) return 0;

  const projectTasks = tasks.filter(item => item.projectID === projectId);
  if (projectTasks.length === 0) return 0;

  const completedTasks = projectTasks.filter(task => task.status === 'done');
  const progress = Math.floor((completedTasks.length / projectTasks.length) * 100);

  return progress;
};

export default function ProjectsPage() {
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
  const [project, setProject] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  // Projects
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });

  const {
    data: taskData,
    isLoading: taskLoading,
    error: taskError,
    refetch: taskRefetch,
  } = useQuery({
    queryKey: ['task'],
    queryFn: getTask,
  });

  // Get clients
  const { data: clientData, isLoading: loadingClient, refetch: refetchClient } = useClient();

  useEffect(() => {
    if (isLoading) return;
    if (activeTab == 'all') {
      setProject(data);
    } else if (activeTab == 'active') {
      setProject(data?.filter(item => !item.isArchive));
    } else if (activeTab == 'completed') {
    } else if (activeTab == 'archived') {
      setProject(data?.filter(item => item.isArchive));
    }
  }, [data, isLoading, activeTab]);

  console.log(activeTab);

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto space-y-6">
        <ProjectNavMain
          onChange={setActiveTab}
          activeTab={activeTab}
          counts={{
            active: data?.filter(item => !item.isArchive)?.length,
            archived: data?.filter(item => item.isArchive)?.length,
            all: data?.length,
          }}
        />

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1">
            <div className="bg-white border border-gray-200 rounded-lg p-1 flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('board')}
                className={` font-medium px-3 ${
                  viewMode == 'board'
                    ? 'bg-gray-900 hover:bg-gray-900 hover:text-white text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                Board
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('table')}
                className={`font-medium px-3 ${
                  viewMode === 'table'
                    ? 'bg-gray-900 hover:bg-gray-900 hover:text-white text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                Table
              </Button>
            </div>
          </div>

          <Button
            size="sm"
            className="gap-2 bg-primary text-primary-foreground hover:opacity-90"
            onClick={() => setShowNewProjectDialog(true)}
          >
            <Plus className="w-4 h-4" />
            Add Project
          </Button>
        </div>
      </div>

      {/* Projects Content */}
      {viewMode === 'board' ? (
        /* Projects Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {project &&
            project?.length > 0 &&
            project.map(project => {
              const nextPhase = project.phases
                ?.filter(phase => dayjs(phase.endDate).isAfter(dayjs()))
                .sort((a, b) => dayjs(a.endDate) - dayjs(b.endDate))[0];
              const daysUntilMilestone = nextPhase ? dayjs(nextPhase.endDate).diff(dayjs(), 'day') : null;
              return (
                <Link key={project?.id} href={`/projects/${project?.id}`}>
                  <Card className="border-borderSoft h-full bg-white hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-0">
                      {/* Project Image */}
                      <div className="relative h-48 bg-greige-100 rounded-t-lg overflow-hidden">
                        <Image
                          width={400}
                          height={400}
                          className="w-full h-full object-cover"
                          src={
                            project?.images[0]
                              ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/Cover/${project?.id}/${project?.images[0]?.name}`
                              : projectCover
                          }
                          alt=""
                          loading="lazy"
                        />
                        <div className="absolute top-3 right-3">
                          {project?.phases && (
                            <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30">
                              {project?.phases[0]?.name}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Project Details */}
                      <div className="p-4 space-y-4">
                        {/* Header */}
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <h3 className="font-semibold capitalize text-ink line-clamp-1">{project?.name}</h3>
                            <Badge variant="outline" className={`text-xs ${getTypeColor(project?.type)}`}>
                              <div className="flex capitalize items-center">
                                {getTypeIcon(project?.projectType)}
                                {project?.projectType || 'Not Set'}
                              </div>
                            </Badge>
                          </div>
                          <span className="text-sm text-ink-muted">
                            {project?.code ? (
                              <>
                                {project?.code} •{' '}
                                {project?.client ? clientData?.data?.find(client => client?.id == project?.client)?.name : 'No client'}
                              </>
                            ) : project?.client ? (
                              clientData?.data?.find(client => client?.id == project?.client)?.name || 'No client'
                            ) : (
                              'No client'
                            )}
                          </span>
                        </div>

                        {/* Progress */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-ink-muted">Progress</span>
                            <span className="font-medium text-ink">
                              {calculateProjectProgress(project?.id, taskData?.data, isLoading)}%
                            </span>
                          </div>
                          <div className="w-full bg-greige-200 rounded-full h-1">
                            <div
                              className="bg-sage-500 h-1 rounded-full transition-all duration-300"
                              style={{
                                width: `${calculateProjectProgress(project?.id, taskData?.data, isLoading)}%`,
                              }}
                            />
                          </div>
                        </div>

                        {/* Date Range */}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-ink-muted">Date</span>
                          <span className="font-medium text-ink">
                            {formatDate(project?.startDate)} - {formatDate(project?.endDate)}
                          </span>
                        </div>

                        {/* Budget */}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-ink-muted">Budget</span>
                          <div className="text-right">
                            <div className="font-medium text-ink">
                              {project?.currency?.symbol || '£'}
                              {Number(project?.budget).toLocaleString('en-GB', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </div>
                            <div className="text-xs text-ink-muted"> {project?.currency?.symbol || '£'}0 spent</div>
                          </div>
                        </div>

                        {/* Team */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-ink-muted">Team</span>
                          <div className="flex -space-x-2">
                            {project?.assigned &&
                              project?.assigned.slice(0, 3).map((member, index) => (
                                <Avatar key={index} className="w-6 h-6 border-2 border-white">
                                  <AvatarImage src={member?.photoURL} />
                                  <AvatarFallback className="text-xs bg-clay-200 text-clay-700">{member?.name[0]}</AvatarFallback>
                                </Avatar>
                              ))}
                            {project?.assigned && project?.assigned.length > 3 && (
                              <div className="w-6 h-6 rounded-full bg-greige-200 border-2 border-white flex items-center justify-center">
                                <span className="text-xs text-ink-muted">+{project?.assigned.length - 3}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Next Milestone */}
                        {
                          <div className="pt-2 border-t border-borderSoft">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-ink-muted">Next milestone</span>
                              {nextPhase ? (
                                <div className="text-right">
                                  <div className="font-medium text-ink">{nextPhase?.name}</div>
                                  <div className="text-xs text-ink-muted">
                                    {daysUntilMilestone === 0 ? 'Due today' : `${daysUntilMilestone} days`}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-right">
                                  <div className="font-medium text-ink">Not applicable</div>
                                  <div className="text-xs text-ink-muted">Please add phase</div>
                                </div>
                              )}
                            </div>
                          </div>
                        }
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
        </div>
      ) : (
        /* Projects Table */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Project</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Client</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Progress</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Budget</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Timeline</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Team</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {project &&
                  project.length > 0 &&
                  project.map((project, index) => (
                    <tr key={project?.id} className="hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <Link href={`/projects/${project?.id}`} className="flex items-center gap-3 hover:text-primary">
                          <div className="w-10 h-10 bg-greige-100 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              width={400}
                              height={400}
                              className="w-full h-full object-cover"
                              src={
                                project?.images[0]
                                  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/Cover/${project?.id}/${project?.images[0]?.name}`
                                  : projectCover
                              }
                              alt=""
                              loading="lazy"
                            />
                          </div>
                          <div>
                            <div className="font-medium text-ink">{project?.name}</div>
                            <div className="text-sm text-ink-muted">{project?.code}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="py-4 px-4 text-sm text-ink">
                        {(clientData && clientData?.data?.find(client => client?.id == project?.client)?.name) || '-'}
                      </td>
                      <td className="py-4 px-4 capitalize">
                        <Badge variant="outline" className={`text-xs ${getTypeColor(project?.projectType)}`}>
                          <div className="flex capitalize items-center">
                            {getTypeIcon(project?.projectType)}
                            {project?.projectType || 'Not set'}
                          </div>
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            project?.status === 'In Progress'
                              ? 'bg-sage-50 text-sage-700 border-sage-200'
                              : project?.status === 'Planning'
                              ? 'bg-clay-50 text-clay-700 border-clay-200'
                              : 'bg-greige-50 text-greige-700 border-greige-200'
                          }`}
                        >
                          {project?.status || 'In progress'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-1">
                            <div
                              className="bg-sage-500 h-1 rounded-full transition-all duration-300"
                              style={{
                                width: `${calculateProjectProgress(project?.id, taskData?.data, isLoading)}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium text-ink">
                            {calculateProjectProgress(project?.id, taskData?.data, isLoading)}%
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <div className="font-medium text-ink">
                            {project?.currency?.symbol || '£'}
                            {Number(project?.budget).toLocaleString('en-GB', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </div>
                          <div className="text-ink-muted">{project?.currency?.symbol || '£'}0 spent</div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-ink">
                        <div>
                          <div>{formatDate(project?.startDate)}</div>
                          <div className="text-ink-muted">to {formatDate(project?.endDate)}</div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex -space-x-2">
                          {project?.assigned &&
                            project.assigned.slice(0, 3).map((member, memberIndex) => (
                              <Avatar key={memberIndex} className="w-6 h-6 border-2 border-white">
                                <AvatarImage src={member.photoURL} />
                                <AvatarFallback className="text-xs bg-clay-200 text-clay-700">{member?.name[0]}</AvatarFallback>
                              </Avatar>
                            ))}
                          {project?.assigned && project.assigned.length > 3 && (
                            <div className="w-6 h-6 rounded-full bg-greige-200 border-2 border-white flex items-center justify-center">
                              <span className="text-xs text-ink-muted">+{project?.assigned.length - 3}</span>
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
      {project?.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-greige-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-greige-400" />
          </div>
          <h3 className="text-lg font-medium text-ink mb-2">No projects found</h3>
          <p className="text-ink-muted mb-4">{'Get started by creating your first project'}</p>
          <Button onClick={() => setShowNewProjectDialog(true)} className="bg-clay-600 hover:bg-clay-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New project
          </Button>
        </div>
      )}

      {/* New Project Dialog */}
      <NewProjectDialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog} />
    </div>
  );
}
