"use client"

import * as React from "react"
import type { ReactNode } from "react"
import type { TooltipProps } from "recharts"
import { cn } from "@/lib/utils"

// Chart configuration type
export interface ChartConfig {
  [key: string]: {
    label: string
    color: string
  }
}

type ChartContainerProps = {
  config: ChartConfig
  className?: string
  children: ReactNode
}

type ChartContextValue = { config: ChartConfig }
const ChartContext = React.createContext<ChartContextValue | null>(null)

export function useChartConfig() {
  const ctx = React.useContext(ChartContext)
  return ctx ?? { config: {} as ChartConfig }
}

// Solid color fallbacks that will definitely work
const COLOR_FALLBACKS = [
  "#0ea5e9", // sky-500
  "#f97316", // orange-500
  "#1f2937", // gray-800
  "#10b981", // emerald-500
  "#ef4444", // red-500
  "#8b5cf6", // violet-500
  "#f59e0b", // amber-500
  "#06b6d4", // cyan-500
]

export function ChartContainer({ config, className, children, ...props }: ChartContainerProps) {
  // Create CSS variables for each config item
  const style = React.useMemo(() => {
    const cssVars: Record<string, string> = {}

    // Set color variables for each config key
    Object.entries(config).forEach(([key, value]) => {
      cssVars[`--color-${key}`] = value.color
    })

    // Add default chart colors for components that reference them directly
    const defaultColors = [
      "#3b82f6", // blue
      "#10b981", // emerald
      "#f59e0b", // amber
      "#ef4444", // red
      "#8b5cf6", // violet
      "#06b6d4", // cyan
      "#84cc16", // lime
      "#f97316", // orange
    ]

    defaultColors.forEach((color, index) => {
      cssVars[`--chart-${index + 1}`] = color
    })

    return cssVars
  }, [config])

  return (
    <ChartContext.Provider value={{ config }}>
      <div className={cn("relative w-full min-w-0", className)} style={style} {...props}>
        {children}
      </div>
    </ChartContext.Provider>
  )
}

// Declare ChartTooltipProps type
type ChartTooltipProps = {
  content: React.FC<TooltipProps>
}

export function ChartTooltip({ content: Content, ...props }: ChartTooltipProps) {
  if (Content) {
    return <Content {...props} />
  }
  return null
}

type ChartTooltipContentOwnProps = {
  className?: string
  hideLabel?: boolean
  labelFormatter?: (label: any) => ReactNode
  nameKey?: string
  valueFormatter?: (value: number | string) => string
}

export function ChartTooltipContent(
  props: ChartTooltipContentOwnProps & {
    active?: boolean
    payload?: Array<{ value: number | string; name: string; payload?: any }>
    label?: any
  },
) {
  const { config } = useChartConfig()
  const { className, hideLabel, labelFormatter, nameKey, valueFormatter, active, payload, label } = props

  if (!active || !payload || payload.length === 0) return null

  const header = labelFormatter ? labelFormatter(label) : label

  return (
    <div className={cn("rounded-md border border-gray-200 bg-white p-2 text-xs shadow-sm", className)}>
      {!hideLabel && header && <div className="mb-1 font-medium text-gray-900">{header}</div>}
      <div className="grid gap-1">
        {payload.map((p, idx) => {
          const dataKey = p?.name ?? ""
          const seriesConf = config[dataKey]
          const displayName =
            (nameKey && p?.payload && p.payload[nameKey]) || seriesConf?.label || String(dataKey || "")
          const rawVal = p?.value
          const renderedVal =
            typeof valueFormatter === "function" ? valueFormatter(rawVal as any) : String(rawVal ?? "")

          return (
            <div key={idx} className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-2 w-2 rounded-sm"
                  style={{ backgroundColor: `var(--color-${dataKey})` }}
                  aria-hidden="true"
                />
                <span className="text-gray-700">{displayName}</span>
              </div>
              <span className="tabular-nums text-gray-900">{renderedVal}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
