"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin } from 'lucide-react'

const todayEvents = [
  {
    id: 1,
    title: "Client Meeting - Penthouse Review",
    time: "10:00 AM",
    duration: "1h",
    location: "Office",
    type: "meeting",
    client: "Smith Family",
  },
  {
    id: 2,
    title: "Site Visit - Office Space",
    time: "2:30 PM",
    duration: "2h",
    location: "Downtown",
    type: "site-visit",
    client: "TechCorp Inc.",
  },
  {
    id: 3,
    title: "Vendor Call - Lighting Fixtures",
    time: "4:00 PM",
    duration: "30m",
    location: "Remote",
    type: "call",
    client: "Grandeur Hotels",
  },
]

export function CalendarWidget() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Today's Schedule</CardTitle>
        <Button variant="ghost" size="sm">
          <Calendar className="w-4 h-4 mr-2" />
          View calendar
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {todayEvents.map((event) => (
          <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg border bg-neutral-0 hover:bg-neutral-25 transition-colors">
            <div className="flex flex-col items-center">
              <div className="text-sm font-medium text-neutral-900">
                {event.time.split(' ')[0]}
              </div>
              <div className="text-xs text-neutral-400">
                {event.time.split(' ')[1]}
              </div>
            </div>
            
            <div className="w-px h-8 bg-neutral-200" />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm text-neutral-900">
                  {event.title}
                </h4>
                <Badge
                  variant={
                    event.type === 'meeting' ? 'default' :
                    event.type === 'site-visit' ? 'secondary' : 'outline'
                  }
                  className="text-xs"
                >
                  {event.type.replace('-', ' ')}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-neutral-400">
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
        
        {todayEvents.length === 0 && (
          <div className="text-center py-8 text-neutral-400">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No events scheduled for today</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
