'use client'

import { useState, useEffect, useCallback } from 'react'
import { useApp } from '@/lib/app-context'
import DailyQuote from '@/components/DailyQuote'
import FeedCard from '@/components/FeedCard'
import CategoryFilter from '@/components/CategoryFilter'
import LoadMore from '@/components/LoadMore'
import { type Locale } from '@/lib/i18n'
import { fetchTrending } from '@/lib/api'
import type { TrendingItem } from '@/lib/api'

const fallbackItems: TrendingItem[] = [
  {
    id: '1', platform: 'reddit', source_url: 'https://reddit.com',
    title: 'OpenAI 发布 GPT-5，推理能力提升 10 倍',
    original_text: '', ai_summary_zh: 'OpenAI 正式发布 GPT-5 模型，在数学推理和多模态理解方面取得重大突破。',
    ai_summary_en: 'OpenAI released GPT-5 with major breakthroughs in mathematical reasoning and multimodal understanding.',
    category: 'tech', sentiment: 'positive', heat_score: 98,
    published_at: new Date(Date.now() - 7200000).toISOString(), fetched_at: new Date().toISOString(),
  },
  {
    id: '2', platform: 'weibo', source_url: 'https://weibo.com',
    title: '央行宣布降准 50 个基点，释放流动性约 1 万亿',
    original_text: '', ai_summary_zh: '央行下调存款准备金率 50 个基点，预计释放长期流动性约 1 万亿元。',
    ai_summary_en: 'PBOC cut RRR by 50 bps, expected to release ~1 trillion yuan in liquidity.',
    category: 'finance', sentiment: 'negative', heat_score: 95,
    published_at: new Date(Date.now() - 2700000).toISOString(), fetched_at: new Date().toISOString(),
  },
  {
    id: '3', platform: 'hackernews', source_url: 'https://news.ycombinator.com',
    title: 'Rust 2.0 发布：零成本抽象的新时代',
    original_text: '', ai_summary_zh: 'Rust 语言发布 2.0 大版本，引入全新异步运行时和改进的类型系统。',
    ai_summary_en: 'Rust 2.0 released with a new async runtime and improved type system.',
    category: 'tech', sentiment: 'positive', heat_score: 88,
    published_at: new Date(Date.now() - 3600000).toISOString(), fetched_at: new Date().toISOString(),
  },
  {
    id: '4', platform: 'youtube', source_url: 'https://youtube.com',
    title: 'NASA 成功发射阿尔忒弥斯 III 号载人登月任务',
    original_text: '', ai_summary_zh: 'NASA 成功发射阿尔忒弥斯 III 号，将送宇航员重返月球表面。',
    ai_summary_en: 'NASA successfully launched Artemis III, sending astronauts back to the lunar surface.',
    category: 'tech', sentiment: 'positive', heat_score: 92,
    published_at: new Date(Date.now() - 5400000).toISOString(), fetched_at: new Date().toISOString(),
  },
  {
    id: '5', platform: 'twitter', source_url: 'https://x.com',
    title: '全球 AI 安全峰会达成首个国际监管框架协议',
    original_text: '', ai_summary_zh: '全球 AI 安全峰会达成首个国际监管框架协议，30 多国签署承诺。',
    ai_summary_en: 'Global AI Safety Summit reached first international regulatory framework with 30+ nations.',
    category: 'tech', sentiment: 'positive', heat_score: 85,
    published_at: new Date(Date.now() - 10800000).toISOString(), fetched_at: new Date().toISOString(),
  },
  {
    id: '6', platform: 'reddit', source_url: 'https://reddit.com',
    title: '量子计算突破：Google 实现 1000 量子比特纠错',
    original_text: '', ai_summary_zh: 'Google 宣布实现 1000 量子比特纠错，量子计算实用化迈出关键一步。',
    ai_summary_en: 'Google achieved 1000-qubit error correction, a key step toward practical quantum computing.',
    category: 'tech', sentiment: 'positive', heat_score: 80,
    published_at: new Date(Date.now() - 14400000).toISOString(), fetched_at: new Date().toISOString(),
  },
]

export default function NewsPage() {
  const { locale, quote } = useApp()
  const [activeCategory, setActiveCategory] = useState('all')
  const [items, setItems] = useState<TrendingItem[]>([])
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
        setItems(fallbackItems)
      }
    } catch {
      if (pg === 1) setItems(fallbackItems)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    setPage(1)
    loadData(activeCategory, 1, false)
  }, [activeCategory, locale, loadData])

  const handleLoadMore = () => {
    setLoadingMore(true)
    const nextPage = page + 1
    setPage(nextPage)
    loadData(activeCategory, nextPage, true)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6">
        <DailyQuote quote={quote} locale={locale} />
      </div>

      <div className="mb-6">
        <CategoryFilter
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          locale={locale}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-zinc-500">
          {locale === 'zh' ? '加载中...' : 'Loading...'}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <FeedCard key={item.id} item={item} locale={locale} />
            ))}
          </div>

          {items.length > 0 && (
            <LoadMore onClick={handleLoadMore} loading={loadingMore} locale={locale} />
          )}
        </>
      )}
    </div>
  )
}
