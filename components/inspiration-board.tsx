"use client"

import { Button } from "@/components/ui/button"
import { Heart, Bookmark, Share, Plus } from 'lucide-react'

const inspirations = [
  {
    id: 1,
    title: "Minimalist Bedroom",
    source: "Architectural Digest",
    image: "/placeholder.svg?height=300&width=300",
    likes: 124,
    saved: true,
  },
  {
    id: 2,
    title: "Industrial Kitchen",
    source: "Elle Decor",
    image: "/placeholder.svg?height=300&width=300",
    likes: 89,
    saved: false,
  },
  {
    id: 3,
    title: "Bohemian Living Room",
    source: "House Beautiful",
    image: "/placeholder.svg?height=300&width=300",
    likes: 156,
    saved: true,
  },
  {
    id: 4,
    title: "Modern Bathroom",
    source: "Dezeen",
    image: "/placeholder.svg?height=300&width=300",
    likes: 203,
    saved: false,
  },
]

export function InspirationBoard() {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-playfair text-2xl font-bold text-white">
          Inspiration Board
        </h2>
        <Button size="sm" variant="ghost" className="text-amber-400 hover:text-amber-300 hover:bg-amber-400/10">
          <Plus className="w-4 h-4 mr-2" />
          Add
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {inspirations.map((item) => (
          <div 
            key={item.id}
            className="group relative bg-zinc-900/50 rounded-xl overflow-hidden border border-zinc-800 hover:border-zinc-700 transition-all duration-300"
          >
            <div className="relative h-32 overflow-hidden">
              <img 
                src={item.image || "/placeholder.svg"}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Action Buttons */}
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" variant="ghost" className="w-8 h-8 p-0 bg-black/40 hover:bg-black/60">
                  <Share className="w-3 h-3 text-white" />
                </Button>
                <Button size="sm" variant="ghost" className="w-8 h-8 p-0 bg-black/40 hover:bg-black/60">
                  <Bookmark className={`w-3 h-3 ${item.saved ? 'text-amber-400' : 'text-white'}`} />
                </Button>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-white text-sm mb-1">
                {item.title}
              </h3>
              <p className="text-xs text-zinc-400 mb-2">{item.source}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-zinc-400">
                  <Heart className="w-3 h-3" />
                  {item.likes}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
