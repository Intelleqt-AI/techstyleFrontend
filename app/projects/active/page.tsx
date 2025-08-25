export const dynamic = 'force-dynamic';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, MoreHorizontal, Grid3X3, List, Settings } from 'lucide-react';
import { ProjectNavMain } from '@/components/project-nav-main';
import Link from 'next/link';

const activeProjects = [
  {
    id: 'proj-001',
    name: 'Luxury Penthouse Redesign',
    client: 'Smith Family',
    startDate: '25 Jul 25',
    dueDate: '15 Dec 25',
    tasks: { completed: 8, total: 12 },
    hours: 45,
    progress: 75,
    image: '/placeholder.svg?height=240&width=360&text=Luxury+Penthouse+Living+Room',
  },
  {
    id: 'proj-002',
    name: 'Modern Office Space',
    client: 'TechCorp Inc.',
    startDate: '25 Jul 25',
    dueDate: '24 Jul 25',
    tasks: { completed: 3, total: 8 },
    hours: 28,
    progress: 45,
    image: '/placeholder.svg?height=240&width=360&text=Modern+Office+Interior',
  },
  {
    id: 'proj-003',
    name: 'Boutique Hotel Lobby',
    client: 'Grandeur Hotels',
    startDate: '4 Aug 25',
    dueDate: '30 Sept 25',
    tasks: { completed: 9, total: 10 },
    hours: 62,
    progress: 90,
    image: '/placeholder.svg?height=240&width=360&text=Hotel+Lobby+Design',
  },
];

export default function ActiveProjectsPage() {
  return (
    <div className="flex-1 bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <ProjectNavMain activeTab="active" />

        {/* Toolbar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <Button variant="outline" size="sm" className="gap-2">
                <Grid3X3 className="w-4 h-4" />
                Grid
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <List className="w-4 h-4" />
                List
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            </div>

            <Button size="sm" className="gap-2 bg-gray-900 hover:bg-gray-800">
              <Plus className="w-4 h-4" />
              Add Project
            </Button>
          </div>
        </div>

        {/* Active Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {activeProjects.map(project => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-sm transition-all duration-200 cursor-pointer">
                {/* Project Image */}
                <div className="relative h-48 bg-gray-100">
                  <img src={project.image || '/placeholder.svg'} alt={project.name} className="w-full h-full object-cover" />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
                  </div>
                </div>

                {/* Project Content */}
                <div className="p-6">
                  {/* Header with title and menu */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 text-lg leading-tight">{project.name}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 p-0 text-gray-400 hover:text-gray-600 -mt-1 -mr-1"
                      onClick={e => e.preventDefault()}
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Client */}
                  <p className="text-sm text-gray-600 mb-4">{project.client}</p>

                  {/* Dates */}
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                    <span>Start: {project.startDate}</span>
                    <span>Due: {project.dueDate}</span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span>
                      Tasks: {project.tasks.completed}/{project.tasks.total}
                    </span>
                    <span>Hours: {project.hours}</span>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-gray-900">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
