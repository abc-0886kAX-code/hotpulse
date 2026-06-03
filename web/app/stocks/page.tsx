'use client'

import { useState, useEffect, useMemo } from 'react'
import { useApp } from '@/lib/app-context'
import { t } from '@/lib/i18n'
import { fetchStocks, fetchAllStockHistory, fetchStockAnalysis } from '@/lib/api'
import type { StockIndex, StockHistoryPoint, MarketAnalysis } from '@/lib/api'
import MarketIndexCard from '@/components/MarketIndexCard'
import MarketComparisonChart from '@/components/MarketComparisonChart'
import EmptyState from '@/components/EmptyState'
import ViewTabs from '@/components/ViewTabs'

export default function StocksPage() {
  const { locale } = useApp()
  const [viewMode, setViewMode] = useState('market')
  const [stocks, setStocks] = useState<StockIndex[]>([])
  const [history, setHistory] = useState<Record<string, StockHistoryPoint[]>>({})
  const [days, setDays] = useState(30)
  const [analysis, setAnalysis] = useState<MarketAnalysis | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const stockData = await fetchStocks().catch(() => [])
        setStocks(stockData)

        const historyData = await fetchAllStockHistory(days).catch(() => ({}))
        setHistory(historyData)
      } catch {
        setStocks([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [days])

  useEffect(() => {
    if (viewMode === 'ai') {
      fetchStockAnalysis().then(setAnalysis).catch(() => setAnalysis(null))
    }
  }, [viewMode])

  const handleExportCSV = () => {
    if (stocks.length === 0) return
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

  const summary = useMemo(() => {
    const rising = stocks.filter(s => s.change_pct > 0).length
    const falling = stocks.filter(s => s.change_pct < 0).length
    return { rising, falling, total: stocks.length }
  }, [stocks])

  const stocksTabs = [
    { key: 'market', label: locale === 'zh' ? '行情数据' : 'Market' },
    { key: 'ai', label: locale === 'zh' ? 'AI 分析' : 'AI Analysis' },
  ]

  const timeRanges = [
    { key: 7, label: '7D' },
    { key: 30, label: '30D' },
    { key: 90, label: '90D' },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-slate-900">
            {t(locale, 'stock.overview')}
          </h2>
          <ViewTabs tabs={stocksTabs} active={viewMode} onChange={setViewMode} />
        </div>
        <div className="flex items-center gap-3">
          {viewMode === 'market' && (
            <>
              <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
                {timeRanges.map((tr) => (
                  <button
                    key={tr.key}
                    onClick={() => setDays(tr.key)}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                      days === tr.key
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tr.label}
                  </button>
                ))}
              </div>
              <button
                onClick={handleExportCSV}
                className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-sm text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-700"
              >
                {t(locale, 'export.csv')}
              </button>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          {locale === 'zh' ? '加载中...' : 'Loading...'}
        </div>
      ) : viewMode === 'ai' ? (
        <div className="mx-auto max-w-3xl">
          {analysis ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-2 text-sm font-medium text-blue-600">
                {locale === 'zh' ? 'AI 市场分析' : 'AI Market Analysis'}
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                {new Date(analysis.generated_at).toLocaleString()}
              </p>
              <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                {locale === 'zh' ? analysis.content_zh : analysis.content_en}
              </div>
            </div>
          ) : (
            <EmptyState locale={locale} message={locale === 'zh' ? '暂无 AI 分析报告' : 'No AI analysis available'} />
          )}
        </div>
      ) : stocks.length > 0 ? (
        <>
          <div className="mb-4 grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-slate-200 bg-white p-3 text-center">
              <p className="text-xs text-slate-400">{locale === 'zh' ? '监测指数' : 'Tracked'}</p>
              <p className="text-xl font-bold text-slate-900">{summary.total}</p>
            </div>
            <div className="rounded-lg border border-green-100 bg-green-50 p-3 text-center">
              <p className="text-xs text-green-600">{locale === 'zh' ? '上涨' : 'Rising'}</p>
              <p className="text-xl font-bold text-green-600">{summary.rising}</p>
            </div>
            <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-center">
              <p className="text-xs text-red-600">{locale === 'zh' ? '下跌' : 'Falling'}</p>
              <p className="text-xl font-bold text-red-600">{summary.falling}</p>
            </div>
          </div>

          <MarketComparisonChart history={history} locale={locale} days={days} />

          <h3 className="mb-4 mt-6 text-sm font-medium text-slate-500">
            {locale === 'zh' ? '各指数详情' : 'Index Details'}
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {stocks.map((stock) => (
              <MarketIndexCard
                key={stock.id}
                stock={stock}
                history={history[stock.symbol] ?? []}
                locale={locale}
              />
            ))}
          </div>
        </>
      ) : (
        <EmptyState locale={locale} />
      )}
    </div>
  )
}
