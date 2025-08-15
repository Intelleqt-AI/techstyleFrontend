"use client"

import { ProjectNav } from "@/components/project-nav"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Plus,
  Filter,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  MoreHorizontal,
  Calendar,
  FileText,
  MessageSquare,
  Upload,
  Package,
  Wrench,
  Zap,
  Hammer,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"

const kpiData = [
  {
    title: "Tasks Due",
    value: "8",
    subtitle: "This week",
    icon: Clock,
    alert: false,
    deepLink: `/projects/proj-001/tasks?trade=plumbing`,
  },
  {
    title: "Items to Install",
    value: "12",
    subtitle: "Ready for install",
    icon: Package,
    alert: false,
    deepLink: null,
  },
  {
    title: "RFIs Awaiting",
    value: "4",
    subtitle: "Pending response",
    icon: MessageSquare,
    alert: true,
    deepLink: null,
  },
  {
    title: "Hours Scheduled",
    value: "32",
    subtitle: "This week",
    icon: Calendar,
    alert: false,
    deepLink: `/projects/proj-001/calendar?trade=plumbing`,
  },
]

const weekDays = [
  { day: "Mon", date: "11", hasEvents: true },
  { day: "Tue", date: "12", hasEvents: false },
  { day: "Wed", date: "13", hasEvents: true },
  { day: "Thu", date: "14", hasEvents: false },
  { day: "Fri", date: "15", hasEvents: true },
  { day: "Sat", date: "16", hasEvents: false },
  { day: "Sun", date: "17", hasEvents: false },
]

const recentActivity = [
  {
    id: 1,
    icon: CheckCircle,
    text: "Plumber marked 2 items Installed",
    timestamp: "2 hours ago",
    unread: false,
  },
  {
    id: 2,
    icon: MessageSquare,
    text: "RFI #12 answered by PM",
    timestamp: "4 hours ago",
    unread: true,
    flag: true,
  },
  {
    id: 3,
    icon: AlertTriangle,
    text: "Delivery ETA changed",
    timestamp: "6 hours ago",
    unread: true,
    warning: true,
  },
  {
    id: 4,
    icon: Upload,
    text: "Technical drawing uploaded",
    timestamp: "1 day ago",
    unread: false,
  },
  {
    id: 5,
    icon: Users,
    text: "Electrician assigned to Task #45",
    timestamp: "1 day ago",
    unread: false,
  },
  {
    id: 6,
    icon: Calendar,
    text: "Site visit scheduled for Friday",
    timestamp: "2 days ago",
    unread: false,
  },
]

// Thumbnails now point to real files in /public/images/products or to library assets
const procurementItems = [
  {
    id: 1,
    name: "Italian Marble Tiles",
    room: "Master Bathroom",
    status: "In-Transit",
    eta: "2025-08-20",
    thumbnail: "/images/products/woven-dining-chair.png",
    trade: "Plumbing",
  },
  {
    id: 2,
    name: "Custom Kitchen Cabinets",
    room: "Kitchen",
    status: "Ordered",
    eta: "2025-08-25",
    thumbnail: "/images/products/studded-dresser.png",
    trade: "Joinery",
  },
  {
    id: 3,
    name: "Designer Light Fixtures",
    room: "Living Room",
    status: "On-Site",
    eta: "2025-08-18",
    thumbnail: "/images/products/pleated-table-lamp.png",
    trade: "Electrical",
  },
  {
    id: 4,
    name: "Hardwood Flooring",
    room: "Bedroom",
    status: "Installed",
    eta: "2025-08-22",
    thumbnail: "/images/products/striped-armchair.png",
    trade: "General",
  },
]

const rfiThreads = [
  {
    id: 1,
    title: "Electrical outlet placement",
    status: "Open",
    lastMessage: "Need clarification on kitchen island outlets",
    timestamp: "2 hours ago",
    unread: true,
    trade: "Electrical",
  },
  {
    id: 2,
    title: "Plumbing rough-in dimensions",
    status: "Answered",
    lastMessage: "Dimensions confirmed, proceeding with install",
    timestamp: "1 day ago",
    unread: false,
    trade: "Plumbing",
  },
  {
    id: 3,
    title: "Material substitution approval",
    status: "Closed",
    lastMessage: "Alternative material approved by client",
    timestamp: "3 days ago",
    unread: false,
    trade: "General",
  },
]

const quickActions = [
  {
    title: "View All Tasks",
    tooltip: "Open global tasks filtered by trade",
    icon: CheckCircle,
    href: `/projects/proj-001/tasks?trade=plumbing`,
    external: true,
  },
  {
    title: "Browse Documents",
    tooltip: "Access trade-specific documents",
    icon: FileText,
    href: `/projects/proj-001/docs?trade=plumbing`,
    external: true,
  },
  {
    title: "Assign Task",
    tooltip: "Create new task for this trade",
    icon: Plus,
    href: null,
    external: false,
  },
  {
    title: "Schedule Visit",
    tooltip: "Book site visit or meeting",
    icon: Calendar,
    href: `/projects/proj-001/calendar?trade=plumbing`,
    external: true,
  },
]

export default function ProjectContractorsPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex-1 bg-neutral-50">
      <div className="max-w-7xl mx-auto space-y-6 p-6">
        <ProjectNav projectId={params.id} />

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="procurement">Procurement</TabsTrigger>
            <TabsTrigger value="rfis">RFIs</TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="space-y-6">
            {/* Trade Selector */}
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-neutral-900">Trade Overview</h2>
                <Select defaultValue="plumbing">
                  <SelectTrigger className="w-48 h-10">
                    <SelectValue placeholder="Select trade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        All Trades
                      </div>
                    </SelectItem>
                    <SelectItem value="plumbing">
                      <div className="flex items-center gap-2">
                        <Wrench className="w-4 h-4" />
                        Plumbing
                      </div>
                    </SelectItem>
                    <SelectItem value="electrical">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        Electrical
                      </div>
                    </SelectItem>
                    <SelectItem value="joinery">
                      <div className="flex items-center gap-2">
                        <Hammer className="w-4 h-4" />
                        Joinery
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="bg-umber-900 text-white hover:bg-umber-800 h-10 px-4">
                <Plus className="w-4 h-4 mr-2" />
                Invite Contractor
              </Button>
            </div>

            {/* KPI Strip */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {kpiData.map((kpi) => (
                <div
                  key={kpi.title}
                  className={`bg-white border rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow ${
                    kpi.alert ? "border-terracotta-600/30" : "border-greige-500/30"
                  }`}
                >
                  {kpi.deepLink ? (
                    <Link href={kpi.deepLink} className="block p-4">
                      <div className="flex items-center gap-3">
                        <kpi.icon className={`w-4 h-4 ${kpi.alert ? "text-terracotta-600" : "text-slatex-600"}`} />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-neutral-700">{kpi.title}</div>
                          <div
                            className={`text-lg font-semibold ${kpi.alert ? "text-terracotta-700" : "text-neutral-900"}`}
                          >
                            {kpi.value}
                          </div>
                          <div className="text-xs text-neutral-600">{kpi.subtitle}</div>
                        </div>
                        <ExternalLink className="w-3 h-3 text-neutral-400" />
                      </div>
                    </Link>
                  ) : (
                    <div className="p-4">
                      <div className="flex items-center gap-3">
                        <kpi.icon className={`w-4 h-4 ${kpi.alert ? "text-terracotta-600" : "text-slatex-600"}`} />
                        <div>
                          <div className="text-sm font-medium text-neutral-700">{kpi.title}</div>
                          <div
                            className={`text-lg font-semibold ${kpi.alert ? "text-terracotta-700" : "text-neutral-900"}`}
                          >
                            {kpi.value}
                          </div>
                          <div className="text-xs text-neutral-600">{kpi.subtitle}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 7-Day Stripe */}
            <div className="bg-white border border-greige-500/30 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-neutral-900">This Week</h3>
                <Link href={`/projects/${params.id}/calendar?trade=plumbing`}>
                  <Button size="sm" className="bg-clay-600 text-white hover:bg-clay-700">
                    <Calendar className="w-4 h-4 mr-2" />
                    View Calendar
                  </Button>
                </Link>
              </div>
              <div className="flex gap-2">
                {weekDays.map((day) => (
                  <div
                    key={day.day}
                    className={`flex-1 text-center p-3 rounded-lg border cursor-pointer transition-colors ${
                      day.hasEvents
                        ? "bg-ochre-50 border-ochre-200"
                        : "bg-neutral-50 border-greige-500/30 hover:bg-neutral-100"
                    }`}
                  >
                    <div className="text-xs font-medium text-neutral-600">{day.day}</div>
                    <div className="text-lg font-semibold text-neutral-900">{day.date}</div>
                    {day.hasEvents && <div className="w-2 h-2 bg-clay-600 rounded-full mx-auto mt-1"></div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 bg-white border border-greige-500/30 rounded-lg p-4 shadow-sm">
                <h3 className="font-medium text-neutral-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className={`flex items-start gap-3 p-2 rounded-lg ${activity.unread ? "bg-ochre-50" : ""}`}
                    >
                      <activity.icon
                        className={`w-4 h-4 mt-0.5 ${
                          activity.warning ? "text-terracotta-600" : activity.flag ? "text-clay-600" : "text-slatex-600"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-neutral-900">{activity.text}</p>
                        <p className="text-xs text-neutral-600">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-greige-500/30 rounded-lg p-4 shadow-sm">
                <h3 className="font-medium text-neutral-900 mb-4">Quick Actions</h3>
                <TooltipProvider>
                  <div className="space-y-2">
                    {quickActions.map((action) => (
                      <Tooltip key={action.title}>
                        <TooltipTrigger asChild>
                          <div className="w-full">
                            {action.href ? (
                              <Link href={action.href} className="block">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  className="w-full justify-start h-12 bg-neutral-50 hover:bg-neutral-100 border-greige-500/30"
                                >
                                  <action.icon className="w-4 h-4 mr-3 flex-shrink-0 text-slatex-600" />
                                  <span className="text-sm font-medium truncate">{action.title}</span>
                                  {action.external && (
                                    <ExternalLink className="w-3 h-3 text-neutral-400 ml-auto flex-shrink-0" />
                                  )}
                                </Button>
                              </Link>
                            ) : (
                              <Button
                                variant="secondary"
                                size="sm"
                                className="w-full justify-start h-12 bg-neutral-50 hover:bg-neutral-100 border-greige-500/30"
                              >
                                <action.icon className="w-4 h-4 mr-3 flex-shrink-0 text-slatex-600" />
                                <span className="text-sm font-medium truncate">{action.title}</span>
                              </Button>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="max-w-xs">
                          <p className="text-xs">{action.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </TooltipProvider>
              </div>
            </div>
          </TabsContent>

          {/* PROCUREMENT TAB — earthy palette and future ETAs */}
          <TabsContent value="procurement" className="space-y-6">
            <div className="flex justify-between items-center py-4">
              <h2 className="text-lg font-semibold text-neutral-900">Procurement Items</h2>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="h-10 bg-transparent">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter by Trade
                </Button>
                <Button size="sm" className="bg-umber-900 text-white hover:bg-umber-800 h-10">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left p-4 font-medium text-gray-600" style={{ width: "240px" }}>
                        Item
                      </th>
                      <th className="text-left p-4 font-medium text-gray-600" style={{ width: "140px" }}>
                        Room
                      </th>
                      <th className="text-left p-4 font-medium text-gray-600" style={{ width: "100px" }}>
                        Trade
                      </th>
                      <th className="text-left p-4 font-medium text-gray-600" style={{ width: "120px" }}>
                        Status
                      </th>
                      <th className="text-left p-4 font-medium text-gray-600" style={{ width: "160px" }}>
                        ETA
                      </th>
                      <th className="text-left p-4 font-medium text-gray-600" style={{ width: "80px" }}>
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {procurementItems.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.thumbnail || "/placeholder.svg"}
                              alt={item.name}
                              className="w-10 h-10 rounded object-cover border border-gray-200 bg-white"
                            />
                            <span className="font-medium text-gray-900">{item.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-600">{item.room}</td>
                        <td className="p-4">
                          <Badge className="bg-greige-100 text-gray-700 border-gray-200 text-xs">{item.trade}</Badge>
                        </td>
                        <td className="p-4">
                          <Badge
                            className={`text-xs ${
                              item.status === "installed"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : item.status === "on-site"
                                  ? "bg-ochre-300/20 text-ochre-700 border-ochre-700/20"
                                  : item.status === "in-transit"
                                    ? "bg-clay-600/10 text-clay-700 border-clay-600/30"
                                    : "bg-gray-50 text-gray-700 border-gray-200"
                            } border`}
                          >
                            {item.status}
                          </Badge>
                        </td>
                        <td className="p-4 text-gray-600">{item.eta}</td>
                        <td className="p-4">
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* RFIs TAB — unified pills and button styles */}
          <TabsContent value="rfis" className="space-y-6">
            <div className="flex justify-between items-center py-4">
              <h2 className="text-lg font-semibold text-neutral-900">RFIs</h2>
              <Button size="sm" className="bg-umber-900 text-white hover:bg-umber-800 h-10">
                <Plus className="w-4 h-4 mr-2" />
                New RFI
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-medium text-gray-900">RFI Threads</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {rfiThreads.map((thread) => (
                    <div
                      key={thread.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 ${thread.unread ? "bg-clay-50" : ""}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">{thread.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-greige-100 text-gray-700 border-gray-200 text-xs">{thread.trade}</Badge>
                          <Badge
                            className={`text-xs border ${
                              thread.status === "Open"
                                ? "bg-terracotta-600/10 text-terracotta-600 border-terracotta-600/30"
                                : thread.status === "Answered"
                                  ? "bg-clay-600/10 text-clay-700 border-clay-600/30"
                                  : "bg-sage-600/10 text-sage-700 border-sage-600/30"
                            }`}
                          >
                            {thread.status}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{thread.lastMessage}</p>
                      <p className="text-xs text-gray-500">{thread.timestamp}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-medium text-gray-900">Conversation</h3>
                </div>
                <div className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Select an RFI thread to view the conversation</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
