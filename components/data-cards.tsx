"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type DataCardItem = {
title: string
value: string
subtitle?: string
icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>
tone?: "neutral" | "success" | "warning" | "danger"
}

type DataCardsGridProps = {
items: DataCardItem[]
className?: string
// cols prop kept for compatibility but not used (we enforce 4 across at md+)
cols?: { base?: number; md?: number; lg?: number }
}

export function DataCardsGrid({
items,
className,
}: DataCardsGridProps) {
return (
  <div className={cn("grid grid-cols-1 md:grid-cols-4 gap-4", className)}>
    {items.map((item) => {
      const Icon = item.icon
      return (
        <div
          key={item.title}
          className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            {Icon ? (
              <Icon className="w-4 h-4 text-gray-500" aria-hidden="true" />
            ) : null}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600">{item.title}</p>
              <p className="text-lg font-semibold text-gray-900 tabular-nums leading-tight">
                {item.value}
              </p>
              {item.subtitle ? (
                <p className="text-xs text-gray-500">{item.subtitle}</p>
              ) : null}
            </div>
          </div>
        </div>
      )
    })}
  </div>
)
}
