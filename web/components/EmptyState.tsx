import { type Locale, t } from '@/lib/i18n'

interface EmptyStateProps {
  locale: Locale
  message?: string
}

export default function EmptyState({ locale, message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
      <svg className="mb-4 h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-base">{message ?? (locale === 'zh' ? '暂无数据' : 'No data available')}</p>
      <p className="mt-1 text-sm text-slate-300">
        {locale === 'zh' ? '数据将自动更新' : 'Data will be updated automatically'}
      </p>
    </div>
  )
}
