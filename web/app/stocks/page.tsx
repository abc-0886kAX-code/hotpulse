'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useApp } from '@/lib/app-context'
import { t } from '@/lib/i18n'
import { stockDisplayNames } from '@/lib/i18n'
import { fetchStocks, fetchStockKLine, fetchSectorBoards, fetchStockAnalysis, fetchAllStockHistory } from '@/lib/api'
import type { StockIndex, StockHistoryPoint, StockKLine, SectorBoardItem, MarketAnalysis } from '@/lib/api'
import MarketIndexCard from '@/components/MarketIndexCard'
import MarketComparisonChart from '@/components/MarketComparisonChart'
import SectorBoard from '@/components/SectorBoard'
import EmptyState from '@/components/EmptyState'
import ViewTabs from '@/components/ViewTabs'

const CandlestickChart = dynamic(() => import('@/components/CandlestickChart'), { ssr: false })

function StockTicker({ stocks, locale }: { stocks: StockIndex[]; locale: 'zh' | 'en' }) {
  if (stocks.length === 0) return null
  const items = stocks.map(s => {
    const display = stockDisplayNames[s.symbol] ?? { zh: s.name, en: s.name }
    const isPositive = s.change_pct >= 0
    return { ...s, display, isPositive }
  })
  const doubled = [...items, ...items]

  return (
    <div className="mb-6 overflow-hidden rounded-xl border border-slate-200/80 bg-white">
      <div className="ticker-animate flex items-center gap-6 py-3 px-2" style={{ width: 'max-content' }}>
        {doubled.map((item, idx) => (
          <div key={`${item.symbol}-${idx}`} className="flex shrink-0 items-center gap-3 px-4">
            <span className="text-sm font-medium text-slate-600">
              {locale === 'zh' ? item.display.zh : item.display.en}
            </span>
            <span className={`text-sm font-bold ${item.isPositive ? 'stock-up' : 'stock-down'}`}>
              {item.price.toFixed(2)}
            </span>
            <span className={`rounded-md px-1.5 py-0.5 text-xs font-semibold ${
              item.isPositive
                ? 'bg-red-50 text-red-600 border border-red-200'
                : 'bg-green-50 text-green-600 border border-green-200'
            }`}>
              {item.isPositive ? '+' : ''}{item.change_pct.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function StocksPage() {
  const { locale } = useApp()
  const [viewMode, setViewMode] = useState('market')
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null)
  const [klineData, setKlineData] = useState<StockKLine[]>([])
  const [klineLoading, setKlineLoading] = useState(false)
  const [stocks, setStocks] = useState<StockIndex[]>([])
  const [history, setHistory] = useState<Record<string, StockHistoryPoint[]>>({})
  const [sectors, setSectors] = useState<SectorBoardItem[]>([])
  const [sectorType, setSectorType] = useState('industry')
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

  const loadSectors = useCallback(async (type: string) => {
    const data = await fetchSectorBoards(type).catch(() => [])
    setSectors(data)
  }, [])

  useEffect(() => {
    if (viewMode === 'sectors') {
      loadSectors(sectorType)
    }
  }, [viewMode, sectorType, loadSectors])

  useEffect(() => {
    if (viewMode === 'ai') {
      fetchStockAnalysis().then(setAnalysis).catch(() => setAnalysis(null))
    }
  }, [viewMode])

  const handleCardClick = useCallback(async (symbol: string) => {
    setSelectedSymbol(symbol)
    setKlineLoading(true)
    const data = await fetchStockKLine(symbol, days).catch(() => [])
    setKlineData(data)
    setKlineLoading(false)
    setViewMode('kline')
  }, [days])

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
    const avgChange = stocks.length > 0
      ? stocks.reduce((acc, s) => acc + s.change_pct, 0) / stocks.length
      : 0
    return { rising, falling, total: stocks.length, avgChange }
  }, [stocks])

  const tabs = [
    { key: 'market', label: t(locale, 'stock.market') },
    { key: 'kline', label: t(locale, 'stock.kline') },
    { key: 'sectors', label: t(locale, 'stock.sectors') },
    { key: 'ai', label: t(locale, 'stock.ai') },
  ]

  const sectorTabs = [
    { key: 'industry', label: t(locale, 'stock.industry') },
    { key: 'concept', label: t(locale, 'stock.concept') },
  ]

  const timeRanges = [
    { key: 7, label: '7D' },
    { key: 30, label: '30D' },
    { key: 90, label: '90D' },
  ]

  const selectedDisplay = selectedSymbol
    ? (stockDisplayNames[selectedSymbol] ?? { zh: '', en: '' })
    : { zh: '', en: '' }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t(locale, 'stock.overview')}</h1>
          <p className="mt-1 text-sm text-slate-400">
            {locale === 'zh' ? '覆盖全球主要指数，实时追踪市场动态' : 'Tracking major global indices in real-time'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/report" className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:border-blue-200 hover:text-blue-600 hover:shadow-sm">
            <span>📊</span>
            {t(locale, 'report.stock')}
          </Link>
          <Link href="/report/news" className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:border-blue-200 hover:text-blue-600 hover:shadow-sm">
            <span>📰</span>
            {t(locale, 'report.news')}
          </Link>
        </div>
      </div>

      {!loading && <StockTicker stocks={stocks} locale={locale} />}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <ViewTabs tabs={tabs} active={viewMode} onChange={setViewMode} />
        <div className="flex items-center gap-3">
          {(viewMode === 'market' || viewMode === 'kline') && (
            <>
              <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
                {timeRanges.map((tr) => (
                  <button key={tr.key} onClick={() => setDays(tr.key)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${days === tr.key ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    {tr.label}
                  </button>
                ))}
              </div>
              <button onClick={handleExportCSV} className="rounded-xl border border-slate-200 bg-white px-4 py-1.5 text-sm text-slate-500 transition-all hover:border-slate-300 hover:shadow-sm">
                {t(locale, 'export.csv')}
              </button>
            </>
          )}
          {viewMode === 'sectors' && (
            <ViewTabs tabs={sectorTabs} active={sectorType} onChange={(v) => { setSectorType(v) }} />
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-200/80 bg-white p-5">
                <div className="skeleton mb-3 h-4 w-16" />
                <div className="skeleton h-8 w-20" />
              </div>
            ))}
          </div>
        </div>
      ) : viewMode === 'kline' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm text-slate-500">{locale === 'zh' ? '选择指数：' : 'Index: '}</label>
            <select
              value={selectedSymbol ?? ''}
              onChange={(e) => handleCardClick(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-200"
            >
              <option value="">{locale === 'zh' ? '请选择...' : 'Select...'}</option>
              {stocks.map((s) => (
                <option key={s.symbol} value={s.symbol}>
                  {locale === 'zh' ? (stockDisplayNames[s.symbol]?.zh ?? s.name) : (stockDisplayNames[s.symbol]?.en ?? s.name)}
                </option>
              ))}
            </select>
            {selectedSymbol && (
              <span className={`text-lg font-bold ${(klineData.length > 0 ? klineData[klineData.length - 1]?.change_pct : 0) ?? 0 >= 0 ? 'stock-up' : 'stock-down'}`}>
                {locale === 'zh' ? selectedDisplay.zh : selectedDisplay.en}
              </span>
            )}
          </div>

          {klineLoading ? (
            <div className="flex h-[500px] items-center justify-center rounded-2xl border border-slate-200/80 bg-white">
              <p className="text-slate-400">{locale === 'zh' ? '加载K线数据...' : 'Loading K-line...'}</p>
            </div>
          ) : klineData.length > 0 ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4">
              <CandlestickChart data={klineData} height={500} />
            </div>
          ) : (
            <EmptyState locale={locale} message={locale === 'zh' ? '请选择一个指数查看K线图' : 'Select an index to view K-line chart'} />
          )}
        </div>
      ) : viewMode === 'sectors' ? (
        <SectorBoard items={sectors} locale={locale} />
      ) : viewMode === 'ai' ? (
        <div className="mx-auto max-w-3xl">
          {analysis ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-8">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-700">{locale === 'zh' ? 'AI 市场分析' : 'AI Market Analysis'}</h3>
                  <p className="text-xs text-slate-400">{new Date(analysis.generated_at).toLocaleString()}</p>
                </div>
              </div>
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
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="card-hover rounded-2xl border border-slate-200/80 bg-white p-4">
              <p className="text-xs text-slate-400">{locale === 'zh' ? '监测指数' : 'Tracked'}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{summary.total}</p>
            </div>
            <div className="card-hover rounded-2xl border border-red-100 bg-red-50/50 p-4">
              <p className="text-xs text-red-500">{locale === 'zh' ? '上涨' : 'Rising'}</p>
              <p className="mt-1 text-2xl font-bold text-red-600">{summary.rising}</p>
            </div>
            <div className="card-hover rounded-2xl border border-green-100 bg-green-50/50 p-4">
              <p className="text-xs text-green-500">{locale === 'zh' ? '下跌' : 'Falling'}</p>
              <p className="mt-1 text-2xl font-bold text-green-600">{summary.falling}</p>
            </div>
            <div className="card-hover rounded-2xl border border-slate-200/80 bg-white p-4">
              <p className="text-xs text-slate-400">{locale === 'zh' ? '平均涨跌' : 'Avg Change'}</p>
              <p className={`mt-1 text-2xl font-bold ${summary.avgChange >= 0 ? 'stock-up' : 'stock-down'}`}>
                {summary.avgChange >= 0 ? '+' : ''}{summary.avgChange.toFixed(2)}%
              </p>
            </div>
          </div>

          <MarketComparisonChart history={history} locale={locale} days={days} />

          <div className="mt-6 mb-4 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-slate-700">
              {locale === 'zh' ? '点击卡片查看K线详情' : 'Click card for K-line detail'}
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {stocks.map((stock) => (
              <div key={stock.id} onClick={() => handleCardClick(stock.symbol)} className="cursor-pointer">
                <MarketIndexCard stock={stock} history={history[stock.symbol] ?? []} locale={locale} />
              </div>
            ))}
          </div>
        </>
      ) : (
        <EmptyState locale={locale} />
      )}
    </div>
  )
}
