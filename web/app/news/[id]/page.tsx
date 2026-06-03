import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface TrendingItem {
  id: string
  platform: string
  source_url: string
  title: string
  content_snippet?: string
  original_text: string
  ai_summary_zh: string
  ai_summary_en: string
  category: string
  sentiment: string
  heat_score: number
  published_at: string
}

const platformNames: Record<string, string> = {
  daily60s: '60s 每日新闻',
  baidu: '百度热搜',
  hackernews: 'Hacker News',
}

const categoryNames: Record<string, string> = {
  tech: '科技', finance: '财经', entertainment: '娱乐',
  sports: '体育', health: '健康', domestic: '国内', other: '其他',
}

async function getItem(id: string): Promise<TrendingItem | null> {
  try {
    const res = await fetch(`${API_BASE}/api/trending/${id}`, { next: { revalidate: 300 } })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const item = await getItem(id)
  if (!item) return { title: 'HotPulse' }

  return {
    title: `${item.title} — HotPulse`,
    description: item.content_snippet || item.ai_summary_zh || item.title,
    openGraph: {
      title: item.title,
      description: item.ai_summary_zh || item.content_snippet || '',
      type: 'article',
      publishedTime: item.published_at,
      siteName: 'HotPulse',
    },
  }
}

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await getItem(id)
  if (!item) notFound()

  const platform = platformNames[item.platform] ?? item.platform
  const category = categoryNames[item.category] ?? item.category
  const summary = item.ai_summary_zh
  const content = item.content_snippet || item.original_text

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-blue-600">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
        返回首页
      </Link>

      <article>
        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-md bg-blue-50 px-2 py-0.5 text-blue-600 border border-blue-200">{platform}</span>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-600">{category}</span>
          {item.sentiment && (
            <span className={`rounded-md px-2 py-0.5 border ${
              item.sentiment === 'positive' ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
              : item.sentiment === 'negative' ? 'bg-rose-50 text-rose-600 border-rose-200'
              : 'bg-amber-50 text-amber-600 border-amber-200'
            }`}>
              {item.sentiment === 'positive' ? '正面' : item.sentiment === 'negative' ? '负面' : '中性'}
            </span>
          )}
          {item.heat_score > 0 && (
            <span className="text-slate-400">热度 {item.heat_score}</span>
          )}
        </div>

        <h1 className="mb-4 text-2xl font-bold leading-tight text-slate-900">{item.title}</h1>

        {summary && (
          <div className="mb-6 rounded-xl border border-violet-100 bg-violet-50/50 p-4">
            <p className="text-sm font-medium text-violet-600 mb-1">AI 摘要</p>
            <p className="text-base leading-relaxed text-violet-700">{summary}</p>
          </div>
        )}

        {content && (
          <div className="mb-8 text-base leading-relaxed text-slate-700 whitespace-pre-wrap">{content}</div>
        )}

        <div className="mb-8 flex items-center gap-4 text-sm text-slate-400">
          <time dateTime={item.published_at}>
            {new Date(item.published_at).toLocaleString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </time>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
          <div className="flex-1">
            <p className="text-sm text-blue-100">查看原文</p>
            <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="text-lg font-bold hover:underline">
              {item.source_url.slice(0, 50)}...
            </a>
          </div>
          <svg className="h-5 w-5 text-blue-200" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-7.5m7.5 0l10.5 6.75" /></svg>
        </div>
      </article>
    </div>
  )
}
