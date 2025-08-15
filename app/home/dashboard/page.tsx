'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Mic, Calendar, Clock, AlertTriangle, DollarSign, TrendingUp, TrendingDown, ArrowUp, Users } from 'lucide-react';
import { HomeNav } from '@/components/home-nav';
import useFetch from '@/hooks/useFetch';

// Mock user data with role-based permissions
const mockUser = {
  firstName: 'Jane',
  role: 'studio_owner', // "staff" | "studio_owner" | "finance_admin"
  permissions: ['finance.read', 'studio.view'],
};

// Scope toggle for owners/admins
function ScopeToggle({ scope, onScopeChange, canSeeStudio }) {
  if (!canSeeStudio) return null;

  return (
    <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-1">
      <button
        onClick={() => onScopeChange('my')}
        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
          scope === 'my' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-700 hover:text-neutral-900'
        }`}
      >
        My View
      </button>
      <button
        onClick={() => onScopeChange('studio')}
        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
          scope === 'studio' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-700 hover:text-neutral-900'
        }`}
      >
        Studio View
      </button>
    </div>
  );
}

// Dashboard card components with role-based data
function TodaysMeetingsCard({ scope, userRole }) {
  const myMeetings = [
    { id: 1, title: 'Client Review - Penthouse', time: '10:00 AM', client: 'Smith Family', attendee: true },
    { id: 2, title: 'Material Selection', time: '2:30 PM', client: 'TechCorp', attendee: true },
    { id: 3, title: 'Team Standup', time: '4:00 PM', client: 'Internal', attendee: true },
  ];

  const studioMeetings = [
    ...myMeetings,
    { id: 4, title: 'Budget Review', time: '11:30 AM', client: 'Grandeur Hotels', attendee: false },
    { id: 5, title: 'Contractor Check-in', time: '3:15 PM', client: 'Modern Office', attendee: false },
  ];

  const meetings = scope === 'studio' ? studioMeetings : myMeetings;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-slatex-600" />
        <h3 className="font-semibold text-neutral-900">Today's Meetings</h3>
      </div>
      <div className="space-y-3 flex-1">
        {meetings.slice(0, 3).map(meeting => (
          <div key={meeting.id} className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${meeting.attendee ? 'bg-sage-500' : 'bg-greige-500'}`}></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 truncate">{meeting.title}</p>
              <p className="text-xs text-neutral-600">
                {meeting.time} • {meeting.client}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OverdueTasksCard({ scope, userRole }) {
  const myTasks = [
    { id: 1, title: 'Review fabric samples', project: 'Luxury Penthouse', assignee: 'me' },
    { id: 2, title: 'Client presentation prep', project: 'Modern Office', assignee: 'me' },
  ];

  const studioTasks = [
    ...myTasks,
    { id: 3, title: 'Budget approval request', project: 'Boutique Hotel', assignee: 'Mike Johnson' },
    { id: 4, title: 'Contract review', project: 'Retail Space', assignee: 'Sarah Wilson' },
  ];

  const tasks = scope === 'studio' ? studioTasks : myTasks;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-terracotta-600" />
        <h3 className="font-semibold text-neutral-900">Overdue Tasks</h3>
        <Badge className="bg-terracotta-600/10 text-terracotta-600 border border-terracotta-600/30 text-xs">{tasks.length}</Badge>
      </div>
      <div className="space-y-3 flex-1">
        {tasks.slice(0, 3).map(task => (
          <div key={task.id} className="flex items-center gap-3">
            <div className="w-2 h-2 bg-terracotta-600 rounded-full flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 truncate">{task.title}</p>
              <p className="text-xs text-neutral-600">
                {task.project} {scope === 'studio' && task.assignee !== 'me' && `• ${task.assignee}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FinancialKPIsCard({ scope, userRole }) {
  const myKPIs = [
    { label: 'My Budget Util', value: '87%', trend: 'up', change: '+5%' },
    { label: 'Hours This Week', value: '32.5h', trend: 'up', change: '+2h' },
    { label: 'Projects Active', value: '4', trend: 'neutral', change: '0' },
  ];

  const studioKPIs = [
    { label: 'Studio Profit', value: '£45.2k', trend: 'up', change: '+12%' },
    { label: 'Utilisation', value: '89%', trend: 'up', change: '+3%' },
    { label: 'Cash Flow', value: '£23.8k', trend: 'down', change: '-8%' },
  ];

  const kpis = scope === 'studio' ? studioKPIs : myKPIs;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="w-5 h-5 text-slatex-600" />
        <h3 className="font-semibold text-neutral-900">{scope === 'studio' ? 'Studio KPIs' : 'My KPIs'}</h3>
      </div>
      <div className="space-y-4 flex-1">
        {kpis.map((kpi, index) => (
          <div key={index} className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-neutral-900">{kpi.value}</p>
              <p className="text-xs text-neutral-600">{kpi.label}</p>
            </div>
            <div className="flex items-center gap-1">
              {kpi.trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-olive-700" />
              ) : kpi.trend === 'down' ? (
                <TrendingDown className="w-4 h-4 text-terracotta-600" />
              ) : (
                <div className="w-4 h-4" />
              )}
              <span
                className={`text-xs font-medium ${
                  kpi.trend === 'up' ? 'text-olive-700' : kpi.trend === 'down' ? 'text-terracotta-600' : 'text-neutral-500'
                }`}
              >
                {kpi.change}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimeTrackedCard({ scope, userRole }) {
  const myWeekData = [
    { day: 'Mon', hours: 8.5 },
    { day: 'Tue', hours: 7.2 },
    { day: 'Wed', hours: 9.1 },
    { day: 'Thu', hours: 6.8 },
    { day: 'Fri', hours: 8.0 },
  ];

  const teamCapacity = [
    { name: 'Jane (You)', hours: 32.5, capacity: 40 },
    { name: 'Mike Johnson', hours: 38.0, capacity: 40 },
    { name: 'Sarah Wilson', hours: 35.5, capacity: 40 },
  ];

  if (scope === 'studio') {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-slatex-600" />
          <h3 className="font-semibold text-neutral-900">Team Capacity</h3>
        </div>
        <div className="space-y-3 flex-1">
          {teamCapacity.map(member => (
            <div key={member.name} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-900">{member.name}</span>
                <span className="text-neutral-600">
                  {member.hours}h / {member.capacity}h
                </span>
              </div>
              <Progress value={(member.hours / member.capacity) * 100} className="h-1 [&>div]:bg-olive-600" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const totalHours = Math.round(myWeekData.reduce((sum, day) => sum + day.hours, 0) * 10) / 10;

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-slatex-600" />
        <h3 className="font-semibold text-neutral-900">Time Tracked</h3>
      </div>
      <div className="space-y-4 flex-1">
        <div>
          <p className="text-xl font-semibold text-neutral-900">{totalHours}h</p>
          <p className="text-xs text-neutral-600">This week</p>
        </div>
        <div className="space-y-2">
          {myWeekData.map(day => (
            <div key={day.day} className="flex items-center justify-between">
              <span className="text-sm text-neutral-700">{day.day}</span>
              <div className="flex items-center gap-2 flex-1 ml-3">
                <Progress value={(day.hours / 10) * 100} className="h-1 flex-1 [&>div]:bg-slatex-700" />
                <span className="text-sm font-medium text-neutral-900 w-8 text-right">{day.hours}h</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function JumpBackInSection({ scope, userRole }) {
  const myProjects = [
    {
      id: 1,
      title: 'Luxury Penthouse - Living Room Design',
      status: 'In Progress',
      lastActivity: '2 hours ago',
      progress: 75,
    },
    { id: 2, title: 'Modern Office - Kitchen Concepts', status: 'Review', lastActivity: '1 day ago', progress: 60 },
    { id: 3, title: 'Boutique Hotel - Lobby Design', status: 'Planning', lastActivity: '3 days ago', progress: 25 },
  ];

  const studioProjects = [
    ...myProjects,
    { id: 4, title: 'Retail Space - Store Layout', status: 'In Progress', lastActivity: '4 hours ago', progress: 45 },
    { id: 5, title: 'Restaurant Design - Interior', status: 'Planning', lastActivity: '1 day ago', progress: 15 },
  ];

  const projects = scope === 'studio' ? studioProjects : myProjects;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-neutral-900">Jump Back In</h3>
      <div className="grid gap-3">
        {projects.slice(0, 4).map(project => (
          <div
            key={project.id}
            className="flex items-center gap-4 p-4 bg-white rounded-lg border border-greige-500/30 hover:shadow-sm transition-shadow cursor-pointer"
          >
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-neutral-900 truncate">{project.title}</h4>
              <div className="flex items-center gap-4 mt-1">
                <Badge className="text-xs bg-greige-100 text-ink border border-greige-500/30">{project.status}</Badge>
                <span className="text-xs text-neutral-600">{project.lastActivity}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium text-neutral-900">{project.progress}%</div>
                <Progress value={project.progress} className="w-16 h-1 mt-1 [&>div]:bg-clay-500" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useFetch('dashboard/summary/');

  const [prompt, setPrompt] = useState('');
  const [scope, setScope] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dashboard-scope') || 'my';
    }
    return 'my';
  });

  const canSeeStudio = mockUser.role === 'studio_owner' || mockUser.role === 'finance_admin';
  const canSeeFinance = mockUser.permissions.includes('finance.read');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboard-scope', scope);
    }
  }, [scope]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      console.log('Submitted prompt:', prompt);
      setPrompt('');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getSummary = () => {
    if (scope === 'studio') {
      return [
        { color: 'clay', text: '5 overdue tasks across 3 projects' },
        { color: 'sage', text: 'Team utilisation at 89%' },
        { color: 'olive', text: '£45k profit this month' },
      ];
    }
    return [
      { color: 'sage', text: '3 meetings today' },
      { color: 'clay', text: '2 overdue tasks' },
      { color: 'olive', text: 'Penthouse 75% complete' },
    ];
  };

  const quickActions = ['Schedule client call', 'Send invoice reminder', 'Update project status', 'Review proposals'];

  return (
    <div className="flex-1 bg-neutral-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <HomeNav />

        {/* Header */}
        <section className="flex items-center justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-6">
              <h1 className="text-2xl font-semibold text-neutral-900">
                {getGreeting()}, {mockUser.firstName} 👋
              </h1>
              <div className="text-sm text-neutral-600 font-medium">
                {new Date().toLocaleDateString('en-GB', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </div>
            </div>

            {/* Status indicators */}
            <div className="flex items-center gap-4">
              {getSummary().map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      item.color === 'clay'
                        ? 'bg-clay-500'
                        : item.color === 'sage'
                        ? 'bg-sage-500'
                        : item.color === 'olive'
                        ? 'bg-olive-600'
                        : 'bg-slatex-500'
                    }`}
                  ></div>
                  <span className="text-sm text-neutral-700">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <ScopeToggle scope={scope} onScopeChange={setScope} canSeeStudio={canSeeStudio} />
        </section>

        {/* Dashboard Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card className="p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow h-80">
            <TodaysMeetingsCard scope={scope} userRole={mockUser.role} />
          </Card>
          <Card className="p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow h-80">
            <OverdueTasksCard scope={scope} userRole={mockUser.role} />
          </Card>
          {canSeeFinance && (
            <Card className="p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow h-80">
              <FinancialKPIsCard scope={scope} userRole={mockUser.role} />
            </Card>
          )}
          <Card className="p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow h-80">
            <TimeTrackedCard scope={scope} userRole={mockUser.role} />
          </Card>
        </section>

        {/* Bottom Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Jump Back In - 2/3 width */}
          <div className="lg:col-span-2">
            <JumpBackInSection scope={scope} userRole={mockUser.role} />
          </div>

          {/* AI Prompt Section - 1/3 width */}
          <div className="space-y-4">
            <h3 className="font-semibold text-neutral-900">Quick Actions</h3>

            {/* AI Prompt Bar */}
            <form onSubmit={handleSubmit} className="relative">
              <div className="relative">
                <Mic className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slatex-500" />
                <Input
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="Ask: What needs my attention?"
                  className="pl-10 pr-10 py-3 rounded-lg border-greige-500/30 text-sm"
                />
                {prompt.trim() && (
                  <Button
                    type="submit"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-md w-6 h-6 p-0 bg-neutral-900 text-white hover:bg-neutral-800"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </form>

            {/* Quick Action Pills */}
            <div className="flex flex-wrap gap-2">
              {quickActions.slice(0, 4).map((action, index) => (
                <Badge
                  key={index}
                  className="cursor-pointer bg-greige-100 text-ink hover:bg-greige-300/60 transition-colors text-xs px-3 py-1 border border-greige-500/30"
                >
                  {action}
                </Badge>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
