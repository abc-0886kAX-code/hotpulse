'use client'

import { ResponsiveContainer, LineChart, Line } from 'recharts'

interface SparklineChartProps {
  data: { price: number }[]
  positive: boolean
}

export default function SparklineChart({ data, positive }: SparklineChartProps) {
  if (data.length < 2) return null

  return (
    <ResponsiveContainer width="100%" height={80}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="price"
          stroke={positive ? '#22c55e' : '#ef4444'}
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
