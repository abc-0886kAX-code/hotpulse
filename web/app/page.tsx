'use client'

import { useState, useEffect, useCallback } from 'react'
import { useApp } from '@/lib/app-context'
import DailyQuote from '@/components/DailyQuote'
import FeedCard from '@/components/FeedCard'
import CategoryFilter from '@/components/CategoryFilter'
import LoadMore from '@/components/LoadMore'
import EmptyState from '@/components/EmptyState'
import ViewTabs from '@/components/ViewTabs'
import { type Locale, categories, t } from '@/lib/i18n'
import { fetchTrending, fetchTrendingStats } from '@/lib/api'
import type { TrendingItem, TrendingStats } from '@/lib/api'

export default function NewsPage() {
  const { locale, quote } = useApp()
  const [activeCategory, setActiveCategory] = useState('all')
  const [viewMode, setViewMode] = useState('all')
  const [items, setItems] = useState<TrendingItem[]>([])
  const [stats, setStats] = useState<TrendingStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)

  const loadData = useCallback(async (cat: string, pg: number, append: boolean) => {
    try {
      const params: { category?: string; page: number; page_size: number } = { page: pg, page_size: 20 }
      if (cat !== 'all') params.category = cat

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
    loadData(activeCategory, 1, false)
  }, [activeCategory, locale, viewMode, loadData])

  useEffect(() => {
    if (viewMode === 'ai' && items.length > 0) {
      fetchTrendingStats().then(setStats).catch(() => setStats(null))
    }
  }, [viewMode, items.length])

  const handleLoadMore = () => {
    setLoadingMore(true)
    const nextPage = page + 1
    setPage(nextPage)
    loadData(activeCategory, nextPage, true)
  }

  const newsTabs = [
    { key: 'all', label: locale === 'zh' ? '全部新闻' : 'All News' },
    { key: 'ai', label: locale === 'zh' ? 'AI 分析' : 'AI Analysis' },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <DailyQuote quote={quote} locale={locale} />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <ViewTabs tabs={newsTabs} active={viewMode} onChange={setViewMode} />
        {viewMode === 'all' && (
          <CategoryFilter
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            locale={locale}
          />
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          {locale === 'zh' ? '加载中...' : 'Loading...'}
        </div>
      ) : (
        <>
          {viewMode === 'ai' && stats && (
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-3 text-sm font-medium text-slate-500">
                  {locale === 'zh' ? '分类分布' : 'Category Distribution'}
                </h3>
                {stats.categoryDistribution && Object.keys(stats.categoryDistribution).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(stats.categoryDistribution).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                      <div key={cat} className="flex items-center gap-2">
                        <span className="w-16 text-right text-sm text-slate-500">{cat}</span>
                        <div className="flex-1">
                          <div className="h-6 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-blue-500"
                              style={{ width: `${Math.min(100, (count / Math.max(...Object.values(stats.categoryDistribution))) * 100)}%` }}
                            />
                          </div>
                        </div>
                        <span className="w-8 text-sm text-slate-400">{count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">{locale === 'zh' ? '暂无数据' : 'No data'}</p>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="mb-3 text-sm font-medium text-slate-500">
                  {locale === 'zh' ? '热度 Top 10' : 'Top 10 by Heat'}
                </h3>
                {stats.topHeat && stats.topHeat.length > 0 ? (
                  <div className="space-y-2">
                    {stats.topHeat.map((item, idx) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <span className="w-5 text-xs text-slate-400">{idx + 1}</span>
                        <span className="flex-1 truncate text-sm text-slate-600">{item.title}</span>
                        <span className="text-xs font-medium text-blue-600">{item.heat_score}</span>
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
                {items.map((item) => (
                  <FeedCard key={item.id} item={item} locale={locale} aiMode={viewMode === 'ai'} />
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
