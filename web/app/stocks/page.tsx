'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/lib/app-context'
import { t } from '@/lib/i18n'
import { fetchStocks, fetchAllStockHistory } from '@/lib/api'
import type { StockIndex, StockHistoryPoint } from '@/lib/api'
import StockCard from '@/components/StockCard'

const fallbackStocks: StockIndex[] = [
  { id: '1', symbol: '000001.SS', name: '上证指数', price: 3245.68, change_pct: 1.23, snapshot_time: new Date().toISOString() },
  { id: '2', symbol: '^IXIC', name: '纳斯达克综合', price: 18456.78, change_pct: 0.87, snapshot_time: new Date().toISOString() },
  { id: '3', symbol: '^HSI', name: '恒生指数', price: 18234.56, change_pct: -0.32, snapshot_time: new Date().toISOString() },
  { id: '4', symbol: '^GSPC', name: '标普500', price: 5678.90, change_pct: 0.56, snapshot_time: new Date().toISOString() },
]

export default function StocksPage() {
  const { locale } = useApp()
  const [stocks, setStocks] = useState<StockIndex[]>([])
  const [history, setHistory] = useState<Record<string, StockHistoryPoint[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [stockData, historyData] = await Promise.all([
          fetchStocks().catch(() => []),
          fetchAllStockHistory(30).catch(() => ({})),
        ])
        if (stockData.length > 0) {
          setStocks(stockData)
        } else {
          setStocks(fallbackStocks)
        }
        setHistory(historyData)
      } catch {
        setStocks(fallbackStocks)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleExportCSV = () => {
    const headers = ['Symbol', 'Name', 'Price', 'Change %', 'Time']
    const rows = stocks.map(s => [
      s.symbol, s.name, s.price.toFixed(2),
      `${s.change_pct >= 0 ? '+' : ''}${s.change_pct.toFixed(2)}%`,
      s.snapshot_time,
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hotpulse-stocks-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-zinc-100">
          {t(locale, 'stock.overview')}
        </h2>
        <button
          onClick={handleExportCSV}
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-1.5 text-sm text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200"
        >
          {t(locale, 'export.csv')}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-zinc-500">
          {locale === 'zh' ? '加载中...' : 'Loading...'}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stocks.map((stock) => (
            <StockCard
              key={stock.id}
              stock={stock}
              history={history[stock.symbol] ?? []}
              locale={locale}
            />
          ))}
        </div>
      )}
    </div>
  )
}
