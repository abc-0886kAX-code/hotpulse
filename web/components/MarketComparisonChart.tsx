'use client'

import { type StockHistoryPoint } from '@/lib/api'
import { type Locale } from '@/lib/i18n'
import { stockDisplayNames } from '@/lib/i18n'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  Tooltip, Legend, CartesianGrid,
} from 'recharts'

interface MarketComparisonChartProps {
  history: Record<string, StockHistoryPoint[]>
  locale: Locale
  days: number
}

const COLORS = [
  '#2563eb', '#ef4444', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#10b981', '#f97316', '#ec4899',
  '#6366f1', '#14b8a6',
]

export default function MarketComparisonChart({ history, locale, days }: MarketComparisonChartProps) {
  const symbols = Object.keys(history).filter(s => history[s].length >= 2)
  if (symbols.length === 0) return null

  const maxLen = Math.max(...symbols.map(s => history[s].length))
  const merged: Record<string, string | number>[] = []
  for (let i = 0; i < maxLen; i++) {
    const point: Record<string, string | number> = {}
    for (const sym of symbols) {
      const h = history[sym]
      if (i < h.length) {
        point.date = new Date(h[i].snapshot_time).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' })
        const first = h[0].price
        point[sym] = Math.round((h[i].price - first) / first * 10000) / 100
      }
    }
    merged.push(point)
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-1 text-sm font-medium text-slate-500">
        {locale === 'zh' ? `近 ${days} 天走势对比（%）` : `${days}-Day Comparison (%)`}
      </h3>
      <p className="mb-4 text-xs text-slate-400">
        {locale === 'zh' ? '以首日为基准，展示各指数涨跌幅度' : 'Normalized to day 1 baseline'}
      </p>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={merged}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickFormatter={(v: number) => `${v > 0 ? '+' : ''}${v}%`}
          />
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Tooltip
            formatter={(value: any, name: any) => {
              const num = Number(value)
              const key = String(name ?? '')
              const display = stockDisplayNames[key]
              const label = locale === 'zh'
                ? (display?.zh ?? key)
                : (display?.en ?? key)
              return [`${num > 0 ? '+' : ''}${num}%`, label]
            }}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          <Legend
            formatter={(value: string) => {
              const display = stockDisplayNames[value]
              return locale === 'zh' ? (display?.zh ?? value) : (display?.en ?? value)
            }}
            wrapperStyle={{ fontSize: 12 }}
          />
          {symbols.map((sym, idx) => (
            <Line
              key={sym}
              type="monotone"
              dataKey={sym}
              stroke={COLORS[idx % COLORS.length]}
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
