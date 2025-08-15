"use client"

type MiniBarChartProps = {
  values: number[]
  max?: number
  className?: string
  height?: number
}

export function MiniBarChart({ values, max, className, height = 56 }: MiniBarChartProps) {
  const maxVal = max ?? Math.max(1, ...values)
  const width = Math.max(100, values.length * 12)
  const barWidth = 8
  const gap = 4

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      className={className}
      role="img"
      aria-label="Mini bar chart"
    >
      {values.map((v, i) => {
        const h = Math.max(1, (v / maxVal) * (height - 6))
        const x = i * (barWidth + gap)
        const y = height - h
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barWidth}
            height={h}
            rx={2}
            className="fill-gray-300"
          />
        )
      })}
    </svg>
  )
}
