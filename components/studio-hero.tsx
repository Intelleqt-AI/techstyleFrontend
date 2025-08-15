"use client"

import { Button } from "@/components/ui/button"
import { Play, ArrowRight, Sparkles } from 'lucide-react'

export function StudioHero() {
  return (
    <div className="relative h-[60vh] overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/placeholder.svg?height=800&width=1600')`
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      
      {/* Content */}
      <div className="relative h-full flex items-center px-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span className="text-amber-400 font-medium text-sm tracking-wide uppercase">
              AI-Powered Design Studio
            </span>
          </div>
          
          <h1 className="font-playfair text-6xl font-bold text-white mb-6 leading-tight">
            Craft Extraordinary
            <span className="block bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Interior Experiences
            </span>
          </h1>
          
          <p className="text-xl text-zinc-300 mb-8 leading-relaxed">
            Transform spaces with intelligent project management, 
            seamless client collaboration, and AI-driven design insights.
          </p>
          
          <div className="flex items-center gap-4">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold hover:from-amber-500 hover:to-orange-600 px-8 py-3 rounded-xl"
            >
              Start New Project
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="lg"
              className="text-white border border-white/20 hover:bg-white/10 px-8 py-3 rounded-xl"
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>
        </div>
      </div>
      
      {/* Floating Stats */}
      <div className="absolute bottom-8 right-8 flex gap-4">
        {[
          { label: "Active Projects", value: "12" },
          { label: "Happy Clients", value: "48" },
          { label: "Completion Rate", value: "98%" },
        ].map((stat) => (
          <div key={stat.label} className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-zinc-400">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
