"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, ExternalLink, Heart, Share2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

const projects = [
  {
    id: 1,
    title: "Luxury Penthouse Redesign",
    category: "Residential",
    budget: "£125,000",
    image: "/images/luxury-penthouse.png",
    description: "A sophisticated penthouse transformation featuring custom millwork, premium finishes, and seamless indoor-outdoor living spaces.",
    tags: ["Luxury", "Modern", "Custom Millwork"]
  },
  {
    id: 2,
    title: "Modern Office Space",
    category: "Commercial",
    budget: "£85,000",
    image: "/images/modern-office.png",
    description: "Contemporary workspace design emphasizing collaboration, natural light, and flexible work environments with sustainable materials.",
    tags: ["Contemporary", "Collaborative", "Sustainable"]
  },
  {
    id: 3,
    title: "Boutique Hotel Lobby",
    category: "Hospitality",
    budget: "£200,000",
    image: "/images/hotel-lobby.png",
    description: "Elegant hotel entrance featuring bespoke furniture, artisanal lighting, and curated art pieces creating a memorable first impression.",
    tags: ["Elegant", "Bespoke", "Hospitality"]
  }
]

export function ProjectGallery() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextProject = () => {
    setCurrentIndex((prev) => (prev + 1) % projects.length)
  }

  const prevProject = () => {
    setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length)
  }

  const currentProject = projects[currentIndex]

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="relative">
        {/* Project Image */}
        <div className="relative h-80 bg-gray-100">
          <Image
            src={currentProject.image || "/placeholder.svg"}
            alt={currentProject.title}
            fill
            className="object-cover"
          />
          
          {/* Navigation Arrows */}
          <Button
            variant="ghost"
            size="sm"
            onClick={prevProject}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white/90 backdrop-blur-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={nextProject}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white/90 backdrop-blur-sm"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          {/* Project Actions */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button variant="ghost" size="sm" className="bg-white/80 hover:bg-white/90 backdrop-blur-sm">
              <Heart className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="bg-white/80 hover:bg-white/90 backdrop-blur-sm">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="bg-white/80 hover:bg-white/90 backdrop-blur-sm">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>

          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <Badge className="bg-white/90 text-gray-900 backdrop-blur-sm">
              {currentProject.category}
            </Badge>
          </div>
        </div>

        {/* Project Info */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {currentProject.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {currentProject.description}
              </p>
            </div>
            <div className="text-right ml-4">
              <div className="text-lg font-semibold text-gray-900">
                {currentProject.budget}
              </div>
              <div className="text-sm text-gray-500">Budget</div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {currentProject.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Project Indicators */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {projects.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-gray-900' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-500">
              {currentIndex + 1} of {projects.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
