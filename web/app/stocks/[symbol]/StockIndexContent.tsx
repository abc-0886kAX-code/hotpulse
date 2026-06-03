'use client'

import { useState, useEffect } from 'react'
import { fetchStockKLine } from '@/lib/api'
import type { StockKLine } from '@/lib/api'
import CandlestickChart from '@/components/CandlestickChart'
import EmptyState from '@/components/EmptyState'

interface Props {
  symbol: string
  nameZh: string
}

export default function StockIndexContent({ symbol, nameZh }: Props) {
  const [klineData, setKlineData] = useState<StockKLine[]>([])
  const [days, setDays] = useState(30)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchStockKLine(symbol, days)
      .then(setKlineData)
      .catch(() => setKlineData([]))
      .finally(() => setLoading(false))
  }, [symbol, days])

  const timeRanges = [
    { key: 7, label: '7天' },
    { key: 30, label: '30天' },
    { key: 90, label: '90天' },
  ]

  const latest = klineData.length > 0 ? klineData[klineData.length - 1] : null

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {timeRanges.map((tr) => (
          <button
            key={tr.key}
            onClick={() => setDays(tr.key)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
              days === tr.key ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {tr.label}
          </button>
        ))}
      </div>

      {latest && (
        <div className="flex items-center gap-6 rounded-xl border border-slate-200/80 bg-white p-4">
          <div>
            <p className="text-xs text-slate-400">最新收盘</p>
            <p className={`text-2xl font-bold ${(latest.change_pct ?? 0) >= 0 ? 'stock-up' : 'stock-down'}`}>
              {latest.close.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">涨跌幅</p>
            <p className={`text-lg font-bold ${(latest.change_pct ?? 0) >= 0 ? 'stock-up' : 'stock-down'}`}>
              {(latest.change_pct ?? 0) >= 0 ? '+' : ''}{(latest.change_pct ?? 0).toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">日期</p>
            <p className="text-sm text-slate-600">{latest.date}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex h-[500px] items-center justify-center rounded-2xl border border-slate-200/80 bg-white">
          <p className="text-slate-400">加载K线数据...</p>
        </div>
      ) : klineData.length > 0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4">
          <CandlestickChart data={klineData} height={500} />
        </div>
      ) : (
        <EmptyState locale="zh" />
      )}
    </div>
  )
}
