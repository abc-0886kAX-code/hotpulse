import { type Locale } from '@/lib/i18n'

interface EmptyStateProps {
  locale: Locale
  message?: string
}

export default function EmptyState({ locale, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/50 py-24">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
        <svg className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-base font-medium text-slate-400">{message ?? (locale === 'zh' ? '暂无数据' : 'No data available')}</p>
      <p className="mt-1 text-sm text-slate-300">
        {locale === 'zh' ? '数据将自动更新' : 'Data will be updated automatically'}
      </p>
    </div>
  )
}
