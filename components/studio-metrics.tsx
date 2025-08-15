"use client"

import { TrendingUp, TrendingDown, DollarSign, Clock, Star, Users } from 'lucide-react'

const metrics = [
  {
    title: "Revenue This Month",
    value: "$127,500",
    change: "+23%",
    trend: "up",
    icon: DollarSign,
    color: "from-emerald-400 to-teal-500",
  },
  {
    title: "Active Projects",
    value: "12",
    change: "+3",
    trend: "up",
    icon: Clock,
    color: "from-violet-400 to-purple-500",
  },
  {
    title: "Client Satisfaction",
    value: "4.9",
    change: "+0.2",
    trend: "up",
    icon: Star,
    color: "from-amber-400 to-orange-500",
  },
  {
    title: "Team Utilization",
    value: "87%",
    change: "-5%",
    trend: "down",
    icon: Users,
    color: "from-rose-400 to-pink-500",
  },
]

export function StudioMetrics() {
  return (
    <section>
      <h2 className="font-playfair text-3xl font-bold text-white mb-8">
        Studio Performance
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <div 
            key={metric.title}
            className="relative bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all duration-300 group"
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-5 rounded-2xl group-hover:opacity-10 transition-opacity`} />
            
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${metric.color} bg-opacity-20`}>
                  <metric.icon className={`w-6 h-6 text-white`} />
                </div>
                
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                  metric.trend === 'up' 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {metric.trend === 'up' ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {metric.change}
                </div>
              </div>
              
              <div className="text-3xl font-bold text-white mb-2">
                {metric.value}
              </div>
              
              <div className="text-sm text-zinc-400">
                {metric.title}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
