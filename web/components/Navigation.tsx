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
    <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold text-zinc-50">
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
                      ? 'bg-zinc-800 text-zinc-50'
                      : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
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
          className="rounded-lg bg-zinc-800 px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-zinc-100"
        >
          {locale === 'zh' ? 'EN' : '中'}
        </button>
      </div>
    </nav>
  )
}
