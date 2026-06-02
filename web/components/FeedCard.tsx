import { type TrendingItem } from '@/lib/api'
import { type Locale, platformNames, t } from '@/lib/i18n'

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

function sentimentLabel(sentiment: string, locale: Locale) {
  if (sentiment === 'positive') return t(locale, 'sentiment.positive')
  if (sentiment === 'negative') return t(locale, 'sentiment.negative')
  return t(locale, 'sentiment.neutral')
}

function sentimentColor(sentiment: string) {
  if (sentiment === 'positive') return 'bg-[#00c853]/20 text-[#00c853]'
  if (sentiment === 'negative') return 'bg-[#ff1744]/20 text-[#ff1744]'
  return 'bg-[#ff9800]/20 text-[#ff9800]'
}

const navCategoryMap: Record<string, { zh: string; en: string }> = {
  tech: { zh: '科技', en: 'Tech' },
  finance: { zh: '财经', en: 'Finance' },
  entertainment: { zh: '娱乐', en: 'Entertainment' },
  sports: { zh: '体育', en: 'Sports' },
  health: { zh: '健康', en: 'Health' },
  other: { zh: '其他', en: 'Other' },
}

export default function FeedCard({ item, locale }: FeedCardProps) {
  const platform = platformNames[item.platform] ?? { zh: item.platform, en: item.platform }
  const cat = navCategoryMap[item.category] ?? { zh: item.category, en: item.category }

  return (
    <div className="rounded-lg border border-[#333] bg-[#16213e] p-4 transition-colors hover:border-[#667eea]/50">
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[#667eea]">{locale === 'zh' ? platform.zh : platform.en}</span>
        <span className="rounded bg-[#667eea]/20 px-1.5 py-0.5 text-[#667eea]">
          {locale === 'zh' ? cat.zh : cat.en}
        </span>
        <span className={`rounded px-1.5 py-0.5 ${sentimentColor(item.sentiment)}`}>
          {sentimentLabel(item.sentiment, locale)}
        </span>
      </div>
      <h3 className="mb-2 text-base font-semibold text-[#e0e0e0]">
        <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-[#667eea]">
          {item.title}
        </a>
      </h3>
      <p className="mb-3 text-sm text-[#888]">
        {locale === 'zh' ? item.ai_summary_zh : item.ai_summary_en}
      </p>
      <div className="flex items-center gap-4 text-xs text-[#888]">
        <span>
          {t(locale, 'meta.ago').replace('{time}', relativeTime(item.published_at))}
        </span>
        <span>
          {t(locale, 'meta.heat').replace('{score}', String(item.heat_score))}
        </span>
      </div>
    </div>
  )
}
