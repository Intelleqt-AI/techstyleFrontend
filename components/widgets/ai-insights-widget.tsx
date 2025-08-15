"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react"

const insights = [
  {
    type: "optimization",
    icon: TrendingUp,
    title: "Budget Optimization",
    description: "You could save 15% on the Penthouse project by sourcing alternative materials.",
    action: "View suggestions",
    priority: "medium",
  },
  {
    type: "alert",
    icon: AlertTriangle,
    title: "Deadline Risk",
    description: "Modern Office Space project is at risk of missing deadline. Consider reallocating resources.",
    action: "Adjust timeline",
    priority: "high",
  },
  {
    type: "suggestion",
    icon: Lightbulb,
    title: "Design Trend",
    description: "Biophilic design elements are trending. Consider incorporating them in upcoming projects.",
    action: "Learn more",
    priority: "low",
  },
]

export function AIInsightsWidget() {
  const chipBg = (p: string) =>
    p === "high"
      ? "bg-terracotta-600/10 text-terracotta-600"
      : p === "medium"
        ? "bg-clay-500/10 text-clay-600"
        : "bg-sage-300/30 text-olive-700"

  return (
    <Card className="bg-greige-100 border border-greige-500/30">
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-4">
        <Sparkles className="w-5 h-5 text-clay-600" />
        <CardTitle className="text-lg font-semibold text-neutral-900">AI Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => (
          <div key={index} className="p-3 rounded-lg bg-white border border-borderSoft">
            <div className="flex items-start gap-3">
              <div className={`p-1.5 rounded-md ${chipBg(insight.priority)}`}>
                <insight.icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-neutral-900 mb-1">{insight.title}</h4>
                <p className="text-xs text-neutral-600 mb-2">{insight.description}</p>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-clay-600 hover:text-clay-700">
                  {insight.action}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
