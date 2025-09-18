import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { CartesianGrid, Legend, Line, LineChart, XAxis, YAxis } from 'recharts';
import { ChartCard } from './chart-card';

const chartConfig = {
  Billable: {
    label: 'Billable',
    color: '#FACC15',
  },
  Nonbillable: {
    label: 'Nonbillable',
    color: '#FDE68A',
  },
} satisfies ChartConfig;

const data = [
  {
    name: 'Week 1',
    Billable: '40',
    Nonbillable: '20',
  },

  {
    name: 'Week 2',
    Billable: '70',
    Nonbillable: '10',
  },

  {
    name: 'Week 3',
    Billable: '60',
    Nonbillable: '30',
  },

  {
    name: 'Week 4',
    Billable: '40',
    Nonbillable: '10',
  },
];

const MemberWeekSummary = () => {
  return (
    <ChartCard title="Monthly Task Productivity Trend" description="Billable share of time by week">
      <ChartContainer className="h-[260px] w-full" config={chartConfig}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} strokeDasharray="2 2" />
          <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fill: '#6B7280', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            domain={[0, 60]}
            label={{
              value: 'Tasks Completed',
              angle: -90,
              position: 'insideLeft',
              style: { fill: '#6B7280', fontSize: 12 },
            }}
          />
          <ChartTooltip
            cursor={{ stroke: '#E5E7EB', strokeWidth: 1 }}
            content={props => (
              <ChartTooltipContent
                {...props}
                labelFormatter={value => value}
                nameFormatter={name =>
                  ({
                    Billable: 'Billable',
                    Nonbillable: 'Nonbillable',
                  }[name] ?? name)
                }
              />
            )}
          />

          <Legend
            verticalAlign="bottom"
            iconType="circle"
            formatter={value => <span className="text-[12px] mx-1 text-gray-700 capitalize">{value}</span>}
          />
          <Line
            type="monotone"
            dataKey="Billable"
            stroke="#efeae2"
            strokeWidth={3}
            dot={{ r: 5, stroke: '#837e72', strokeWidth: 1, fill: '#837e72' }}
          />
          <Line
            type="monotone"
            dataKey="Nonbillable"
            stroke="#837e72"
            strokeWidth={3}
            dot={{ r: 5, stroke: '#837e72', strokeWidth: 1, fill: '#837e72' }}
          />
        </LineChart>
      </ChartContainer>
    </ChartCard>
  );
};

export default MemberWeekSummary;
