'use client'

import { useState, useEffect, useCallback } from 'react'
import { useApp } from '@/lib/app-context'
import DailyQuote from '@/components/DailyQuote'
import FeedCard from '@/components/FeedCard'
import CategoryFilter from '@/components/CategoryFilter'
import LoadMore from '@/components/LoadMore'
import EmptyState from '@/components/EmptyState'
import ViewTabs from '@/components/ViewTabs'
import { type Locale, t } from '@/lib/i18n'
import { fetchTrending, fetchTrendingStats } from '@/lib/api'
import type { TrendingItem, TrendingStats } from '@/lib/api'

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 6) return '夜深了'
  if (h < 12) return '早上好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
}

function formatDate(locale: Locale): string {
  const now = new Date()
  return now.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
}

export default function NewsPage() {
  const { locale, quote } = useApp()
  const [activeCategory, setActiveCategory] = useState('all')
  const [viewMode, setViewMode] = useState('all')
  const [region, setRegion] = useState('domestic')
  const [items, setItems] = useState<TrendingItem[]>([])
  const [stats, setStats] = useState<TrendingStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)

  const loadData = useCallback(async (cat: string, rg: string, pg: number, append: boolean) => {
    try {
      const params: { category?: string; region?: string; page: number; page_size: number } = { page: pg, page_size: 20 }
      if (cat !== 'all') params.category = cat
      if (rg !== 'all') params.region = rg

      const data = await fetchTrending(params).catch(() => null)
      if (data && data.length > 0) {
        setItems(append ? (prev) => [...prev, ...data] : data)
      } else if (pg === 1) {
        setItems([])
      }

      if (pg === 1 && viewMode === 'ai') {
        const s = await fetchTrendingStats().catch(() => null)
        setStats(s)
      }
    } catch {
      if (pg === 1) setItems([])
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [viewMode])

  useEffect(() => {
    setLoading(true)
    setPage(1)
    loadData(activeCategory, region, 1, false)
  }, [activeCategory, region, locale, viewMode, loadData])

  useEffect(() => {
    if (viewMode === 'ai' && items.length > 0) {
      fetchTrendingStats().then(setStats).catch(() => setStats(null))
    }
  }, [viewMode, items.length])

  const handleLoadMore = () => {
    setLoadingMore(true)
    const nextPage = page + 1
    setPage(nextPage)
    loadData(activeCategory, region, nextPage, true)
  }

  const newsTabs = [
    { key: 'all', label: locale === 'zh' ? '全部新闻' : 'All News' },
    { key: 'ai', label: locale === 'zh' ? 'AI 分析' : 'AI Analysis' },
  ]

  const regionTabs = [
    { key: 'domestic', label: t(locale, 'region.domestic') },
    { key: 'foreign', label: t(locale, 'region.foreign') },
    { key: 'all', label: t(locale, 'region.all') },
  ]

  const totalItems = items.length

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Hero 区域 */}
      <div className="mb-8 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-sm font-medium text-blue-100">
              {locale === 'zh' ? getGreeting() : getGreeting()}
            </p>
            <h1 className="text-2xl font-bold sm:text-3xl">
              {locale === 'zh' ? '全球热点，一触即达' : 'Global Trends at Your Fingertips'}
            </h1>
            <p className="mt-2 text-sm text-blue-100">{formatDate(locale)}</p>
          </div>
          <div className="flex gap-4">
            <div className="rounded-xl bg-white/15 px-4 py-3 text-center backdrop-blur-sm">
              <p className="text-2xl font-bold">{totalItems}</p>
              <p className="text-xs text-blue-100">{locale === 'zh' ? '今日热点' : 'Trending'}</p>
            </div>
            <div className="rounded-xl bg-white/15 px-4 py-3 text-center backdrop-blur-sm">
              <p className="text-2xl font-bold">{locale === 'zh' ? 'AI' : 'AI'}</p>
              <p className="text-xs text-blue-100">{locale === 'zh' ? '智能分析' : 'Analysis'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 每日名言 */}
      <div className="mb-6">
        <DailyQuote quote={quote} locale={locale} />
      </div>

      {/* 筛选栏 */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ViewTabs tabs={newsTabs} active={viewMode} onChange={setViewMode} />
          {viewMode === 'all' && (
            <ViewTabs tabs={regionTabs} active={region} onChange={setRegion} />
          )}
        </div>
        {viewMode === 'all' && (
          <CategoryFilter
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            locale={locale}
          />
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex min-h-[220px] flex-col rounded-2xl border border-slate-200/80 bg-white p-5">
              <div className="mb-3 flex gap-2">
                <div className="skeleton h-6 w-16" />
                <div className="skeleton h-6 w-12" />
              </div>
              <div className="skeleton mb-2 h-6 w-full" />
              <div className="skeleton mb-1 h-4 w-full" />
              <div className="skeleton mb-1 h-4 w-3/4" />
              <div className="skeleton mt-auto h-4 w-20" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {viewMode === 'ai' && stats && (
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6">
                <h3 className="mb-4 text-sm font-semibold text-slate-700">
                  {locale === 'zh' ? '分类分布' : 'Category Distribution'}
                </h3>
                {stats.categoryDistribution && Object.keys(stats.categoryDistribution).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(stats.categoryDistribution).sort((a, b) => b[1] - a[1]).map(([cat, count]) => {
                      const maxVal = Math.max(...Object.values(stats.categoryDistribution))
                      const pct = Math.min(100, (count / maxVal) * 100)
                      return (
                        <div key={cat} className="flex items-center gap-3">
                          <span className="w-14 text-right text-sm text-slate-500">{cat}</span>
                          <div className="flex-1">
                            <div className="h-7 overflow-hidden rounded-lg bg-slate-100">
                              <div
                                className="h-full rounded-lg bg-gradient-to-r from-blue-500 to-purple-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                          <span className="w-8 text-right text-sm font-semibold text-slate-600">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">{locale === 'zh' ? '暂无数据' : 'No data'}</p>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-6">
                <h3 className="mb-4 text-sm font-semibold text-slate-700">
                  {locale === 'zh' ? '热度 Top 10' : 'Top 10 by Heat'}
                </h3>
                {stats.topHeat && stats.topHeat.length > 0 ? (
                  <div className="space-y-3">
                    {stats.topHeat.map((item, idx) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <span className={`flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold ${
                          idx === 0 ? 'bg-amber-100 text-amber-600'
                          : idx === 1 ? 'bg-slate-100 text-slate-500'
                          : idx === 2 ? 'bg-orange-100 text-orange-500'
                          : 'bg-slate-50 text-slate-400'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className="flex-1 truncate text-sm text-slate-600">{item.title}</span>
                        <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600">{item.heat_score}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">{locale === 'zh' ? '暂无数据' : 'No data'}</p>
                )}
              </div>
            </div>
          )}

          {items.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((item, idx) => (
                  <div key={item.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(idx * 30, 300)}ms` }}>
                    <FeedCard item={item} locale={locale} aiMode={viewMode === 'ai'} rank={idx + 1} />
                  </div>
                ))}
              </div>
              <LoadMore onClick={handleLoadMore} loading={loadingMore} locale={locale} />
            </>
          ) : (
            <EmptyState locale={locale} />
          )}
        </>
      )}
    </div>
  )
}
