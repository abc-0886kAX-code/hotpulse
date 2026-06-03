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

const INDEX_COLORS: Record<string, string> = {
  '000001.SS': '#dc2626',
  '399001.SZ': '#2563eb',
  '399006.SZ': '#7c3aed',
  '^IXIC': '#0891b2',
  '^GSPC': '#059669',
  '^DJI': '#d97706',
  '^HSI': '#e11d48',
  '^N225': '#4f46e5',
  '^FTSE': '#0d9488',
  '^GDAXI': '#ea580c',
}

const DEFAULT_COLOR = '#6366f1'

export default function MarketIndexCard({ stock, history, locale }: MarketIndexCardProps) {
  const display = stockDisplayNames[stock.symbol] ?? { zh: stock.name, en: stock.name }
  const isPositive = stock.change_pct >= 0
  const lineColor = INDEX_COLORS[stock.symbol] ?? DEFAULT_COLOR

  const priceChange = stock.price * (stock.change_pct / 100)
  const formattedChange = Math.abs(priceChange).toFixed(2)

  return (
    <div className="card-hover rounded-2xl border border-slate-200/80 bg-white p-5">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">
            {locale === 'zh' ? display.zh : display.en}
          </h3>
          <p className="text-xs text-slate-400">{stock.symbol}</p>
        </div>
        <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
          isPositive
            ? 'stock-up-bg stock-up border border-red-200'
            : 'stock-down-bg stock-down border border-green-200'
        }`}>
          {isPositive ? '+' : ''}{stock.change_pct.toFixed(2)}%
        </span>
      </div>

      <div className="mb-4">
        <p className={`text-3xl font-bold tracking-tight ${isPositive ? 'stock-up' : 'stock-down'}`}>
          {stock.price.toFixed(2)}
        </p>
        <p className={`text-xs ${isPositive ? 'stock-up' : 'stock-down'}`}>
          {isPositive ? '+' : '-'}{formattedChange}
        </p>
      </div>

      {history.length >= 2 ? (
        <ResponsiveContainer width="100%" height={80}>
          <AreaChart data={history}>
            <defs>
              <linearGradient id={`grad-${stock.symbol}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isPositive ? '#ef4444' : '#22c55e'} stopOpacity={0.2} />
                <stop offset="95%" stopColor={isPositive ? '#ef4444' : '#22c55e'} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="price"
              stroke={isPositive ? '#ef4444' : '#22c55e'}
              strokeWidth={2}
              fill={`url(#grad-${stock.symbol})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex h-[80px] items-center justify-center rounded-lg bg-slate-50">
          <p className="text-xs text-slate-300">{locale === 'zh' ? '暂无历史数据' : 'No history'}</p>
        </div>
      )}
    </div>
  )
}
