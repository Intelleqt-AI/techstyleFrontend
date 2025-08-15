"use client"

import { Button } from "@/components/ui/button"

export type Period = "month" | "quarter" | "year"

type Props = {
  period?: Period
  onChange?: (period: Period) => void
}

const PERIODS: Period[] = ["month", "quarter", "year"]

export function PeriodFilter({ period = "quarter", onChange = () => {} }: Props) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
      {PERIODS.map((p) => (
        <Button
          key={p}
          variant={p === period ? "default" : "ghost"}
          size="sm"
          className={p === period ? "bg-gray-900 text-white hover:bg-gray-800" : "text-gray-600"}
          onClick={() => onChange(p)}
        >
          {p[0].toUpperCase() + p.slice(1)}
        </Button>
      ))}
    </div>
  )
}
