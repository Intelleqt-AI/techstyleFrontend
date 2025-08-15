"use client"

import { useMemo, useState } from "react"
import { ChartCard } from "@/components/reports/chart-card"
import { PeriodFilter, type Period } from "@/components/reports/period-filter"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
} from "recharts"

type Stage = { stage: string; count: number }
type Month = { label: string; current: number; lastYear: number }
type Source = { name: string; value: number }

const datasets: Record<
  Period,
  { pipeline: Stage[]; monthly: Month[]; sources: Source[]; avgDeal: number; won: number }
> = {
  month: {
    pipeline: [
      { stage: "Leads", count: 38 },
      { stage: "Qualified", count: 21 },
      { stage: "Proposal", count: 12 },
      { stage: "Negotiation", count: 7 },
      { stage: "Won", count: 5 },
    ],
    monthly: [
      { label: "W1", current: 5, lastYear: 4 },
      { label: "W2", current: 6, lastYear: 3 },
      { label: "W3", current: 4, lastYear: 3 },
      { label: "W4", current: 7, lastYear: 5 },
    ],
    sources: [
      { name: "Referral", value: 14 },
      { name: "Website", value: 9 },
      { name: "Social", value: 6 },
      { name: "Outbound", value: 3 },
    ],
    avgDeal: 18000,
    won: 5,
  },
  quarter: {
    pipeline: [
      { stage: "Leads", count: 94 },
      { stage: "Qualified", count: 57 },
      { stage: "Proposal", count: 28 },
      { stage: "Negotiation", count: 16 },
      { stage: "Won", count: 13 },
    ],
    monthly: [
      { label: "Jan", current: 18, lastYear: 14 },
      { label: "Feb", current: 19, lastYear: 16 },
      { label: "Mar", current: 22, lastYear: 17 },
    ],
    sources: [
      { name: "Referral", value: 28 },
      { name: "Website", value: 19 },
      { name: "Social", value: 12 },
      { name: "Outbound", value: 8 },
    ],
    avgDeal: 19500,
    won: 13,
  },
  year: {
    pipeline: [
      { stage: "Leads", count: 360 },
      { stage: "Qualified", count: 210 },
      { stage: "Proposal", count: 122 },
      { stage: "Negotiation", count: 66 },
      { stage: "Won", count: 54 },
    ],
    monthly: [
      { label: "Jan", current: 18, lastYear: 14 },
      { label: "Feb", current: 19, lastYear: 16 },
      { label: "Mar", current: 22, lastYear: 17 },
      { label: "Apr", current: 21, lastYear: 18 },
      { label: "May", current: 20, lastYear: 19 },
      { label: "Jun", current: 24, lastYear: 20 },
    ],
    sources: [
      { name: "Referral", value: 120 },
      { name: "Website", value: 88 },
      { name: "Social", value: 62 },
      { name: "Outbound", value: 44 },
    ],
    avgDeal: 20500,
    won: 54,
  },
}

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"]

export default function SalesPage() {
  const [period, setPeriod] = useState<Period>("quarter")
  const { pipeline, monthly, sources, avgDeal, won } = datasets[period]

  const totalOpen = useMemo(() => pipeline.slice(0, -1).reduce((s, p) => s + p.count, 0), [pipeline])
  const winRate = useMemo(() => Math.round((won / Math.max(1, totalOpen + won)) * 100), [won, totalOpen])

  return (
    <main className="flex-1 space-y-6 p-6">
      {/* 1) KPI strip */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Open Opportunities</div>
          <div className="text-xl font-semibold text-gray-900">{totalOpen}</div>
          <div className="text-xs text-gray-500">Across stages</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Won (period)</div>
          <div className="text-xl font-semibold text-gray-900">{won}</div>
          <div className="text-xs text-gray-500">Closed won</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Win Rate</div>
          <div className="text-xl font-semibold text-gray-900">{winRate}%</div>
          <div className="text-xs text-gray-500">Won / (Open + Won)</div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm font-medium text-gray-600">Avg Deal Size</div>
          <div className="text-xl font-semibold text-gray-900">£{avgDeal.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Estimate</div>
        </div>
      </section>

      {/* 2) Filter row */}
      <div className="flex items-center justify-between gap-3">
        <PeriodFilter period={period} onChange={setPeriod} />
      </div>

      {/* 3) Charts (4 sections) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Sales vs Last Year" description="Won deals by period">
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
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="current" fill="var(--color-current)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lastYear" fill="var(--color-lastYear)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>

        <ChartCard title="Sales by Period" description="Trend line">
          <ChartContainer config={{ current: { label: "Sales", color: "hsl(var(--chart-2))" } }} className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly} margin={{ top: 10, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="current" stroke="var(--color-current)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>

        <ChartCard title="Pipeline by Stage" description="Volume of deals">
          <ChartContainer config={{ count: { label: "Count", color: "hsl(var(--chart-5))" } }} className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipeline} margin={{ top: 10, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>

        <ChartCard title="Win Rate by Source" description="Contribution by channel">
          <ChartContainer
            config={{
              referral: { label: "Referral", color: "hsl(var(--chart-1))" },
              website: { label: "Website", color: "hsl(var(--chart-2))" },
              social: { label: "Social", color: "hsl(var(--chart-4))" },
              outbound: { label: "Outbound", color: "hsl(var(--chart-5))" },
            }}
            className="h-[260px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie data={sources} dataKey="value" nameKey="name" outerRadius={90} innerRadius={54} strokeWidth={0}>
                  {sources.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>
      </div>
    </main>
  )
}
