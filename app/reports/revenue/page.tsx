"use client"

import { useMemo, useState } from "react"
import { ChartCard } from "@/components/reports/chart-card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { PeriodFilter, type Period } from "@/components/reports/period-filter"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { exportToCSV } from "@/lib/export-csv"

const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 })
const formatGBP = (n: number) => gbp.format(Number(n || 0))

type Month = { label: string; current: number; target: number; lastYear: number }
type Project = { project: string; revenue: number }
type Channel = { name: string; value: number }

const datasets: Record<Period, { monthly: Month[]; byProject: Project[]; channels: Channel[] }> = {
  month: {
    monthly: [
      { label: "W1", current: 26000, target: 24000, lastYear: 22000 },
      { label: "W2", current: 28000, target: 25000, lastYear: 23000 },
      { label: "W3", current: 21000, target: 22000, lastYear: 20000 },
      { label: "W4", current: 25000, target: 24000, lastYear: 21000 },
    ],
    byProject: [
      { project: "Luxury Penthouse", revenue: 58000 },
      { project: "Modern Office", revenue: 51000 },
      { project: "Boutique Hotel", revenue: 47000 },
      { project: "Kitchen Remodel", revenue: 32000 },
      { project: "Corporate HQ", revenue: 56000 },
    ],
    channels: [
      { name: "Referral", value: 45 },
      { name: "Inbound", value: 30 },
      { name: "Outbound", value: 25 },
    ],
  },
  quarter: {
    monthly: [
      { label: "Jan", current: 82000, target: 78000, lastYear: 70000 },
      { label: "Feb", current: 91000, target: 80000, lastYear: 76000 },
      { label: "Mar", current: 98000, target: 86000, lastYear: 82000 },
    ],
    byProject: [
      { project: "Luxury Penthouse", revenue: 158000 },
      { project: "Modern Office", revenue: 131000 },
      { project: "Boutique Hotel", revenue: 124000 },
      { project: "Kitchen Remodel", revenue: 82000 },
      { project: "Corporate HQ", revenue: 142000 },
    ],
    channels: [
      { name: "Referral", value: 43 },
      { name: "Inbound", value: 34 },
      { name: "Outbound", value: 23 },
    ],
  },
  year: {
    monthly: [
      { label: "Jan", current: 82000, target: 78000, lastYear: 70000 },
      { label: "Feb", current: 91000, target: 80000, lastYear: 76000 },
      { label: "Mar", current: 98000, target: 86000, lastYear: 82000 },
      { label: "Apr", current: 102000, target: 92000, lastYear: 86000 },
      { label: "May", current: 97000, target: 90000, lastYear: 84000 },
      { label: "Jun", current: 108000, target: 95000, lastYear: 90000 },
    ],
    byProject: [
      { project: "Luxury Penthouse", revenue: 280000 },
      { project: "Modern Office", revenue: 250000 },
      { project: "Boutique Hotel", revenue: 230000 },
      { project: "Kitchen Remodel", revenue: 160000 },
      { project: "Corporate HQ", revenue: 270000 },
    ],
    channels: [
      { name: "Referral", value: 44 },
      { name: "Inbound", value: 33 },
      { name: "Outbound", value: 23 },
    ],
  },
}

export default function RevenuePage() {
  const [period, setPeriod] = useState<Period>("quarter")
  const { monthly, byProject, channels } = datasets[period]

  const total = useMemo(() => monthly.reduce((s, m) => s + m.current, 0), [monthly])
  const target = useMemo(() => monthly.reduce((s, m) => s + m.target, 0), [monthly])
  const yoy = useMemo(() => {
    const last = monthly.reduce((s, m) => s + m.lastYear, 0)
    return Math.round(((total - last) / Math.max(1, last)) * 100)
  }, [monthly, total])

  function doExport() {
    exportToCSV(
      "revenue-monthly.csv",
      monthly.map((m) => ({ Period: m.label, Revenue: m.current, Target: m.target, "Last Year": m.lastYear })),
    )
  }

  return (
    <main className="flex-1 space-y-6 p-6">
      {/* 1) KPI strip */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Total Revenue</div>
          <div className="text-xl font-semibold text-gray-900">{formatGBP(total)}</div>
          <div className="text-xs text-gray-500">Selected period</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Target</div>
          <div className="text-xl font-semibold text-gray-900">{formatGBP(target)}</div>
          <div className="text-xs text-gray-500">Goal for period</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Variance</div>
          <div className="text-xl font-semibold text-gray-900">{formatGBP(total - target)}</div>
          <div className="text-xs text-gray-500">Revenue − Target</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm font-medium text-gray-600">YoY change</div>
          <div className="text-xl font-semibold text-gray-900">{yoy}%</div>
          <div className="text-xs text-gray-500">Vs last year</div>
        </div>
      </section>

      {/* 2) Filter row */}
      <div className="flex items-center justify-between gap-3">
        <PeriodFilter period={period} onChange={setPeriod} />
        <Button variant="outline" size="sm" onClick={doExport}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* 3) Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Revenue vs Target" description="Period performance">
          <ChartContainer
            config={{
              current: { label: "Revenue", color: "hsl(var(--chart-1))" },
              target: { label: "Target", color: "hsl(var(--chart-4))" },
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
                <Area type="monotone" dataKey="current" stroke="var(--color-current)" fill="transparent" />
                <Area type="monotone" dataKey="target" stroke="var(--color-target)" fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>

        <ChartCard title="Revenue YoY" description="Current vs last year">
          <ChartContainer
            config={{
              current: { label: "Current", color: "hsl(var(--chart-1))" },
              lastYear: { label: "Last Year", color: "hsl(var(--chart-3))" },
            }}
            className="h-[260px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly} margin={{ top: 10, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickFormatter={formatGBP} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent valueFormatter={(v) => formatGBP(Number(v))} />} />
                <Legend />
                <Bar dataKey="current" fill="var(--color-current)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lastYear" fill="var(--color-lastYear)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>

        <ChartCard title="Revenue by Project" description="Top contributors">
          <ChartContainer
            config={{ revenue: { label: "Revenue", color: "hsl(var(--chart-2))" } }}
            className="h-[260px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byProject} margin={{ top: 10, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="project" tickLine={false} axisLine={false} />
                <YAxis tickFormatter={formatGBP} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent valueFormatter={(v) => formatGBP(Number(v))} />} />
                <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>

        <ChartCard title="Revenue by Channel" description="Source mix">
          <ChartContainer
            config={{
              referral: { label: "Referral", color: "hsl(var(--chart-5))" },
              inbound: { label: "Inbound", color: "hsl(var(--chart-2))" },
              outbound: { label: "Outbound", color: "hsl(var(--chart-4))" },
            }}
            className="h-[260px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={channels.map((c) => ({ name: c.name, value: c.value }))}
                layout="vertical"
                margin={{ top: 10, right: 16, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={120} />
                <ChartTooltip content={<ChartTooltipContent valueFormatter={(v) => `${v}%`} />} />
                <Bar dataKey="value" radius={[4, 4, 4, 4]} fill="var(--color-inbound)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>
      </div>
    </main>
  )
}
