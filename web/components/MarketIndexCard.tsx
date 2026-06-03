'use client'

import { type StockIndex } from '@/lib/api'
import { type Locale } from '@/lib/i18n'
import { stockDisplayNames } from '@/lib/i18n'
import { ResponsiveContainer, AreaChart, Area } from 'recharts'

interface MarketIndexCardProps {
  stock: StockIndex
  history: { price: number }[]
  locale: Locale
}

const COLORS = [
  '#2563eb', '#ef4444', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#10b981', '#f97316', '#ec4899',
  '#6366f1', '#14b8a6',
]

export default function MarketIndexCard({ stock, history, locale }: MarketIndexCardProps) {
  const display = stockDisplayNames[stock.symbol] ?? { zh: stock.name, en: stock.name }
  const isPositive = stock.change_pct >= 0
  const colorIdx = Object.keys(stockDisplayNames).indexOf(stock.symbol)
  const lineColor = COLORS[Math.max(0, colorIdx) % COLORS.length]

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-500">
          {locale === 'zh' ? display.zh : display.en}
        </h3>
        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
          isPositive
            ? 'bg-green-50 text-green-600'
            : 'bg-red-50 text-red-600'
        }`}>
          {isPositive ? '+' : ''}{stock.change_pct.toFixed(2)}%
        </span>
      </div>
      <p className="mb-3 text-3xl font-bold text-slate-900">
        {stock.price.toFixed(2)}
      </p>
      {history.length >= 2 ? (
        <ResponsiveContainer width="100%" height={100}>
          <AreaChart data={history}>
            <defs>
              <linearGradient id={`grad-${stock.symbol}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={lineColor} stopOpacity={0.15} />
                <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="price"
              stroke={lineColor}
              strokeWidth={2}
              fill={`url(#grad-${stock.symbol})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-[100px] items-center justify-center text-sm text-slate-300">
          {locale === 'zh' ? '暂无历史数据' : 'No history'}
        </div>
      )}
    </div>
  )
}
