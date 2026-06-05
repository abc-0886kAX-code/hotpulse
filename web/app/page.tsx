'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useApp } from '@/lib/app-context'
import DailyQuote from '@/components/DailyQuote'
import FeedCard from '@/components/FeedCard'
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

// 统一tab定义：推荐(全部)、国内、国际、各分类、AI分析
function buildUnifiedTabs(locale: Locale) {
  return [
    { key: 'recommend', label: locale === 'zh' ? '推荐' : 'All' },
    { key: 'domestic', label: t(locale, 'region.domestic') },
    { key: 'foreign', label: t(locale, 'region.foreign') },
    { key: 'tech', label: locale === 'zh' ? '科技' : 'Tech' },
    { key: 'finance', label: locale === 'zh' ? '财经' : 'Finance' },
    { key: 'entertainment', label: locale === 'zh' ? '娱乐' : 'Entertainment' },
    { key: 'sports', label: locale === 'zh' ? '体育' : 'Sports' },
    { key: 'health', label: locale === 'zh' ? '健康' : 'Health' },
    { key: 'ai', label: locale === 'zh' ? 'AI 分析' : 'AI Analysis' },
  ]
}

export default function NewsPage() {
  const { locale, quote } = useApp()
  const [activeTab, setActiveTab] = useState('recommend')
  const [items, setItems] = useState<TrendingItem[]>([])
  const [stats, setStats] = useState<TrendingStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)

  // 根据当前tab计算API参数
  const apiParams = useMemo(() => {
    if (activeTab === 'ai') return null
    if (activeTab === 'domestic') return { region: 'domestic' }
    if (activeTab === 'foreign') return { region: 'foreign' }
    if (activeTab === 'recommend') return {}
    // 科技、财经、娱乐、体育、健康 → 按分类过滤
    return { category: activeTab }
  }, [activeTab])

  const loadData = useCallback(async (tab: string, pg: number, append: boolean) => {
    if (tab === 'ai') {
      setLoading(false)
      return
    }
    try {
      const params: Record<string, string | number> = { page: pg, page_size: 20 }
      if (tab === 'domestic') params.region = 'domestic'
      else if (tab === 'foreign') params.region = 'foreign'
      else if (tab !== 'recommend') params.category = tab

      const data = await fetchTrending(params as Parameters<typeof fetchTrending>[0]).catch(() => null)
      if (data && data.length > 0) {
        setItems(append ? (prev) => [...prev, ...data] : data)
      } else if (pg === 1) {
        setItems([])
      }
    } catch {
      if (pg === 1) setItems([])
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    setPage(1)
    loadData(activeTab, 1, false)
  }, [activeTab, locale, loadData])

  useEffect(() => {
    if (activeTab === 'ai') {
      fetchTrendingStats().then(setStats).catch(() => setStats(null))
    }
  }, [activeTab])

  const handleLoadMore = () => {
    setLoadingMore(true)
    const nextPage = page + 1
    setPage(nextPage)
    loadData(activeTab, nextPage, true)
  }

  const tabs = useMemo(() => buildUnifiedTabs(locale), [locale])

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

      {/* 统一tab栏 */}
      <div className="mb-6">
        <ViewTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />
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
          {activeTab === 'ai' && stats && (
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

          {activeTab === 'ai' && (!stats || (stats.topHeat && stats.topHeat.length === 0)) && (
            <EmptyState locale={locale} />
          )}

          {activeTab !== 'ai' && items.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((item, idx) => (
                  <div key={item.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(idx * 30, 300)}ms` }}>
                    <FeedCard item={item} locale={locale} aiMode={false} rank={idx + 1} />
                  </div>
                ))}
              </div>
              <LoadMore onClick={handleLoadMore} loading={loadingMore} locale={locale} />
            </>
          ) : activeTab !== 'ai' && !loading ? (
            <EmptyState locale={locale} />
          ) : null}
        </>
      )}
    </div>
  )
}
