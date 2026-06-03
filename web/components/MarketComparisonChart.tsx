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
  '#dc2626', '#2563eb', '#7c3aed', '#0891b2',
  '#059669', '#d97706', '#e11d48', '#4f46e5',
  '#0d9488', '#ea580c',
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
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6">
      <div className="mb-1 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-700">
            {locale === 'zh' ? `近 ${days} 天走势对比` : `${days}-Day Comparison`}
          </h3>
          <p className="text-xs text-slate-400">
            {locale === 'zh' ? '以首日为基准，展示各指数涨跌幅度' : 'Normalized to day 1 baseline'}
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={merged}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            interval="preserveStartEnd"
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickFormatter={(v: number) => `${v > 0 ? '+' : ''}${v}%`}
            axisLine={false}
            tickLine={false}
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
              return [` ${num > 0 ? '+' : ''}${num.toFixed(2)}%`, label]
            }}
            contentStyle={{
              fontSize: 12,
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
            }}
          />
          <Legend
            formatter={(value: string) => {
              const display = stockDisplayNames[value]
              return locale === 'zh' ? (display?.zh ?? value) : (display?.en ?? value)
            }}
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            iconType="circle"
            iconSize={8}
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
              activeDot={{ r: 4, strokeWidth: 2 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
