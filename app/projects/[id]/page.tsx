"use client";
import { useState, useEffect } from "react";
import { ProjectNav } from "@/components/project-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Edit,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  Package,
  TrendingUp,
  FileText,
  ArrowRight,
} from "lucide-react";
import useProjects from "@/supabase/hook/useProject";
import { useQuery } from "@tanstack/react-query";
import { getTask } from "@/supabase/API";

const kpiStats = [
  {
    title: "Budget Utilization",
    value: "£87,500",
    subtitle: "70% of £125,000 used",
    icon: DollarSign,
    trend: "On track",
    color: "text-olive-700",
  },
  {
    title: "Profit Margin",
    value: "23%",
    subtitle: "£28,750 projected",
    icon: TrendingUp,
    trend: "+2% vs estimate",
    color: "text-olive-700",
  },
  {
    title: "Tasks Complete",
    value: "24/36",
    subtitle: "67% completion",
    icon: CheckCircle,
    trend: "3 due today",
    color: "text-ochre-700",
  },
  {
    title: "POs Delayed",
    value: "5",
    subtitle: "2 need approval",
    icon: AlertTriangle,
    trend: "Action required",
    color: "text-terracotta-600",
  },
];

const timelinePhases = [
  { name: "Discovery", date: "Jan 15", completed: true },
  { name: "Concept Design", date: "Feb 1", completed: true },
  {
    name: "Design Development",
    date: "Feb 15",
    completed: false,
    current: true,
  },
  { name: "Technical Drawings", date: "Mar 1", completed: false },
  { name: "Procurement", date: "Mar 15", completed: false },
  { name: "Site / Implementation", date: "Apr 1", completed: false },
];

const blockers = [
  {
    id: 1,
    title: "Marble tiles delivery delayed",
    assignee: "Sarah Wilson",
    priority: "high",
    daysBlocked: 3,
    avatar: "SW",
  },
  {
    id: 2,
    title: "Electrical permit pending",
    assignee: "Mike Chen",
    priority: "medium",
    daysBlocked: 1,
    avatar: "MC",
  },
];

const recentActivity = [
  {
    id: 1,
    type: "message",
    user: "Jane Designer",
    avatar: "JD",
    action: "shared kitchen layout revisions",
    time: "2 hours ago",
  },
  {
    id: 2,
    type: "file",
    user: "Tom Wilson",
    avatar: "TW",
    action: "uploaded electrical schematics",
    time: "4 hours ago",
  },
  {
    id: 3,
    type: "task",
    user: "Sarah Johnson",
    avatar: "SJ",
    action: "completed material selection",
    time: "6 hours ago",
  },
];

const recentFiles = [
  {
    id: 1,
    name: "Kitchen_Layout_v3.pdf",
    type: "PDF",
    size: "2.4 MB",
    uploadedBy: "Jane Designer",
    uploadedAt: "2 hours ago",
  },
  {
    id: 2,
    name: "Electrical_Schematics.dwg",
    type: "DWG",
    size: "1.8 MB",
    uploadedBy: "Tom Wilson",
    uploadedAt: "4 hours ago",
  },
  {
    id: 3,
    name: "Material_Samples.jpg",
    type: "JPG",
    size: "3.2 MB",
    uploadedBy: "Sarah Johnson",
    uploadedAt: "6 hours ago",
  },
];

const formatTodayDate = () => {
  const date = new Date();
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
};

const calculateProjectProgress = (
  projectId: string,
  tasks: Task[] | undefined,
  isLoading: boolean
): number => {
  if (isLoading || !tasks) return 0;

  const projectTasks = tasks.filter((item) => item.projectID === projectId);
  if (projectTasks.length === 0) return 0;

  const completedTasks = projectTasks.filter((task) => task.status === "done");
  const progress = Math.floor(
    (completedTasks.length / projectTasks.length) * 100
  );

  return progress;
};

// Helper functions
const getCompletedTasks = (tasks, projectId) => {
  return (
    tasks?.filter(
      (task) => task.projectID === projectId && task.status === "done"
    ).length || 0
  );
};

const getInProgressTasks = (tasks, projectId) => {
  return (
    tasks?.filter(
      (task) =>
        task.projectID === projectId &&
        (task.status === "in-progress" || task.status === "in-review")
    ).length || 0
  );
};

const getRemainingTasks = (tasks, projectId) => {
  return (
    tasks?.filter(
      (task) =>
        task.projectID === projectId &&
        (task.status === "todo" || task.status === "" || !task.status)
    ).length || 0
  );
};

export default function ProjectOverviewPage({
  params,
}: {
  params: { id: string };
}) {
  // const { id } = router.query; // Get ID from URL params
  const [title, setTitle] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const { data: project, isLoading: projectLoading } = useProjects();

  const {
    data: taskData,
    isLoading: taskLoading,
    error: taskError,
    refetch: taskRefetch,
  } = useQuery({
    queryKey: ["task"],
    queryFn: getTask,
  });

  useEffect(() => {
    if (projectLoading || !params?.id) return;

    const foundProject = project?.find((data) => data.id == params?.id);
    setSelectedProject(foundProject);
  }, [project, projectLoading]);

  useEffect(() => {
    console.log(selectedProject);
  }, [selectedProject]);

  return (
    <div className="flex-1 bg-neutral-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <ProjectNav projectId={params.id} />

        {/* Hero Header */}
        <Card className="border border-greige-500/30 shadow-sm overflow-hidden">
          <div className="relative h-48">
            <img
              src={selectedProject?.image || "/images/luxury-penthouse.png"}
              alt={selectedProject?.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-start justify-between">
                <div className="text-white drop-shadow-md">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold">
                      {selectedProject?.name}
                    </h1>
                    <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-sage-300/30 text-white/90 backdrop-blur-sm border border-white/20">
                      On Track
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>Amanda</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {selectedProject?.location ||
                          `${selectedProject?.city}, ${selectedProject?.country}`}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* KPI Rail */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpiStats.map((stat) => (
            <Card
              key={stat.title}
              className="border border-greige-500/30 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <stat.icon className="w-4 h-4 text-slatex-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-700">
                      {stat.title}
                    </p>
                    <p className="text-lg font-semibold text-neutral-900">
                      {stat.value}
                    </p>
                    <p className="text-xs text-neutral-600">{stat.subtitle}</p>
                    <p className={`text-xs mt-1 ${stat.color}`}>{stat.trend}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div> */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Budget Utilization Card */}
          <Card className="border border-greige-500/30 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <DollarSign className="w-4 h-4 text-slatex-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-700">
                    Budget Utilization
                  </p>
                  <p className="text-lg font-semibold text-neutral-900">
                    {selectedProject?.currency?.symbol || "£"}
                    {selectedProject?.budget || 0}
                  </p>
                  <p className="text-xs text-neutral-600">
                    {(() => {
                      // Calculate utilization based on payment schedule
                      let utilizedPercentage = 0;
                      let utilizedAmount = 0;

                      if (selectedProject?.paymentSchedule === "50-50") {
                        utilizedPercentage = 50;
                        utilizedAmount = (selectedProject?.budget || 0) * 0.5;
                      } else if (
                        selectedProject?.paymentSchedule === "33-33-33"
                      ) {
                        utilizedPercentage = 33;
                        utilizedAmount = (selectedProject?.budget || 0) * 0.33;
                      } else if (
                        selectedProject?.paymentSchedule === "25-25-25-25"
                      ) {
                        utilizedPercentage = 25;
                        utilizedAmount = (selectedProject?.budget || 0) * 0.25;
                      } else {
                        // Default to 0% if payment schedule is unknown
                        utilizedPercentage = 0;
                        utilizedAmount = 0;
                      }

                      return `${utilizedPercentage}% of ${
                        selectedProject?.currency?.symbol || "£"
                      }${selectedProject?.budget || 0} utilized`;
                    })()}
                  </p>
                  <p className="text-xs mt-1 text-olive-700">
                    {selectedProject?.paymentSchedule
                      ? `Schedule: ${selectedProject.paymentSchedule}`
                      : "No schedule set"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profit Margin Card */}
          <Card className="border border-greige-500/30 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4 text-slatex-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-700">
                    Profit Margin
                  </p>
                  <p className="text-lg font-semibold text-neutral-900">23%</p>
                  <p className="text-xs text-neutral-600">£28,750 projected</p>
                  <p className="text-xs mt-1 text-olive-700">+2% vs estimate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tasks Complete Card */}
          <Card className="border border-greige-500/30 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-slatex-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-700">
                    Tasks Complete
                  </p>
                  <p className="text-lg font-semibold text-neutral-900">
                    {taskData?.data?.filter(
                      (task) =>
                        task.projectID === selectedProject?.id &&
                        task.status === "done"
                    ).length || 0}
                    /
                    {taskData?.data?.filter(
                      (task) => task.projectID === selectedProject?.id
                    ).length || 0}
                  </p>
                  <p className="text-xs text-neutral-600">
                    {Math.round(
                      ((taskData?.data?.filter(
                        (task) =>
                          task.projectID === selectedProject?.id &&
                          task.status === "done"
                      ).length || 0) /
                        (taskData?.data?.filter(
                          (task) => task.projectID === selectedProject?.id
                        ).length || 1)) *
                        100
                    )}
                    % completion
                  </p>
                  <p className="text-xs mt-1 text-ochre-700">
                    {taskData?.data?.filter(
                      (task) =>
                        task.projectID === selectedProject?.id &&
                        task.dueDate ===
                          new Date().toISOString().split("T")[0] &&
                        task.status !== "done"
                    ).length || 0}{" "}
                    due today
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* POs Delayed Card */}
          <Card className="border border-greige-500/30 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-slatex-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-700">
                    POs Delayed
                  </p>
                  <p className="text-lg font-semibold text-neutral-900">5</p>
                  <p className="text-xs text-neutral-600">2 need approval</p>
                  <p className="text-xs mt-1 text-terracotta-600">
                    Action required
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline Stripe */}
        <Card className="border border-greige-500/30 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-neutral-900">
                Project Timeline
              </h3>
              <div className="flex items-center gap-2 text-sm text-neutral-700">
                <Calendar className="w-4 h-4" />
                <span>Today: {formatTodayDate()}</span>
              </div>
            </div>
            <div className="relative">
              <div className="flex items-center justify-between">
                {timelinePhases.map((phase, index) => (
                  <div
                    key={phase.name}
                    className="flex flex-col items-center relative">
                    <div
                      className={`w-3 h-3 rounded-full border-2 ${
                        phase.completed
                          ? "bg-sage-500 border-sage-500"
                          : phase.current
                          ? "bg-clay-500 border-clay-500"
                          : "bg-greige-500 border-greige-500"
                      }`}
                    />
                    <div className="mt-2 text-center">
                      <div
                        className={`text-xs font-medium ${
                          phase.current ? "text-clay-600" : "text-neutral-700"
                        }`}>
                        {phase.name}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {phase.date}
                      </div>
                    </div>
                    {index > 0 && (
                      <div
                        className={`absolute top-1.5 right-6 w-20 h-0.5 ${
                          timelinePhases[index - 1].completed
                            ? "bg-sage-500"
                            : "bg-greige-500"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Procurement Radar */}
        <Card className="border border-greige-500/30 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-slatex-600" />
                <h3 className="text-sm font-medium text-neutral-900">
                  Procurement Status
                </h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-greige-500/30 bg-transparent">
                <ArrowRight className="w-4 h-4 mr-2" />
                Open Procurement
              </Button>
            </div>
            <div className="bg-terracotta-600/10 border border-terracotta-600/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-terracotta-600" />
                <span className="text-sm font-medium text-terracotta-600">
                  Action Required
                </span>
              </div>
              <p className="text-sm text-terracotta-600">
                <strong>5 items overdue delivery</strong> • 2 POs need approval
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Task Progress & Blockers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border border-greige-500/30 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-neutral-900">
                  Task Progress
                </h3>
                <span className="text-sm text-neutral-700">
                  {calculateProjectProgress(
                    selectedProject?.id,
                    taskData?.data,
                    taskLoading
                  )}
                  % Complete
                </span>
              </div>

              <Progress
                value={calculateProjectProgress(
                  selectedProject?.id,
                  taskData?.data,
                  taskLoading
                )}
                className="[&>div]:bg-clay-500 mb-4"
              />

              {taskData?.data && (
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-neutral-900">
                      {getCompletedTasks(taskData.data, selectedProject?.id)}
                    </div>
                    <div className="text-xs text-neutral-600">Completed</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-neutral-900">
                      {getInProgressTasks(taskData.data, selectedProject?.id)}
                    </div>
                    <div className="text-xs text-neutral-600">In Progress</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-neutral-900">
                      {getRemainingTasks(taskData.data, selectedProject?.id)}
                    </div>
                    <div className="text-xs text-neutral-600">Remaining</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border border-greige-500/30 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-neutral-900">
                  Active Blockers
                </h3>
                <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-terracotta-600/10 text-terracotta-600 border border-terracotta-600/30">
                  {blockers.length} Active
                </span>
              </div>
              <div className="space-y-3">
                {blockers.map((blocker) => (
                  <div
                    key={blocker.id}
                    className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="bg-neutral-900 text-white text-xs font-semibold">
                          {blocker.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium text-neutral-900">
                          {blocker.title}
                        </div>
                        <div className="text-xs text-neutral-600">
                          {blocker.assignee} • {blocker.daysBlocked} days
                          blocked
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
                          blocker.priority === "high"
                            ? "bg-terracotta-600/10 text-terracotta-600 border border-terracotta-600/30"
                            : "bg-ochre-300/20 text-ochre-700 border border-ochre-700/20"
                        }`}>
                        {blocker.priority}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs border-greige-500/30 bg-transparent">
                        Unblock
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity & Files */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border border-greige-500/30 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-neutral-900">
                  Recent Activity
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-clay-600 hover:text-clay-700">
                  View All
                </Button>
              </div>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-neutral-900 text-white text-xs font-semibold">
                        {activity.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-neutral-900">
                        <span className="font-medium">{activity.user}</span>{" "}
                        {activity.action}
                      </p>
                      <p className="text-xs text-neutral-600">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-greige-500/30 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-neutral-900">
                  Latest Files
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-clay-600 hover:text-clay-700">
                  <ArrowRight className="w-4 h-4 mr-1" />
                  Open Docs
                </Button>
              </div>
              <div className="space-y-3">
                {recentFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-slatex-600" />
                      <div>
                        <div className="text-sm font-medium text-neutral-900">
                          {file.name}
                        </div>
                        <div className="text-xs text-neutral-600">
                          {file.uploadedBy} • {file.uploadedAt}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-neutral-600">{file.size}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
