'use client'

import Link from 'next/link'
import { type TrendingItem } from '@/lib/api'
import { type Locale, platformNames, t } from '@/lib/i18n'
import ShareButton from './ShareButton'

interface FeedCardProps {
  item: TrendingItem
  locale: Locale
  aiMode?: boolean
  rank?: number
}

function relativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = Math.floor((now - then) / 1000)
  if (diff < 60) return `${diff}s`
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

const categoryMap: Record<string, { zh: string; en: string }> = {
  tech: { zh: '科技', en: 'Tech' },
  finance: { zh: '财经', en: 'Finance' },
  entertainment: { zh: '娱乐', en: 'Entertainment' },
  sports: { zh: '体育', en: 'Sports' },
  health: { zh: '健康', en: 'Health' },
  domestic: { zh: '国内', en: 'Domestic' },
  other: { zh: '其他', en: 'Other' },
}

const platformClass: Record<string, string> = {
  baidu: 'platform-baidu',
  daily60s: 'platform-daily60s',
  hackernews: 'platform-hackernews',
}

const sentimentStyles: Record<string, string> = {
  positive: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  negative: 'bg-rose-50 text-rose-600 border-rose-200',
  neutral: 'bg-amber-50 text-amber-600 border-amber-200',
}

function heatBar(score: number): string {
  if (score >= 8) return 'bg-gradient-to-r from-orange-400 to-red-500'
  if (score >= 5) return 'bg-gradient-to-r from-yellow-400 to-orange-400'
  return 'bg-gradient-to-r from-slate-300 to-yellow-400'
}

function rankColor(rank: number): string {
  if (rank === 1) return 'from-yellow-400 to-amber-500 text-white'
  if (rank === 2) return 'from-slate-300 to-slate-400 text-white'
  if (rank === 3) return 'from-amber-600 to-amber-700 text-white'
  return 'from-slate-100 to-slate-200 text-slate-500'
}

export default function FeedCard({ item, locale, aiMode = false, rank }: FeedCardProps) {
  const platform = platformNames[item.platform] ?? { zh: item.platform, en: item.platform }
  const cat = categoryMap[item.category] ?? { zh: item.category, en: item.category }
  const summary = locale === 'zh' ? item.ai_summary_zh : item.ai_summary_en
  const content = (item as TrendingItem & { content_snippet?: string }).content_snippet ?? ''

  return (
    <div className="card-hover group flex min-h-[220px] flex-col rounded-2xl border border-slate-200/80 bg-white p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {rank != null && rank <= 10 && (
            <span className={`flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br text-xs font-bold ${rankColor(rank)}`}>
              {rank}
            </span>
          )}
          <span className={`rounded-md border px-2 py-0.5 text-xs font-medium ${platformClass[item.platform] ?? 'border-slate-200 bg-slate-50 text-slate-500'}`}>
            {locale === 'zh' ? platform.zh : platform.en}
          </span>
          {aiMode && (
            <>
              <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                {locale === 'zh' ? cat.zh : cat.en}
              </span>
              <span className={`rounded-md border px-2 py-0.5 text-xs font-medium ${sentimentStyles[item.sentiment] ?? sentimentStyles.neutral}`}>
                {item.sentiment === 'positive' ? t(locale, 'sentiment.positive')
                  : item.sentiment === 'negative' ? t(locale, 'sentiment.negative')
                  : t(locale, 'sentiment.neutral')}
              </span>
            </>
          )}
        </div>
        <ShareButton text={item.title} url={item.source_url} locale={locale} />
      </div>

      <Link
        href={`/news/${item.id}`}
        className="mb-2 line-clamp-2 text-base font-semibold leading-snug text-slate-900 transition-colors group-hover:text-blue-600"
      >
        {item.title}
      </Link>

      {aiMode && summary ? (
        <p className="mb-2 line-clamp-2 flex-1 text-sm leading-relaxed text-violet-600/80">
          AI: {summary}
        </p>
      ) : null}

      {content ? (
        <p className={`mb-auto line-clamp-3 flex-1 text-sm leading-relaxed text-slate-500 ${aiMode ? 'mt-1' : ''}`}>
          {content}
        </p>
      ) : null}

      <div className="mt-auto pt-3">
        {aiMode && item.heat_score > 0 && (
          <div className="mb-2">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>{locale === 'zh' ? '热度' : 'Heat'}</span>
              <span className="font-medium">{item.heat_score}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${heatBar(item.heat_score)}`}
                style={{ width: `${Math.min(100, item.heat_score * 10)}%` }}
              />
            </div>
          </div>
        )}
        <div className="flex items-center gap-3 border-t border-slate-100 pt-2 text-xs text-slate-400">
          <span>{t(locale, 'meta.ago').replace('{time}', relativeTime(item.published_at))}</span>
        </div>
      </div>
    </div>
  )
}
