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
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="italic leading-relaxed text-slate-700">
        &ldquo;{text}&rdquo;
      </p>
      <div className="mt-3 flex items-center justify-between text-sm text-slate-400">
        <span>— {quote?.author ?? ''}</span>
        {quote && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportQuoteAsImage(quote!, locale)}
              className="rounded-lg px-3 py-1 text-xs transition-colors hover:bg-slate-100 hover:text-slate-600"
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
