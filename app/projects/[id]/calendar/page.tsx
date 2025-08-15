"use client"

import { ProjectNav } from "@/components/project-nav"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Slider } from "@/components/ui/slider"
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  ChevronLeft,
  ChevronRight,
  Package,
  AlertTriangle,
  MoreHorizontal,
  Printer,
  Download,
  ChevronDown,
  Globe,
} from "lucide-react"
import { useState } from "react"

const calendarStats = [
  { title: "Meetings This Week", value: "8", subtitle: "3 site visits", icon: Calendar },
  { title: "Team Hours", value: "156h", subtitle: "85% utilization", icon: Users },
  { title: "Site Visits", value: "12", subtitle: "This month", icon: MapPin },
  { title: "Deliveries", value: "4", subtitle: "2 at risk", icon: Package },
]

const weekDays = [
  { day: "Mon", date: "5", hasEvents: true },
  { day: "Tue", date: "6", hasEvents: false },
  { day: "Wed", date: "7", hasEvents: true },
  { day: "Thu", date: "8", hasEvents: false },
  { day: "Fri", date: "9", hasEvents: true },
  { day: "Sat", date: "10", hasEvents: false },
  { day: "Sun", date: "11", hasEvents: false },
]

const upcomingEvents = [
  {
    id: 1,
    title: "Client Presentation",
    time: "2:30 PM - 3:30 PM",
    date: "Today",
    type: "meeting",
    attendees: ["Jane Designer", "Client"],
    location: "Conference Room A",
    external: true,
  },
  {
    id: 2,
    title: "Site Visit - Kitchen Install",
    time: "10:00 AM - 12:00 PM",
    date: "Tomorrow",
    type: "site-visit",
    attendees: ["Mike Chen", "Installation Team"],
    location: "Luxury Penthouse",
    external: false,
  },
  {
    id: 3,
    title: "Furniture Delivery",
    time: "9:00 AM - 11:00 AM",
    date: "Feb 8",
    type: "delivery",
    attendees: ["Procurement Team"],
    location: "Luxury Penthouse",
    external: false,
    conflict: true,
  },
  {
    id: 4,
    title: "Team Standup",
    time: "9:30 AM - 10:00 AM",
    date: "Feb 9",
    type: "meeting",
    attendees: ["Design Team"],
    location: "Office",
    external: false,
  },
]

// timeline rows (same as before)
const timelineRows = [
  {
    id: "milestones",
    name: "Milestones",
    type: "category",
    collapsed: false,
    items: [
      {
        id: "m1",
        name: "Design Approval",
        start: "2024-02-05",
        end: "2024-02-05",
        progress: 100,
        type: "milestone",
        assignee: "Jane Designer",
      },
      {
        id: "m2",
        name: "Budget Sign-off",
        start: "2024-02-15",
        end: "2024-02-15",
        progress: 0,
        type: "milestone",
        assignee: "Project Manager",
      },
      {
        id: "m3",
        name: "Installation Complete",
        start: "2024-03-01",
        end: "2024-03-01",
        progress: 0,
        type: "milestone",
        assignee: "Installation Team",
      },
    ],
  },
  {
    id: "tasks",
    name: "Tasks",
    type: "category",
    collapsed: false,
    items: [
      {
        id: "t1",
        name: "Kitchen Design",
        start: "2024-02-01",
        end: "2024-02-10",
        progress: 80,
        type: "task",
        assignee: "Jane Designer",
        capacity: 8,
      },
      {
        id: "t2",
        name: "Lighting Plan",
        start: "2024-02-05",
        end: "2024-02-12",
        progress: 60,
        type: "task",
        assignee: "Mike Chen",
        capacity: 6,
      },
      {
        id: "t3",
        name: "Furniture Selection",
        start: "2024-02-08",
        end: "2024-02-20",
        progress: 30,
        type: "task",
        assignee: "Sarah Johnson",
        capacity: 4,
      },
      {
        id: "t4",
        name: "Material Sourcing",
        start: "2024-02-12",
        end: "2024-02-18",
        progress: 45,
        type: "task",
        assignee: "Mike Chen",
        capacity: 5,
      },
      {
        id: "t5",
        name: "Color Scheme Finalization",
        start: "2024-02-14",
        end: "2024-02-22",
        progress: 20,
        type: "task",
        assignee: "Jane Designer",
        capacity: 3,
      },
    ],
  },
  {
    id: "deliveries",
    name: "Deliveries",
    type: "category",
    collapsed: false,
    items: [
      {
        id: "d1",
        name: "Sofa Delivery",
        start: "2024-02-18",
        end: "2024-02-18",
        progress: 0,
        type: "delivery",
        conflict: true,
        assignee: "Logistics Team",
      },
      {
        id: "d2",
        name: "Lighting Fixtures",
        start: "2024-02-22",
        end: "2024-02-22",
        progress: 0,
        type: "delivery",
        assignee: "Procurement Team",
      },
      {
        id: "d3",
        name: "Kitchen Appliances",
        start: "2024-02-25",
        end: "2024-02-25",
        progress: 0,
        type: "delivery",
        assignee: "Installation Team",
      },
      {
        id: "d4",
        name: "Flooring Materials",
        start: "2024-02-20",
        end: "2024-02-20",
        progress: 0,
        type: "delivery",
        assignee: "Logistics Team",
      },
    ],
  },
  {
    id: "team",
    name: "Team Allocations",
    type: "category",
    collapsed: false,
    items: [
      {
        id: "a1",
        name: "Jane Designer",
        start: "2024-02-05",
        end: "2024-02-12",
        progress: 85,
        type: "allocation",
        utilization: "high",
        capacity: 40,
      },
      {
        id: "a2",
        name: "Mike Chen",
        start: "2024-02-08",
        end: "2024-02-15",
        progress: 70,
        type: "allocation",
        utilization: "medium",
        capacity: 32,
      },
      {
        id: "a3",
        name: "Sarah Johnson",
        start: "2024-02-10",
        end: "2024-02-18",
        progress: 60,
        type: "allocation",
        utilization: "low",
        capacity: 24,
      },
      {
        id: "a4",
        name: "Installation Team",
        start: "2024-02-20",
        end: "2024-03-01",
        progress: 30,
        type: "allocation",
        utilization: "medium",
        capacity: 28,
      },
    ],
  },
]

const generateTimelineGrid = (scale: "week" | "month" | "quarter") => {
  const today = new Date("2024-02-07")
  const grid = []
  const pushDay = (date: Date) =>
    grid.push({
      date: date.toISOString().split("T")[0],
      label: date.getDate().toString(),
      dayName: date.toLocaleDateString("en", { weekday: "short" }),
      isToday: date.toDateString() === today.toDateString(),
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
    })
  if (scale === "week") {
    for (let i = 0; i < 28; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() - 7 + i)
      pushDay(d)
    }
  } else if (scale === "month") {
    for (let i = 0; i < 56; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() - 14 + i)
      pushDay(d)
    }
  } else {
    for (let i = 0; i < 84; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() - 21 + i)
      pushDay(d)
    }
  }
  return grid
}

const getBarColor = (type: string) => {
  switch (type) {
    case "milestone":
      return "bg-gray-900"
    case "task":
      return "bg-blue-500"
    case "delivery":
      return "bg-transparent border-2 border-red-500"
    case "allocation":
      return "bg-gray-400 opacity-60"
    default:
      return "bg-gray-300"
  }
}

const getBarWidth = (start: string, end: string, dayWidth: number) => {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const duration = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
  return duration * dayWidth
}

const getBarPosition = (start: string, gridStart: string, dayWidth: number) => {
  const startDate = new Date(start)
  const gridStartDate = new Date(gridStart)
  const offset = Math.max(0, (startDate.getTime() - gridStartDate.getTime()) / (1000 * 60 * 60 * 24))
  return offset * dayWidth
}

export default function ProjectCalendarPage({ params }: { params: { id: string } }) {
  const [timelineScale, setTimelineScale] = useState<"week" | "month" | "quarter">("month")
  const [dayWidth, setDayWidth] = useState([32])
  const [hoveredBar, setHoveredBar] = useState<string | null>(null)
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())

  const timelineGrid = generateTimelineGrid(timelineScale)
  const gridStart = timelineGrid[0]?.date || "2024-02-01"

  const toggleSection = (sectionId: string) => {
    const next = new Set(collapsedSections)
    next.has(sectionId) ? next.delete(sectionId) : next.add(sectionId)
    setCollapsedSections(next)
  }

  return (
    <div className="flex-1 bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <ProjectNav projectId={params.id} />

        {/* Calendar Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {calendarStats.map((stat) => (
            <Card key={stat.title} className="border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <stat.icon className="w-4 h-4 text-gray-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.subtitle}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Calendar Tabs */}
        <Tabs defaultValue="agenda" className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="grid w-fit grid-cols-2">
              <TabsTrigger value="agenda">Agenda</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            <Button className="bg-gray-900 text-white hover:bg-gray-800">
              <Plus className="w-4 h-4 mr-2" />
              Schedule
            </Button>
          </div>

          <TabsContent value="agenda" className="space-y-6">
            {/* Week Picker */}
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">February 2024</h3>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((day, index) => (
                    <div
                      key={day.day}
                      className={`p-3 text-center rounded-lg border cursor-pointer transition-colors ${
                        index === 2
                          ? "bg-gray-900 text-white border-gray-900"
                          : "bg-white border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="text-xs font-medium">{day.day}</div>
                      <div className="text-lg font-semibold mt-1">{day.date}</div>
                      {day.events > 0 && <div className="text-xs mt-1 opacity-75">{day.events} events</div>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-medium text-gray-900 mb-4">Upcoming Events</h3>
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        {event.type === "delivery" && <Package className="w-4 h-4 text-gray-500" />}
                        {event.type === "meeting" && <Calendar className="w-4 h-4 text-gray-500" />}
                        {event.type === "site-visit" && <MapPin className="w-4 h-4 text-gray-500" />}
                        {event.external && <Globe className="w-3 h-3 text-blue-500 absolute ml-3 -mt-1" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">{event.title}</h4>
                          {event.conflict && <AlertTriangle className="w-4 h-4 text-red-500" />}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {event.time} • {event.date}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {event.attendees.join(", ")}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline" className="space-y-6">
            <Card className="relative border border-gray-200 shadow-sm">
              {/* Controls */}
              <div className="flex items-center justify-between px-4 py-3 border-b bg-white sticky top-0 z-20">
                <div className="flex items-center gap-4">
                  <TabsList className="grid w-fit grid-cols-3">
                    <TabsTrigger value="week">Week</TabsTrigger>
                    <TabsTrigger value="month">Month</TabsTrigger>
                    <TabsTrigger value="quarter">Quarter</TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500">Zoom</label>
                    <div className="w-24">
                      <Slider value={dayWidth} onValueChange={setDayWidth} min={16} max={64} step={4} />
                    </div>
                    <span className="text-xs text-gray-500 w-8">{dayWidth[0]}px</span>
                  </div>
                  <Button variant="outline" size="sm">
                    Fit Project
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="max-h-[70vh] overflow-y-auto">
                <div className="overflow-x-auto">
                  <div style={{ minWidth: `${Math.max(800, timelineGrid.length * dayWidth[0])}px` }}>
                    {/* Date header */}
                    <div className="sticky top-0 z-10 bg-white border-b">
                      <div className="flex">
                        <div className="w-48 p-3 bg-gray-50 border-r">
                          <div className="text-sm font-medium text-gray-900">Schedule</div>
                        </div>
                        <div className="flex-1 relative">
                          <div className="flex h-12 items-center">
                            {timelineGrid.map((day, index) => (
                              <div
                                key={index}
                                className="text-center text-xs border-r py-2"
                                style={{
                                  width: `${dayWidth[0]}px`,
                                  backgroundColor: day.isToday
                                    ? "rgba(255, 255, 0, 0.1)"
                                    : day.isWeekend
                                      ? "rgba(0, 0, 0, 0.025)"
                                      : "white",
                                }}
                              >
                                <div className="font-medium">{day.label}</div>
                                {timelineScale === "week" && <div>{day.dayName}</div>}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Rows */}
                    <div>
                      {timelineRows.map((row) => (
                        <div key={row.id}>
                          <div className="flex border-b">
                            <div className="w-48 p-3 bg-gray-50 border-r">
                              <button
                                onClick={() => toggleSection(row.id)}
                                className="flex items-center gap-2 text-sm font-medium w-full text-left"
                              >
                                {collapsedSections.has(row.id) ? (
                                  <ChevronRight className="w-3 h-3" />
                                ) : (
                                  <ChevronDown className="w-3 h-3" />
                                )}
                                {row.name}
                                <span className="text-xs ml-auto text-gray-500">{row.items.length}</span>
                              </button>
                            </div>
                            <div className="flex-1 bg-gray-50" />
                          </div>

                          {!collapsedSections.has(row.id) &&
                            row.items.map((item) => (
                              <div key={item.id} className="flex border-b">
                                <div className="w-48 p-3 border-r">
                                  <div className="text-sm truncate">{item.name}</div>
                                  {"assignee" in item && item.assignee && (
                                    <div className="text-xs mt-1 text-gray-500">{(item as any).assignee}</div>
                                  )}
                                </div>
                                <div className="flex-1 relative py-2" style={{ height: "48px" }}>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div
                                          className={`absolute top-1/2 -translate-y-1/2 h-6 rounded cursor-pointer transition-all ${getBarColor((item as any).type)}`}
                                          style={{
                                            width: `${getBarWidth(item.start, item.end, dayWidth[0])}px`,
                                            left: `${getBarPosition(item.start, gridStart, dayWidth[0])}px`,
                                            boxShadow:
                                              hoveredBar === item.id ? "0 2px 8px rgba(0,0,0,0.12)" : undefined,
                                          }}
                                          onMouseEnter={() => setHoveredBar(item.id)}
                                          onMouseLeave={() => setHoveredBar(null)}
                                        >
                                          {(item as any).type === "task" && (
                                            <div
                                              className="h-full rounded-l"
                                              style={{
                                                width: `${(item as any).progress}%`,
                                                backgroundColor: "rgba(255, 255, 255, 0.5)",
                                              }}
                                            />
                                          )}
                                          {getBarWidth(item.start, item.end, dayWidth[0]) > 80 && (
                                            <div className="absolute inset-0 flex items-center px-2">
                                              <span className="text-xs text-white font-medium truncate">
                                                {item.name}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <div className="text-sm">
                                          <div className="font-medium">{item.name}</div>
                                          <div className="text-gray-500">
                                            {new Date((item as any).start).toLocaleDateString()} -{" "}
                                            {new Date((item as any).end).toLocaleDateString()}
                                          </div>
                                          {"progress" in item && (
                                            <div className="text-gray-500">{(item as any).progress}% complete</div>
                                          )}
                                          {"assignee" in item && (
                                            <div className="text-gray-500">Assigned: {(item as any).assignee}</div>
                                          )}
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </div>
                            ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-900 rounded"></div>
                      <span className="text-sm text-gray-600">Milestones</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span className="text-sm text-gray-600">Tasks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-red-500 rounded"></div>
                      <span className="text-sm text-gray-600">Deliveries</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: "rgba(128, 128, 128, 0.5)" }}></div>
                      <span className="text-sm text-gray-600">Team Allocations</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Printer className="w-4 h-4 mr-2" />
                      Print
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export PNG
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
