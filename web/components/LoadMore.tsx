'use client'

import { type Locale, t } from '@/lib/i18n'

interface LoadMoreProps {
  onClick: () => void
  loading: boolean
  locale: Locale
}

export default function LoadMore({ onClick, loading, locale }: LoadMoreProps) {
  return (
    <div className="flex justify-center py-6">
      <button
        onClick={onClick}
        disabled={loading}
        className="rounded-lg border border-[#333] bg-[#16213e] px-8 py-2 text-[#888] transition-colors hover:border-[#667eea] hover:text-white disabled:opacity-50"
      >
        {loading ? t(locale, 'loading') : t(locale, 'load.more')}
      </button>
    </div>
  )
}
