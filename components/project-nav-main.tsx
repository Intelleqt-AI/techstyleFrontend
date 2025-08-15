"use client"

import { cn } from "@/lib/utils"

type TabKey = "all" | "active" | "completed" | "archived"

interface ProjectNavMainProps {
  activeTab?: TabKey
  counts?: Partial<Record<TabKey, number>>
  onChange?: (tab: TabKey) => void
}

const tabs: { key: TabKey; label: string }[] = [
  { key: "all", label: "All Projects" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "archived", label: "Archived" },
]

export function ProjectNavMain({ activeTab = "all", counts = { active: 3 }, onChange }: ProjectNavMainProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-2">
      <div className="flex items-center gap-2 overflow-x-auto">
        {tabs.map((t) => {
          const isActive = activeTab === t.key
          const count = counts[t.key]
          return (
            <button
              key={t.key}
              onClick={() => onChange?.(t.key)}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors",
                isActive ? "bg-neutral-100 text-gray-900" : "text-gray-700 hover:bg-neutral-50",
              )}
            >
              <span>{t.label}</span>
              {typeof count === "number" && (
                <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-xs font-medium text-white bg-clay-500">
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
