'use client'

import { type Quote } from '@/lib/api'
import { type Locale, t } from '@/lib/i18n'
import { exportQuoteAsImage } from '@/lib/export'
import ShareButton from './ShareButton'

interface DailyQuoteProps {
  quote: Quote | null
  locale: Locale
}

export default function DailyQuote({ quote, locale }: DailyQuoteProps) {
  const text = quote ? (locale === 'zh' ? quote.text_zh : quote.text_en) : ''

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-blue-50/50 p-6">
      <div className="mb-3 flex items-center gap-2">
        <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
        <span className="text-xs font-medium text-blue-400">
          {locale === 'zh' ? '每日一言' : 'Daily Quote'}
        </span>
      </div>
      <p className="text-lg leading-relaxed text-slate-700">
        <span className="italic text-slate-600">&ldquo;{text}&rdquo;</span>
      </p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-400">&mdash; {quote?.author ?? ''}</span>
        {quote && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportQuoteAsImage(quote!, locale)}
              className="rounded-lg px-3 py-1.5 text-xs text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              {t(locale, 'quote.export')}
            </button>
            <ShareButton text={text} locale={locale} />
          </div>
        )}
      </div>
    </div>
  )
}
