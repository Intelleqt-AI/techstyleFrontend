"use client"

import { useMemo, useState } from "react"
import { ChartCard } from "@/components/reports/chart-card"
import { PeriodFilter, type Period } from "@/components/reports/period-filter"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis, Area, AreaChart } from "recharts"

const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 })
const formatGBP = (n: number) => gbp.format(Number(n || 0))

type Row = { project: string; revenue: number; cost: number }
const base: Row[] = [
  { project: "Luxury Penthouse", revenue: 82000, cost: 52000 },
  { project: "Modern Office", revenue: 76000, cost: 47000 },
  { project: "Boutique Hotel", revenue: 68000, cost: 49500 },
  { project: "Kitchen Remodel", revenue: 42000, cost: 29000 },
  { project: "Corporate HQ", revenue: 90000, cost: 61000 },
]

function withProfit(rows: Row[]) {
  return rows
    .map((r) => ({ ...r, profit: r.revenue - r.cost, margin: Math.round(((r.revenue - r.cost) / r.revenue) * 100) }))
    .sort((a, b) => b.profit - a.profit)
}

const timelines: Record<Period, { label: string; revenue: number; cost: number }[]> = {
  month: [
    { label: "W1", revenue: 26000, cost: 17500 },
    { label: "W2", revenue: 28000, cost: 19200 },
    { label: "W3", revenue: 21000, cost: 15800 },
    { label: "W4", revenue: 25000, cost: 17800 },
  ],
  quarter: [
    { label: "Jan", revenue: 82000, cost: 62000 },
    { label: "Feb", revenue: 91000, cost: 67000 },
    { label: "Mar", revenue: 98000, cost: 70000 },
  ],
  year: [
    { label: "Jan", revenue: 82000, cost: 62000 },
    { label: "Feb", revenue: 91000, cost: 67000 },
    { label: "Mar", revenue: 98000, cost: 70000 },
    { label: "Apr", revenue: 102000, cost: 73000 },
    { label: "May", revenue: 97000, cost: 69000 },
    { label: "Jun", revenue: 108000, cost: 75000 },
  ],
}

export default function ProfitabilityPage() {
  const [period, setPeriod] = useState<Period>("quarter")
  const rows = useMemo(() => withProfit(base), [])
  const trend = timelines[period]

  const totals = useMemo(() => {
    const rev = trend.reduce((s, r) => s + r.revenue, 0)
    const cost = trend.reduce((s, r) => s + r.cost, 0)
    const profit = rev - cost
    const margin = Math.round((profit / Math.max(1, rev)) * 100)
    return { rev, cost, profit, margin }
  }, [trend])

  return (
    <main className="flex-1 space-y-6 p-6">
      {/* 1) KPI strip */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Revenue</div>
          <div className="text-xl font-semibold text-gray-900">{formatGBP(totals.rev)}</div>
          <div className="text-xs text-gray-500">Period total</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Cost</div>
          <div className="text-xl font-semibold text-gray-900">{formatGBP(totals.cost)}</div>
          <div className="text-xs text-gray-500">Direct + indirect</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Profit</div>
          <div className="text-xl font-semibold text-gray-900">{formatGBP(totals.profit)}</div>
          <div className="text-xs text-gray-500">After costs</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Margin</div>
          <div className="text-xl font-semibold text-gray-900">{totals.margin}%</div>
          <div className="text-xs text-gray-500">Profit / Revenue</div>
        </div>
      </section>

      {/* 2) Filter row */}
      <div className="flex items-center justify-between gap-3">
        <PeriodFilter period={period} onChange={setPeriod} />
      </div>

      {/* 3) Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Profit by Project" description="Sorted by profit">
          <ChartContainer config={{ profit: { label: "Profit", color: "hsl(var(--chart-1))" } }} className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} margin={{ top: 10, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="project" tickLine={false} axisLine={false} />
                <YAxis tickFormatter={formatGBP} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent valueFormatter={(v) => formatGBP(Number(v))} />} />
                <Legend />
                <Bar dataKey="profit" fill="var(--color-profit)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>

        <ChartCard title="Margin by Project" description="Profitability %">
          <ChartContainer
            config={{ margin: { label: "Margin %", color: "hsl(var(--chart-2))" } }}
            className="h-[260px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} margin={{ top: 10, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="project" tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent valueFormatter={(v) => `${v}%`} />} />
                <Bar dataKey="margin" fill="var(--color-margin)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>

        <ChartCard title="Profit Trend" description="Revenue − Cost over time">
          <ChartContainer config={{ profit: { label: "Profit", color: "hsl(var(--chart-1))" } }} className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trend.map((t) => ({ label: t.label, profit: t.revenue - t.cost }))}
                margin={{ top: 10, right: 16, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickFormatter={formatGBP} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent valueFormatter={(v) => formatGBP(Number(v))} />} />
                <Area type="monotone" dataKey="profit" stroke="var(--color-profit)" fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>

        <ChartCard title="Revenue vs Cost" description="Composition by period">
          <ChartContainer
            config={{
              revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
              cost: { label: "Cost", color: "hsl(var(--chart-3))" },
            }}
            className="h-[260px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend} margin={{ top: 10, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickFormatter={formatGBP} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent valueFormatter={(v) => formatGBP(Number(v))} />} />
                <Legend />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cost" fill="var(--color-cost)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>
      </div>
    </main>
  )
}
