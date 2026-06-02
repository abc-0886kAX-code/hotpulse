import { type TrendingItem } from '@/lib/api'
import { type Locale, platformNames, t } from '@/lib/i18n'
import ShareButton from './ShareButton'

interface FeedCardProps {
  item: TrendingItem
  locale: Locale
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
  other: { zh: '其他', en: 'Other' },
}

const sentimentStyles: Record<string, string> = {
  positive: 'bg-green-500/15 text-green-400',
  negative: 'bg-red-500/15 text-red-400',
  neutral: 'bg-amber-500/15 text-amber-400',
}

export default function FeedCard({ item, locale }: FeedCardProps) {
  const platform = platformNames[item.platform] ?? { zh: item.platform, en: item.platform }
  const cat = categoryMap[item.category] ?? { zh: item.category, en: item.category }
  const summary = locale === 'zh' ? item.ai_summary_zh : item.ai_summary_en

  return (
    <div className="group flex min-h-[200px] flex-col rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition-all hover:border-zinc-700 hover:shadow-lg hover:shadow-black/20">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-zinc-500">{locale === 'zh' ? platform.zh : platform.en}</span>
          <span className="rounded-md bg-blue-500/10 px-1.5 py-0.5 text-blue-400">
            {locale === 'zh' ? cat.zh : cat.en}
          </span>
          <span className={`rounded-md px-1.5 py-0.5 ${sentimentStyles[item.sentiment] ?? sentimentStyles.neutral}`}>
            {item.sentiment === 'positive' ? t(locale, 'sentiment.positive')
              : item.sentiment === 'negative' ? t(locale, 'sentiment.negative')
              : t(locale, 'sentiment.neutral')}
          </span>
        </div>
        <ShareButton text={item.title} url={item.source_url} locale={locale} />
      </div>

      <a
        href={item.source_url}
        target="_blank"
        rel="noopener noreferrer"
        className="mb-2 line-clamp-2 text-base font-semibold leading-snug text-zinc-100 transition-colors hover:text-blue-400"
      >
        {item.title}
      </a>

      <p className="mb-auto line-clamp-3 flex-1 text-sm leading-relaxed text-zinc-400">
        {summary}
      </p>

      <div className="mt-3 flex items-center gap-3 border-t border-zinc-800 pt-3 text-xs text-zinc-500">
        <span>{t(locale, 'meta.ago').replace('{time}', relativeTime(item.published_at))}</span>
        <span>{t(locale, 'meta.heat').replace('{score}', String(item.heat_score))}</span>
      </div>
    </div>
  )
}
