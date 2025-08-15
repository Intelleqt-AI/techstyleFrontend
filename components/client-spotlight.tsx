"use client"

import { Button } from "@/components/ui/button"
import { Star, Quote, ArrowRight } from 'lucide-react'

const testimonials = [
  {
    id: 1,
    name: "Sarah Mitchell",
    company: "The Smith Family",
    project: "Luxury Penthouse Redesign",
    rating: 5,
    quote: "Techstyles transformed our penthouse into a masterpiece. Their attention to detail and innovative approach exceeded all expectations.",
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 2,
    name: "Michael Chen",
    company: "TechCorp Inc.",
    project: "Modern Office Transformation",
    rating: 5,
    quote: "The team's ability to blend functionality with stunning aesthetics created the perfect workspace for our growing company.",
    image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: 3,
    name: "Elena Rodriguez",
    company: "Grandeur Hotels",
    project: "Boutique Hotel Lobby",
    rating: 5,
    quote: "Our hotel lobby has become the talk of the city. Guests are constantly complimenting the sophisticated design.",
    image: "/placeholder.svg?height=80&width=80",
  },
]

export function ClientSpotlight() {
  return (
    <section>
      <div className="text-center mb-12">
        <h2 className="font-playfair text-4xl font-bold text-white mb-4">
          Client Spotlight
        </h2>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
          Hear from the clients who trusted us to bring their vision to life
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {testimonials.map((testimonial) => (
          <div 
            key={testimonial.id}
            className="group relative bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 hover:border-zinc-700 transition-all duration-300 hover:scale-[1.02]"
          >
            {/* Quote Icon */}
            <div className="absolute top-6 right-6 opacity-20 group-hover:opacity-30 transition-opacity">
              <Quote className="w-8 h-8 text-amber-400" />
            </div>
            
            {/* Rating */}
            <div className="flex items-center gap-1 mb-4">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            
            {/* Quote */}
            <blockquote className="text-white text-lg leading-relaxed mb-6 font-medium">
              "{testimonial.quote}"
            </blockquote>
            
            {/* Client Info */}
            <div className="flex items-center gap-4">
              <img 
                src={testimonial.image || "/placeholder.svg"}
                alt={testimonial.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h4 className="font-semibold text-white">{testimonial.name}</h4>
                <p className="text-sm text-zinc-400">{testimonial.company}</p>
                <p className="text-xs text-amber-400">{testimonial.project}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center mt-12">
        <Button 
          size="lg"
          className="bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold hover:from-amber-500 hover:to-orange-600 px-8 py-3 rounded-xl"
        >
          View All Testimonials
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </section>
  )
}
