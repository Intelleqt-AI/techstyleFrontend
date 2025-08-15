"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarIcon,
  Clock,
  MapPin,
  Filter,
  Search,
  Users,
  Briefcase,
  Wrench,
} from "lucide-react"

type ViewType = "month" | "week" | "day" | "gantt"
type GanttGrouping = "projects" | "staff" | "trades"

const events = [
  {
    id: 1,
    title: "Client Meeting - Penthouse Review",
    time: "10:00 AM",
    duration: "1h",
    location: "Office",
    type: "meeting",
    client: "Smith Family",
    project: "Luxury Penthouse",
    staff: "Sarah Johnson",
    trade: "Design",
    color: "bg-clay-100 text-clay-800 border-clay-200",
    date: new Date(2024, 10, 6),
    startTime: 10,
    endTime: 11,
  },
  {
    id: 2,
    title: "Site Visit - Office Space",
    time: "2:30 PM",
    duration: "2h",
    location: "Downtown",
    type: "site-visit",
    client: "TechCorp Inc.",
    project: "Modern Office",
    staff: "Mike Chen",
    trade: "Architecture",
    color: "bg-sage-100 text-sage-800 border-sage-200",
    date: new Date(2024, 10, 6),
    startTime: 14.5,
    endTime: 16.5,
  },
  {
    id: 3,
    title: "Design Review",
    time: "4:00 PM",
    duration: "1h",
    location: "Remote",
    type: "review",
    client: "Grandeur Hotels",
    project: "Hotel Lobby",
    staff: "Emma Davis",
    trade: "Interior Design",
    color: "bg-terracotta-100 text-terracotta-800 border-terracotta-200",
    date: new Date(2024, 10, 6),
    startTime: 16,
    endTime: 17,
  },
  {
    id: 4,
    title: "Kitchen Installation",
    time: "9:00 AM",
    duration: "4h",
    location: "Penthouse Site",
    type: "task",
    client: "Smith Family",
    project: "Luxury Penthouse",
    staff: "Tom Wilson",
    trade: "Plumbing",
    color: "bg-ochre-100 text-ochre-800 border-ochre-200",
    date: new Date(2024, 10, 7),
    startTime: 9,
    endTime: 13,
  },
  {
    id: 5,
    title: "Material Delivery",
    time: "11:00 AM",
    duration: "30min",
    location: "Office Site",
    type: "delivery",
    client: "TechCorp Inc.",
    project: "Modern Office",
    staff: "Mike Chen",
    trade: "General",
    color: "bg-greige-100 text-umber-800 border-greige-200",
    date: new Date(2024, 10, 8),
    startTime: 11,
    endTime: 11.5,
  },
]

const upcomingEvents = [
  {
    date: "Tomorrow",
    events: [
      { title: "Material Selection", time: "9:00 AM", client: "Johnson Family" },
      { title: "Contractor Meeting", time: "2:00 PM", client: "Smith Family" },
    ],
  },
  {
    date: "Friday",
    events: [
      { title: "Final Presentation", time: "11:00 AM", client: "TechCorp Inc." },
      { title: "Budget Review", time: "3:30 PM", client: "Grandeur Hotels" },
    ],
  },
]

const projects = ["Luxury Penthouse", "Modern Office", "Hotel Lobby"]
const staff = ["Sarah Johnson", "Mike Chen", "Emma Davis", "Tom Wilson"]
const trades = ["Design", "Architecture", "Interior Design", "Plumbing", "General"]

const viewOptions = [
  { id: "month", label: "Month" },
  { id: "week", label: "Week" },
  { id: "day", label: "Day" },
  { id: "gantt", label: "Gantt" },
]

export default function CalendarPage() {
  const [currentView, setCurrentView] = useState<ViewType>("month")
  const [ganttGrouping, setGanttGrouping] = useState<GanttGrouping>("projects")
  const [currentDate, setCurrentDate] = useState(new Date(2024, 10, 1)) // November 2024

  const getViewTitle = () => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]
    switch (currentView) {
      case "month":
        return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
      case "week":
        return `Week of ${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`
      case "day":
        return `${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`
      case "gantt":
        return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()} - Gantt View`
      default:
        return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
    }
  }

  const getGanttData = () => {
    switch (ganttGrouping) {
      case "projects":
        return projects.map((project) => ({
          id: project,
          name: project,
          events: events.filter((event) => event.project === project),
        }))
      case "staff":
        return staff.map((person) => ({
          id: person,
          name: person,
          events: events.filter((event) => event.staff === person),
        }))
      case "trades":
        return trades.map((trade) => ({
          id: trade,
          name: trade,
          events: events.filter((event) => event.trade === trade),
        }))
      default:
        return []
    }
  }

  const renderGanttView = () => {
    const ganttData = getGanttData()
    const hours = Array.from({ length: 12 }, (_, i) => i + 8) // 8 AM to 7 PM

    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Gantt Timeline</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Group by:</span>
              <div className="flex gap-1">
                <Button
                  variant={ganttGrouping === "projects" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGanttGrouping("projects")}
                  className="gap-1"
                >
                  <Briefcase className="w-3 h-3" />
                  Projects
                </Button>
                <Button
                  variant={ganttGrouping === "staff" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGanttGrouping("staff")}
                  className="gap-1"
                >
                  <Users className="w-3 h-3" />
                  Staff
                </Button>
                <Button
                  variant={ganttGrouping === "trades" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGanttGrouping("trades")}
                  className="gap-1"
                >
                  <Wrench className="w-3 h-3" />
                  Trades
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[200px_1fr] gap-0 border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 p-3 border-r border-gray-200 font-medium text-sm text-gray-700">
            {ganttGrouping.charAt(0).toUpperCase() + ganttGrouping.slice(1, -1)}
          </div>
          <div className="bg-gray-50 grid grid-cols-12 border-gray-200">
            {hours.map((hour) => (
              <div
                key={hour}
                className="p-2 text-center text-xs text-gray-600 border-r border-gray-200 last:border-r-0"
              >
                {hour}:00
              </div>
            ))}
          </div>
        </div>

        <div className="border-l border-r border-b border-gray-200 rounded-b-lg overflow-hidden">
          {ganttData.map((group) => (
            <div key={group.id} className="grid grid-cols-[200px_1fr] gap-0 border-b border-gray-200 last:border-b-0">
              <div className="p-3 border-r border-gray-200 bg-white">
                <div className="font-medium text-sm text-gray-900">{group.name}</div>
                <div className="text-xs text-gray-500 mt-1">{group.events.length} events</div>
              </div>
              <div className="relative bg-white min-h-[60px] grid grid-cols-12">
                {hours.map((hour) => (
                  <div key={hour} className="border-r border-gray-100 last:border-r-0"></div>
                ))}

                {group.events.map((event) => {
                  const startCol = Math.max(1, Math.min(12, Math.floor(((event.startTime - 8) * 12) / 12) + 1))
                  const duration = event.endTime - event.startTime
                  const widthCols = Math.max(1, Math.floor((duration * 12) / 12))

                  return (
                    <div
                      key={event.id}
                      className={`absolute top-2 h-8 rounded px-2 flex items-center text-xs font-medium ${event.color} cursor-pointer hover:opacity-80 transition-opacity`}
                      style={{
                        left: `${((startCol - 1) / 12) * 100}%`,
                        width: `${(widthCols / 12) * 100}%`,
                        minWidth: "60px",
                      }}
                      title={`${event.title} - ${event.time} (${event.duration})`}
                    >
                      <div className="truncate">{event.title}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {ganttData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No events scheduled for this view</p>
          </div>
        )}
      </div>
    )
  }

  const renderWeekView = () => {
    return (
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-8 border-b border-gray-200">
          <div className="p-4 bg-gray-50 border-r border-gray-200"></div>
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => (
            <div key={day} className="p-4 text-center border-r border-gray-200 last:border-r-0">
              <div className="text-sm font-medium text-gray-500">{day}</div>
              <div className="text-lg font-semibold text-gray-900 mt-1">{4 + index}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-8 min-h-[500px]">
          <div className="bg-gray-50 border-r border-gray-200">
            {Array.from({ length: 12 }, (_, i) => (
              <div
                key={i}
                className="h-16 border-b border-gray-200 flex items-center justify-center text-sm text-gray-500"
              >
                {8 + i}:00
              </div>
            ))}
          </div>

          {Array.from({ length: 7 }, (_, dayIndex) => (
            <div key={dayIndex} className="border-r border-gray-200 last:border-r-0 relative">
              {Array.from({ length: 12 }, (_, hourIndex) => (
                <div key={hourIndex} className="h-16 border-b border-gray-200 hover:bg-gray-50">
                  {dayIndex === 2 && hourIndex === 2 && (
                    <div className="absolute top-1 left-1 right-1 bg-clay-100 border border-clay-200 rounded p-1 text-xs">
                      <div className="font-medium text-clay-800">Client Meeting</div>
                      <div className="text-clay-700">10:00 - 11:00</div>
                    </div>
                  )}
                  {dayIndex === 4 && hourIndex === 6 && (
                    <div className="absolute top-1 left-1 right-1 bg-sage-100 border border-sage-200 rounded p-1 text-xs">
                      <div className="font-medium text-sage-800">Site Visit</div>
                      <div className="text-sage-700">14:30 - 16:30</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderDayView = () => {
    return (
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Wednesday, November 6</h3>
          <p className="text-sm text-gray-500">3 events scheduled</p>
        </div>

        <div className="grid grid-cols-12 min-h-[600px]">
          <div className="col-span-2 bg-gray-50 border-r border-gray-200">
            {Array.from({ length: 12 }, (_, i) => (
              <div
                key={i}
                className="h-16 border-b border-gray-200 flex items-center justify-center text-sm text-gray-500"
              >
                {8 + i}:00
              </div>
            ))}
          </div>

          <div className="col-span-10 relative">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="h-16 border-b border-gray-200 hover:bg-gray-50"></div>
            ))}

            <div className="absolute top-32 left-4 right-4 bg-clay-100 border border-clay-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-clay-800">Client Meeting - Penthouse Review</h4>
                  <p className="text-sm text-clay-700">10:00 AM - 11:00 AM • Office</p>
                  <p className="text-xs text-clay-700 mt-1">Smith Family</p>
                </div>
                <Badge className="bg-clay-50 text-clay-700 border-clay-200">meeting</Badge>
              </div>
            </div>

            <div className="absolute top-96 left-4 right-4 bg-sage-100 border border-sage-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-sage-800">Site Visit - Office Space</h4>
                  <p className="text-sm text-sage-700">2:30 PM - 4:30 PM • Downtown</p>
                  <p className="text-xs text-sage-700 mt-1">TechCorp Inc.</p>
                </div>
                <Badge className="bg-sage-50 text-sage-700 border-sage-200">site-visit</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderCalendarView = () => {
    if (currentView === "gantt") return renderGanttView()

    if (currentView === "week") {
      return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">{renderWeekView()}</div>
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
              <div className="space-y-4">
                {upcomingEvents.map((day, index) => (
                  <div key={index}>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">{day.date}</h4>
                    <div className="space-y-2">
                      {day.events.map((event, eventIndex) => (
                        <div key={eventIndex} className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className="font-medium text-sm text-gray-900">{event.title}</div>
                          <div className="text-xs text-gray-600 mt-1">
                            {event.time} • {event.client}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (currentView === "day") {
      return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">{renderDayView()}</div>
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
              <div className="space-y-4">
                {upcomingEvents.map((day, index) => (
                  <div key={index}>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">{day.date}</h4>
                    <div className="space-y-2">
                      {day.events.map((event, eventIndex) => (
                        <div key={eventIndex} className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className="font-medium text-sm text-gray-900">{event.title}</div>
                          <div className="text-xs text-gray-600 mt-1">
                            {event.time} • {event.client}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )
    }

    // Month
    return (
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="grid grid-cols-7 gap-1 mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }, (_, i) => {
                const day = i - 2
                const isToday = day === 6
                const hasEvent = [6, 8, 12, 15, 20].includes(day)

                return (
                  <div
                    key={i}
                    className={`aspect-square p-2 text-sm border border-gray-100 hover:bg-gray-50 cursor-pointer rounded-lg ${
                      day < 1 || day > 30 ? "text-gray-300" : "text-gray-900"
                    } ${isToday ? "bg-ochre-50 border-ochre-200 text-ochre-800 font-semibold" : ""}`}
                  >
                    {day > 0 && day <= 30 && (
                      <>
                        <div>{day}</div>
                        {hasEvent && <div className="w-2 h-2 bg-terracotta-500 rounded-full mt-1"></div>}
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 mt-8 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Today's Schedule</h3>
            <div className="space-y-4">
              {events.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex flex-col items-center">
                    <div className="text-sm font-medium text-gray-900">{event.time.split(" ")[0]}</div>
                    <div className="text-xs text-gray-500">{event.time.split(" ")[1]}</div>
                  </div>

                  <div className="w-px h-12 bg-gray-200" />

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{event.title}</h4>
                      <Badge className={event.color}>{event.type.replace("-", " ")}</Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {event.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </div>
                      <span>{event.client}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
            <div className="space-y-4">
              {upcomingEvents.map((day, index) => (
                <div key={index}>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">{day.date}</h4>
                  <div className="space-y-2">
                    {day.events.map((event, eventIndex) => (
                      <div key={eventIndex} className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="font-medium text-sm text-gray-900">{event.title}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          {event.time} • {event.client}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">View:</span>
            <div className="flex bg-gray-100 rounded-md p-1">
              {viewOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setCurrentView(option.id as ViewType)}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${
                    currentView === option.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const newDate = new Date(currentDate)
                newDate.setMonth(currentDate.getMonth() - 1)
                setCurrentDate(newDate)
              }}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-lg font-semibold text-gray-900 min-w-[200px]">{getViewTitle()}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const newDate = new Date(currentDate)
                newDate.setMonth(currentDate.getMonth() + 1)
                setCurrentDate(newDate)
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Input placeholder="Search events..." className="w-64 pl-10 pr-4" />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>

          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Filter className="w-4 h-4" />
            Filter
          </Button>

          <Button className="bg-clay-600 text-white hover:bg-clay-700 gap-2">
            <Plus className="w-4 h-4" />
            New
          </Button>
        </div>
      </div>

      {renderCalendarView()}
    </div>
  )
}
