'use client'

import { type Locale, t } from '@/lib/i18n'

interface LoadMoreProps {
  onClick: () => void
  loading: boolean
  locale: Locale
}

export default function LoadMore({ onClick, loading, locale }: LoadMoreProps) {
  return (
    <div className="flex justify-center py-8">
      <button
        onClick={onClick}
        disabled={loading}
        className="rounded-lg border border-zinc-800 bg-zinc-900 px-8 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200 disabled:opacity-50"
      >
        {loading ? t(locale, 'loading') : t(locale, 'load.more')}
      </button>
    </div>
  )
}
