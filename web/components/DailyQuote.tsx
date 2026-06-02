import { type Quote, type Locale, t } from '@/lib/i18n'

interface DailyQuoteProps {
  quote: Quote
  locale: Locale
}

export default function DailyQuote({ quote, locale }: DailyQuoteProps) {
  return (
    <div className="border-l-4 border-[#f093fb] bg-[#16213e] rounded-r-lg p-4">
      <p className="italic text-[#e0e0e0]">
        &ldquo;{locale === 'zh' ? quote.text_zh : quote.text_en}&rdquo;
      </p>
      <div className="mt-2 flex items-center justify-between text-sm text-[#888]">
        <span>— {quote.author}</span>
        <button className="rounded px-2 py-1 text-xs transition-colors hover:bg-white/10 hover:text-[#e0e0e0]">
          {t(locale, 'quote.share')}
        </button>
      </div>
    </div>
  )
}
