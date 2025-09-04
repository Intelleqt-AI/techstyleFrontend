import { Bar, BarChart, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useState } from 'react';
import { ChartCard } from './chart-card';

const chartConfig = {
  Fulfilled: {
    label: 'Fulfilled',
    color: 'hsl(var(--chart-1))',
  },
  Goal: {
    label: 'Goal',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

function getWeeklyWorkTimeTotals(tasks) {
  const dailyTotals = new Map();
  const today = new Date();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - today.getDay());

  for (let i = 0; i < 7; i++) {
    const date = new Date(sunday);
    date.setDate(sunday.getDate() + i);
    const formattedDate = date.toISOString().split('T')[0];
    dailyTotals.set(formattedDate, 0);
  }

  tasks.forEach(task => {
    if (!Array.isArray(task.session)) return;
    task.session.forEach(session => {
      if (typeof session.totalTime !== 'number' || !session.date) return;
      const sessionDate = new Date(session.date);
      const formattedDate = sessionDate.toISOString().split('T')[0];
      if (dailyTotals.has(formattedDate)) {
        dailyTotals.set(formattedDate, dailyTotals.get(formattedDate) + session.totalTime);
      }
    });
  });

  const result = Array.from(dailyTotals.entries()).map(([date, totalTime]) => ({
    date,
    Fulfilled: (totalTime / (1000 * 60) / 60).toFixed(2),
    Goal: 60,
  }));

  // Sort by date
  result.sort((a, b) => a.date.localeCompare(b.date));
  return result;
}

export function ReportBar({ tracking, onBarClick, title = 'Daily Hours Overview' }) {
  const dailyData = getWeeklyWorkTimeTotals(tracking);

  // Custom click handler for the bar chart
  const handleBarClick = (data, index) => {
    if (onBarClick) {
      onBarClick(data.activePayload[0].payload);
    }
  };

  return (
    <ChartCard title="Daily Hours Logged" description="Billable share of time by week">
      <ChartContainer className="h-[260px] w-full" config={chartConfig}>
        <BarChart accessibilityLayer data={dailyData} onClick={handleBarClick}>
          <XAxis
            dataKey="date"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={value => {
              return new Date(value).toLocaleDateString('en-US', {
                weekday: 'short',
              });
            }}
          />

          {/* Add YAxis here */}
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#6B7280', fontSize: 12 }}
            domain={[0, 60]} // max value
            ticks={[0, 15, 30, 45, 60]}
            label={{
              value: 'Hours Worked',
              angle: -90,
              position: 'insideLeft',
              offset: 0,
              style: { fill: '#6B7280', fontSize: 12 }, // Match image style
            }}
          />

          <Bar
            dataKey="Fulfilled"
            stackId="a"
            fill="#000" // Matching yellow from image
            radius={[0, 0, 4, 4]}
            cursor="pointer"
          />
          <Bar className="" dataKey="Goal" stackId="a" fill="#f1f1f1" radius={[4, 4, 0, 0]} cursor="pointer" />

          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={value => {
                  return new Date(value).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  });
                }}
              />
            }
            cursor={false}
            defaultIndex={1}
          />
        </BarChart>
      </ChartContainer>
    </ChartCard>
  );
}
