"use client"

import { TrendingUp, TrendingDown, Home, DollarSign, Users, CheckCircle } from "lucide-react"

const stats = [
  {
    title: "Active Projects",
    value: "12",
    change: "+2",
    trend: "up",
    icon: Home,
  },
  {
    title: "Revenue This Month",
    value: "£127,500",
    change: "+23%",
    trend: "up",
    icon: DollarSign,
  },
  {
    title: "Tasks Completed",
    value: "89",
    change: "+12",
    trend: "up",
    icon: CheckCircle,
  },
  {
    title: "Active Clients",
    value: "24",
    change: "-1",
    trend: "down",
    icon: Users,
  },
]

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="bg-white border border-greige-500/30 rounded-xl p-6 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-neutral-50 rounded-lg">
              <stat.icon className="w-5 h-5 text-slatex-700" />
            </div>

            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                stat.trend === "up" ? "bg-sage-300/30 text-olive-700" : "bg-terracotta-600/10 text-terracotta-600"
              }`}
            >
              {stat.trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {stat.change}
            </div>
          </div>

          <div className="text-2xl font-semibold text-neutral-900 mb-1">{stat.value}</div>

          <div className="text-sm text-neutral-600">{stat.title}</div>
        </div>
      ))}
    </div>
  )
}
