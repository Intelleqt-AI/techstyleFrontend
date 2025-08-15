"use client"

import { Clock, Pause, Square } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HomeNav } from "@/components/home-nav"
import { Badge } from "@/components/ui/badge"

type Day = { day: string; hours: number }

const daily: Day[] = [
  { day: "Mon", hours: 6.5 },
  { day: "Tue", hours: 8 },
  { day: "Wed", hours: 7.5 },
  { day: "Thu", hours: 5.5 },
  { day: "Fri", hours: 6 },
  { day: "Sat", hours: 2 },
  { day: "Sun", hours: 0 },
]

const recentEntries = [
  { title: "Design Review", project: "Luxury Penthouse", duration: "2h 30m", day: "Today", billable: "Billable" },
  { title: "Client Meeting", project: "Modern Office Space", duration: "1h 15m", day: "Today", billable: "Billable" },
  {
    title: "Material Selection",
    project: "Boutique Hotel",
    duration: "45m",
    day: "Yesterday",
    billable: "Non-billable",
  },
  { title: "Site Visit", project: "Residential Remodel", duration: "3h 20m", day: "Yesterday", billable: "Billable" },
]

// earthy accent for bars
const olive = "#6c7f57"
const oliveDeep = "#4b5d39"

export default function HomeTimePage() {
  return (
    <main className="space-y-6 p-6">
      {/* Global horizontal nav (stable across Home pages) */}
      <HomeNav />

      {/* Tracker card (no "+ New Entry") */}
      <Card className="rounded-2xl">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[auto,1fr,auto] md:items-center">
            {/* Compact static time display */}
            <div
              aria-label="Elapsed time"
              className="tabular-nums font-bold leading-none tracking-tight text-neutral-900 text-2xl md:text-3xl"
            >
              {"01:23:45"}
            </div>

            {/* Context */}
            <div className="space-y-0.5">
              <div className="text-lg font-semibold text-neutral-900">Kitchen Design Review</div>
              <div className="text-sm text-neutral-500">Luxury Penthouse Project</div>
            </div>

            {/* Controls */}
            <div className="flex justify-start gap-3 md:justify-end">
              <Button variant="outline" className="h-9 rounded-xl bg-transparent px-3.5">
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </Button>
              <Button variant="outline" className="h-9 rounded-xl bg-transparent px-3.5">
                <Square className="mr-2 h-4 w-4" />
                Stop
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two-column content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* This Week */}
        <Card className="rounded-2xl">
          <CardContent className="p-5">
            <h2 className="text-base md:text-lg font-semibold text-neutral-900">This Week</h2>

            <div className="mt-5 space-y-3.5">
              <div className="flex items-baseline justify-between">
                <span className="text-neutral-600">Total Hours</span>
                <span className="text-2xl font-bold text-neutral-900 md:text-3xl">35.5h</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-neutral-600">Billable Hours</span>
                <span className="text-xl font-semibold md:text-2xl" style={{ color: oliveDeep }}>
                  28.5h
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-neutral-600">Non-billable</span>
                <span className="text-xl font-semibold text-neutral-700 md:text-2xl">7.0h</span>
              </div>
            </div>

            {/* Daily breakdown — match project page thickness (slimmer) */}
            <div className="mt-5">
              <div className="font-medium text-neutral-800">Daily Breakdown</div>
              <ul className="mt-4 space-y-2.5">
                {daily.map((d) => {
                  const pct = Math.max(2, Math.min(100, (d.hours / 8) * 100)) // scale to 8h
                  return (
                    <li key={d.day} className="grid grid-cols-[36px,1fr,40px] items-center gap-3">
                      <span className="text-sm text-neutral-600">{d.day}</span>
                      <div className="h-1 rounded-full bg-neutral-200">
                        <div className="h-1 rounded-full" style={{ width: `${pct}%`, backgroundColor: olive }} />
                      </div>
                      <span className="text-sm tabular-nums text-neutral-700">{d.hours}h</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Recent Entries */}
        <Card className="rounded-2xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base md:text-lg font-semibold text-neutral-900">Recent Entries</h2>
              <a href="#" className="text-sm font-medium text-neutral-600 hover:text-neutral-900">
                View All
              </a>
            </div>

            <ul className="mt-5 space-y-3">
              {recentEntries.map((e, i) => (
                <li
                  key={`${e.title}-${i}`}
                  className="flex items-center justify-between rounded-xl border bg-white px-4 py-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-neutral-50">
                      <Clock className="h-4 w-4 text-neutral-500" />
                    </div>
                    <div>
                      <div className="text-sm md:text-base font-semibold text-neutral-900">{e.title}</div>
                      <div className="text-xs md:text-sm text-neutral-500">{e.project}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-sm md:text-base font-semibold text-neutral-900">{e.duration}</div>
                    <div className="text-xs md:text-sm text-neutral-500">{e.day}</div>

                    {/* Use global rectangular Badge shape/colors instead of ad-hoc pill */}
                    {e.billable === "Billable" ? (
                      <Badge className="rounded-md border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-900">
                        Billable
                      </Badge>
                    ) : (
                      <Badge className="rounded-md border-neutral-200 bg-neutral-100 px-3 py-1 text-[11px] font-medium text-neutral-800">
                        Non-billable
                      </Badge>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
