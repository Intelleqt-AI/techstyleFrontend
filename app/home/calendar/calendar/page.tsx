"use client"

import { HomeNav } from "@/components/home-nav"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Users,
  Play,
  CheckCircle,
  Timer,
  Search,
  Video,
  Car,
  Sun,
  Cloud,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useState } from "react"

type ViewType = "month" | "week" | "today"

// Today events use earthy palette
const todayEvents = [
  {
    id: 1,
    title: "Client Meeting - Penthouse Review",
    time: "10:00 AM",
    duration: "1h",
    location: "Office Conference Room",
    type: "meeting",
    project: "Luxury Penthouse",
    projectTextHex: "#6E7A58", // olive text
    projectBorderHex: "#8FA58F", // sage border
    attendees: 3,
    hasConflict: false,
    canJoin: true,
    color: "bg-[#E07A57] border-[#CE6B4E]", // clay
  },
  {
    id: 2,
    title: "Site Visit - Office Space Progress",
    time: "2:30 PM",
    duration: "2h",
    location: "Downtown Construction Site",
    type: "site-visit",
    project: "Modern Office",
    projectTextHex: "#6E7A58",
    projectBorderHex: "#8FA58F",
    attendees: 5,
    hasConflict: true,
    canJoin: false,
    color: "bg-[#8FA58F] border-[#6E7A58]", // sage/olive
  },
  {
    id: 3,
    title: "Design Review - Hotel Lobby",
    time: "4:00 PM",
    duration: "1h",
    location: "Remote",
    type: "meeting",
    project: "Grandeur Hotels",
    projectTextHex: "#6E7A58",
    projectBorderHex: "#8FA58F",
    attendees: 4,
    hasConflict: false,
    canJoin: true,
    color: "bg-[#6E7A58] border-[#6E7A58]", // olive
  },
  {
    id: 4,
    title: "Material Delivery Coordination",
    time: "5:30 PM",
    duration: "30m",
    location: "Warehouse District",
    type: "delivery",
    project: "Luxury Penthouse",
    projectTextHex: "#6E7A58",
    projectBorderHex: "#8FA58F",
    attendees: 2,
    hasConflict: false,
    canJoin: false,
    color: "bg-[#C78A3B] border-[#C78A3B]", // ochre
  },
]

// Month dots remapped to earthy tones
const calendarEvents = [
  {
    day: 6,
    events: [
      { type: "meeting", color: "bg-[#E68E71]" },
      { type: "task", color: "bg-[#6B7C85]" },
    ],
  }, // clay tint + slate
  { day: 8, events: [{ type: "site-visit", color: "bg-[#8FA58F]" }] }, // sage
  { day: 12, events: [{ type: "delivery", color: "bg-[#C78A3B]" }] }, // ochre
  {
    day: 15,
    events: [
      { type: "meeting", color: "bg-[#E07A57]" },
      { type: "meeting", color: "bg-[#E68E71]" },
    ],
  },
  { day: 20, events: [{ type: "task", color: "bg-[#6B7C85]" }] }, // slate
  { day: 22, events: [{ type: "pto", color: "bg-[#D9D5CC]" }] }, // greige 300
]

// Week view earthy colors
const weekEvents = [
  { day: "Mon", date: 4, events: [{ title: "Team Standup", time: "9:00 AM", color: "bg-[#E68E71]" }] },
  { day: "Tue", date: 5, events: [{ title: "Client Call", time: "2:00 PM", color: "bg-[#8FA58F]" }] },
  {
    day: "Wed",
    date: 6,
    events: [
      { title: "Client Meeting", time: "10:00 AM", color: "bg-[#E07A57]" },
      { title: "Site Visit", time: "2:30 PM", color: "bg-[#8FA58F]" },
      { title: "Design Review", time: "4:00 PM", color: "bg-[#6E7A58]" },
    ],
  },
  { day: "Thu", date: 7, events: [{ title: "Material Delivery", time: "11:00 AM", color: "bg-[#C78A3B]" }] },
  { day: "Fri", date: 8, events: [{ title: "Project Review", time: "3:00 PM", color: "bg-[#6B7C85]" }] },
  { day: "Sat", date: 9, events: [] },
  { day: "Sun", date: 10, events: [] },
]

export default function MyCalendarPage() {
  const [currentView, setCurrentView] = useState<ViewType>("month")

  const renderMonthView = () => (
    <div className="grid grid-cols-4 gap-6">
      {/* Main Calendar */}
      <div className="col-span-3">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="p-6">
            {/* Calendar Header */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }, (_, i) => {
                const day = i - 2
                const isToday = day === 6
                const eventData = calendarEvents.find((e) => e.day === day)

                return (
                  <div
                    key={i}
                    className={`min-h-[100px] p-3 text-sm border border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                      day < 1 || day > 30 ? "text-gray-300 bg-gray-25" : "text-gray-900"
                    } ${isToday ? "bg-[#FBEAE1] border-[#F1BBAA] text-[#1F1D1A] font-semibold" : ""}`}
                  >
                    {day > 0 && day <= 30 && (
                      <>
                        <div className="font-medium mb-2 text-sm">{day}</div>
                        {eventData && (
                          <div className="space-y-1">
                            {eventData.events.map((event, idx) => (
                              <div
                                key={idx}
                                className={`w-full h-1.5 rounded-full ${event.color} ring-1 ring-gray-200`}
                              />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Today Side Panel */}
      <div className="col-span-1">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm sticky top-6 max-h-[calc(100vh-3rem)] flex flex-col">
          <div className="p-6 flex-shrink-0">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
              <div className="flex items-center gap-1 text-xs text-gray-500 ml-auto">
                <Sun className="w-3 h-3" />
                <span>72°F</span>
              </div>
            </div>

            {/* AI Insight */}
            <div className="mb-6 p-4 bg-[#FBEAE1] border border-[#F1BBAA] rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-[#E07A57] rounded-full mt-2 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-[#A14A35] mb-1">Free 2-hour focus block at 2:00 PM</p>
                  <p className="text-[#CE6B4E]">Perfect for deep work between meetings</p>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Events */}
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <div className="space-y-3">
              {todayEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex flex-col gap-1 rounded-lg border border-gray-200 p-3 bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-1">
                    <div
                      className={`w-3 h-3 rounded-full ${event.color.split(" ")[0]} ring-2 ${event.color.split(" ")[1].replace("border-", "ring-")}`}
                    />
                    <span className="text-sm font-medium text-gray-900">{event.time}</span>
                    {event.hasConflict && <Cloud className="w-4 h-4" style={{ color: "#C78A3B" }} />}
                  </div>

                  {/* Title */}
                  <h4 className="font-medium text-gray-900 text-sm leading-relaxed mb-1">{event.title}</h4>

                  {/* Project Badge */}
                  <div className="mb-2">
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={{ color: event.projectTextHex, borderColor: event.projectBorderHex }}
                    >
                      {event.project}
                    </Badge>
                  </div>

                  {/* Meta info */}
                  <div className="text-xs text-gray-600 mb-2">{event.location}</div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-2 text-xs text-gray-500 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {event.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {event.attendees}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {event.canJoin && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-6 w-6 hover:bg-gray-100">
                                <Play className="w-3 h-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Join</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-6 w-6 hover:bg-gray-100">
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Mark Done</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-6 w-6 hover:bg-gray-100">
                              <Timer className="w-3 h-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Log Time</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <Button
                size="sm"
                variant="outline"
                className="w-full text-gray-600 border-gray-300 h-9 text-sm bg-transparent"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderWeekView = () => (
    <div className="grid grid-cols-4 gap-6">
      {/* Week Calendar */}
      <div className="col-span-3">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="p-6">
            {/* Week Header */}
            <div className="grid grid-cols-8 gap-1 mb-4">
              <div className="p-3 text-center text-sm font-medium text-gray-500">Time</div>
              {weekEvents.map((day) => (
                <div key={day.day} className="p-3 text-center">
                  <div className="text-sm font-medium text-gray-500">{day.day}</div>
                  <div className={`text-lg font-semibold mt-1 ${day.date === 6 ? "text-[#CE6B4E]" : "text-gray-900"}`}>
                    {day.date}
                  </div>
                </div>
              ))}
            </div>

            {/* Time Grid */}
            <div className="space-y-1">
              {Array.from({ length: 12 }, (_, i) => {
                const hour = i + 8 // 8 AM to 7 PM
                const timeLabel = hour <= 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`

                return (
                  <div
                    key={hour}
                    className="grid grid-cols-8 gap-1 min-h-[60px] border-b border-gray-100 last:border-b-0"
                  >
                    <div className="p-3 text-xs text-gray-500 font-medium">{timeLabel}</div>
                    {weekEvents.map((day) => {
                      const dayEvents = day.events.filter((event) => {
                        const eventHour = Number.parseInt(event.time.split(":")[0])
                        const isPM = event.time.includes("PM")
                        const adjustedHour = isPM && eventHour !== 12 ? eventHour + 12 : eventHour
                        return adjustedHour === hour
                      })

                      return (
                        <div
                          key={`${day.day}-${hour}`}
                          className="p-1 border-r border-gray-100 last:border-r-0 relative"
                        >
                          {dayEvents.map((event, idx) => (
                            <div
                              key={idx}
                              className={`p-2 rounded text-xs font-medium ${event.color} text-white cursor-pointer hover:opacity-80 transition-opacity`}
                            >
                              <div className="truncate">{event.title}</div>
                              <div className="text-xs opacity-90">{event.time}</div>
                            </div>
                          ))}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Week Summary Panel */}
      <div className="col-span-1">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm sticky top-6">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Week Overview</h3>

            {/* Week Stats */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Events</span>
                <span className="font-semibold text-gray-900">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Meetings</span>
                <span className="font-semibold text-gray-900">5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Site Visits</span>
                <span className="font-semibold text-gray-900">2</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Free Hours</span>
                <span className="font-semibold text-[#6E7A58]">12</span>
              </div>
            </div>

            {/* Upcoming This Week */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Upcoming This Week</h4>
              {weekEvents.slice(3, 5).map((day, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-sm text-gray-900">
                    {day.day}, Nov {day.date}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {day.events.length} event{day.events.length !== 1 ? "s" : ""}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTodayView = () => (
    <div className="grid grid-cols-1 gap-6">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Today - Wednesday, November 6</h2>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Sun className="w-4 h-4" />
              <span>72°F, Sunny</span>
            </div>
          </div>

          {/* Today's Timeline */}
          <div className="space-y-4">
            {todayEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-6 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex flex-col items-center min-w-[80px]">
                  <div className="text-lg font-semibold text-gray-900">{event.time.split(" ")[0]}</div>
                  <div className="text-sm text-gray-500">{event.time.split(" ")[1]}</div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-4 h-4 rounded-full ${event.color.split(" ")[0]} ring-2 ${event.color.split(" ")[1].replace("border-", "ring-")}`}
                    />
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={{ color: event.projectTextHex, borderColor: event.projectBorderHex }}
                    >
                      {event.project}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {event.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {event.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {event.attendees} attendees
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {event.canJoin && (
                      <Button size="sm" variant="outline" className="h-8 px-3 text-sm bg-transparent">
                        <Play className="w-4 h-4 mr-1" />
                        Join
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="h-8 px-3 text-sm bg-transparent">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Done
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 px-3 text-sm bg-transparent">
                      <Timer className="w-4 h-4 mr-1" />
                      Log Time
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex-1 bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <HomeNav />

        {/* Calendar Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 px-3 text-sm font-medium ${currentView === "month" ? "bg-gray-100 text-gray-900" : "text-gray-600"}`}
                onClick={() => setCurrentView("month")}
              >
                Month
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 px-3 text-sm font-medium ${currentView === "week" ? "bg-gray-100 text-gray-900" : "text-gray-600"}`}
                onClick={() => setCurrentView("week")}
              >
                Week
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 px-3 text-sm font-medium ${currentView === "today" ? "bg-gray-100 text-gray-900" : "text-gray-600"}`}
                onClick={() => setCurrentView("today")}
              >
                Today
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-lg font-semibold text-gray-900 min-w-[140px] text-center">
                {currentView === "week" ? "Nov 4-10, 2024" : "November 2024"}
              </h2>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search events..." className="pl-10 pr-4 bg-white text-sm h-9 w-64 border-gray-200" />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="bg-gray-900 text-white hover:bg-gray-800 h-9 text-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="text-sm">
                  <Video className="w-4 h-4 mr-2" />
                  Meeting
                </DropdownMenuItem>
                <DropdownMenuItem className="text-sm">
                  <MapPin className="w-4 h-4 mr-2" />
                  Site Visit
                </DropdownMenuItem>
                <DropdownMenuItem className="text-sm">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Task
                </DropdownMenuItem>
                <DropdownMenuItem className="text-sm">
                  <Car className="w-4 h-4 mr-2" />
                  Delivery
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Calendar Views */}
        {currentView === "month" && renderMonthView()}
        {currentView === "week" && renderWeekView()}
        {currentView === "today" && renderTodayView()}
      </div>
    </div>
  )
}
