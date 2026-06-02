'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useApp } from '@/lib/app-context'
import { t } from '@/lib/i18n'

export default function Navigation() {
  const { locale, setLocale } = useApp()
  const pathname = usePathname()

  const tabs = [
    { href: '/', label: t(locale, 'nav.news') },
    { href: '/stocks', label: t(locale, 'nav.stocks') },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold text-blue-600">
            HotPulse
          </Link>
          <div className="flex items-center gap-1">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                </Link>
              )
            })}
          </div>
        </div>
        <button
          onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
          className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200"
        >
          {locale === 'zh' ? 'EN' : '中'}
        </button>
      </div>
    </nav>
  )
}
