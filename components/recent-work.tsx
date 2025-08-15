"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, ArrowRight } from 'lucide-react'

const recentWork = [
  {
    id: 1,
    title: "Penthouse Living Room Reveal",
    project: "Luxury Penthouse Redesign",
    date: "2 days ago",
    location: "Manhattan, NY",
    image: "/placeholder.svg?height=200&width=300",
    status: "Completed",
    color: "from-violet-500 to-purple-600",
  },
  {
    id: 2,
    title: "Office Reception Area",
    project: "Modern Office Transformation",
    date: "1 week ago",
    location: "Brooklyn, NY",
    image: "/placeholder.svg?height=200&width=300",
    status: "In Review",
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: 3,
    title: "Hotel Lobby Concept",
    project: "Boutique Hotel Lobby",
    date: "2 weeks ago",
    location: "SoHo, NY",
    image: "/placeholder.svg?height=200&width=300",
    status: "Approved",
    color: "from-rose-500 to-pink-600",
  },
]

export function RecentWork() {
  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-playfair text-3xl font-bold text-white">
          Recent Work
        </h2>
        <Button variant="ghost" className="text-amber-400 hover:text-amber-300 hover:bg-amber-400/10">
          View Portfolio
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
      
      <div className="space-y-6">
        {recentWork.map((work) => (
          <div 
            key={work.id}
            className="group flex gap-6 bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800 hover:border-zinc-700 transition-all duration-300 hover:scale-[1.01]"
          >
            {/* Image */}
            <div className="relative w-48 h-32 rounded-xl overflow-hidden flex-shrink-0">
              <img 
                src={work.image || "/placeholder.svg"}
                alt={work.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
            
            {/* Content */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-playfair text-xl font-bold text-white">
                    {work.title}
                  </h3>
                  <Badge 
                    className={`bg-gradient-to-r ${work.color} text-white border-0 font-semibold`}
                  >
                    {work.status}
                  </Badge>
                </div>
                
                <p className="text-zinc-400 mb-4">{work.project}</p>
                
                <div className="flex items-center gap-6 text-sm text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {work.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {work.location}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <Button variant="ghost" size="sm" className="text-amber-400 hover:text-amber-300 hover:bg-amber-400/10">
                  View Details
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
