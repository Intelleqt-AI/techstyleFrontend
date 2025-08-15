"use client"

import { useMemo, useState } from "react"
import { ChartCard } from "@/components/reports/chart-card"
import { PeriodFilter, type Period } from "@/components/reports/period-filter"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from "recharts"

const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 })
const formatGBP = (n: number) => gbp.format(Number(n || 0))

type Cat = { category: string; cost: number }
type Month = { label: string; cost: number; budget: number }
type Vendor = { vendor: string; spend: number }
type Overrun = { project: string; overrun: number }

const datasets: Record<Period, { byCategory: Cat[]; monthly: Month[]; vendors: Vendor[]; overruns: Overrun[] }> = {
  month: {
    byCategory: [
      { category: "Labor", cost: 64000 },
      { category: "Materials", cost: 38000 },
      { category: "Vendors", cost: 22000 },
      { category: "Travel", cost: 6000 },
      { category: "Other", cost: 4500 },
    ],
    monthly: [
      { label: "W1", cost: 11000, budget: 10500 },
      { label: "W2", cost: 12500, budget: 11000 },
      { label: "W3", cost: 9800, budget: 10000 },
      { label: "W4", cost: 11600, budget: 10800 },
    ],
    vendors: [
      { vendor: "Fixtures Co", spend: 18000 },
      { vendor: "Flooring Ltd", spend: 14000 },
      { vendor: "Lighting Hub", spend: 12000 },
      { vendor: "Fabric World", spend: 9000 },
    ],
    overruns: [
      { project: "Modern Office", overrun: 4000 },
      { project: "Boutique Hotel", overrun: 2800 },
      { project: "Corporate HQ", overrun: 1600 },
    ],
  },
  quarter: {
    byCategory: [
      { category: "Labor", cost: 182000 },
      { category: "Materials", cost: 113000 },
      { category: "Vendors", cost: 67000 },
      { category: "Travel", cost: 18000 },
      { category: "Other", cost: 14000 },
    ],
    monthly: [
      { label: "Jan", cost: 38000, budget: 36000 },
      { label: "Feb", cost: 42000, budget: 38000 },
      { label: "Mar", cost: 45000, budget: 42000 },
    ],
    vendors: [
      { vendor: "Fixtures Co", spend: 52000 },
      { vendor: "Flooring Ltd", spend: 41000 },
      { vendor: "Lighting Hub", spend: 36000 },
      { vendor: "Fabric World", spend: 27000 },
    ],
    overruns: [
      { project: "Modern Office", overrun: 11000 },
      { project: "Boutique Hotel", overrun: 7200 },
      { project: "Corporate HQ", overrun: 4200 },
    ],
  },
  year: {
    byCategory: [
      { category: "Labor", cost: 720000 },
      { category: "Materials", cost: 445000 },
      { category: "Vendors", cost: 262000 },
      { category: "Travel", cost: 60000 },
      { category: "Other", cost: 52000 },
    ],
    monthly: [
      { label: "Jan", cost: 38000, budget: 36000 },
      { label: "Feb", cost: 42000, budget: 38000 },
      { label: "Mar", cost: 45000, budget: 42000 },
      { label: "Apr", cost: 41000, budget: 39000 },
      { label: "May", cost: 46000, budget: 43000 },
      { label: "Jun", cost: 43000, budget: 41000 },
    ],
    vendors: [
      { vendor: "Fixtures Co", spend: 198000 },
      { vendor: "Flooring Ltd", spend: 156000 },
      { vendor: "Lighting Hub", spend: 141000 },
      { vendor: "Fabric World", spend: 104000 },
    ],
    overruns: [
      { project: "Modern Office", overrun: 38000 },
      { project: "Boutique Hotel", overrun: 26000 },
      { project: "Corporate HQ", overrun: 21000 },
    ],
  },
}

export default function CostPage() {
  const [period, setPeriod] = useState<Period>("quarter")
  const { byCategory, monthly, vendors, overruns } = datasets[period]

  const total = useMemo(() => monthly.reduce((s, m) => s + m.cost, 0), [monthly])
  const avg = useMemo(() => Math.round(total / Math.max(1, monthly.length)), [total, monthly])

  return (
    <main className="flex-1 space-y-6 p-6">
      {/* 1) KPI strip */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Total Cost</div>
          <div className="text-xl font-semibold text-gray-900">{formatGBP(total)}</div>
          <div className="text-xs text-gray-500">Selected period</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Avg / Period</div>
          <div className="text-xl font-semibold text-gray-900">{formatGBP(avg)}</div>
          <div className="text-xs text-gray-500">Cost per interval</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Top Category</div>
          <div className="text-xl font-semibold text-gray-900">{byCategory[0].category}</div>
          <div className="text-xs text-gray-500">{formatGBP(byCategory[0].cost)}</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Vendors</div>
          <div className="text-xl font-semibold text-gray-900">{vendors.length}</div>
          <div className="text-xs text-gray-500">Active this period</div>
        </div>
      </section>

      {/* 2) Filter row */}
      <div className="flex items-center justify-between gap-3">
        <PeriodFilter period={period} onChange={setPeriod} />
      </div>

      {/* 3) Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Cost by Category" description="Current period">
          <ChartContainer config={{ cost: { label: "Cost", color: "hsl(var(--chart-3))" } }} className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCategory} margin={{ top: 10, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" tickLine={false} axisLine={false} />
                <YAxis tickFormatter={formatGBP} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent valueFormatter={(v) => formatGBP(Number(v))} />} />
                <Legend />
                <Bar dataKey="cost" fill="var(--color-cost)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>

        <ChartCard title="Monthly Cost vs Budget" description="Variance over time">
          <ChartContainer
            config={{
              cost: { label: "Cost", color: "hsl(var(--chart-3))" },
              budget: { label: "Budget", color: "hsl(var(--chart-4))" },
            }}
            className="h-[260px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly} margin={{ top: 10, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickFormatter={formatGBP} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent valueFormatter={(v) => formatGBP(Number(v))} />} />
                <Legend />
                <Area type="monotone" dataKey="cost" stroke="var(--color-cost)" fill="transparent" />
                <Area type="monotone" dataKey="budget" stroke="var(--color-budget)" fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>

        <ChartCard title="Vendor Spend" description="Top vendors">
          <ChartContainer config={{ spend: { label: "Spend", color: "hsl(var(--chart-1))" } }} className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vendors} layout="vertical" margin={{ top: 10, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={formatGBP} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="vendor" tickLine={false} axisLine={false} width={120} />
                <ChartTooltip content={<ChartTooltipContent valueFormatter={(v) => formatGBP(Number(v))} />} />
                <Bar dataKey="spend" fill="var(--color-spend)" radius={[4, 4, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>

        <ChartCard title="Cost Overruns" description="Projects exceeding budget">
          <ChartContainer
            config={{ overrun: { label: "Overrun", color: "hsl(var(--chart-5))" } }}
            className="h-[260px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overruns} margin={{ top: 10, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="project" tickLine={false} axisLine={false} />
                <YAxis tickFormatter={formatGBP} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent valueFormatter={(v) => formatGBP(Number(v))} />} />
                <Bar dataKey="overrun" fill="var(--color-overrun)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>
      </div>
    </main>
  )
}
