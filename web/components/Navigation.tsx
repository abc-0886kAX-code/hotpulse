'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useApp } from '@/lib/app-context'
import { t } from '@/lib/i18n'
import ShareModal from './ShareModal'

export default function Navigation() {
  const { locale, setLocale } = useApp()
  const pathname = usePathname()
  const [shareOpen, setShareOpen] = useState(false)

  const tabs = [
    { href: '/', label: t(locale, 'nav.news') },
    { href: '/stocks', label: t(locale, 'nav.stocks') },
    { href: '/report', label: t(locale, 'report.stock') },
    { href: '/report/news', label: t(locale, 'report.news') },
  ]

  return (
    <>
      <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

      <nav className="glass sticky top-0 z-50 border-b border-slate-200/60">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <span className="text-lg font-bold gradient-text">HotPulse</span>
            </Link>
            <div className="flex items-center gap-1">
              {tabs.map((tab) => {
                const isActive = pathname === tab.href
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`relative rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                      isActive
                        ? 'text-blue-600'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {tab.label}
                    {isActive && (
                      <span className="absolute inset-x-1 -bottom-[13px] h-0.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShareOpen(true)}
              className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 transition-all hover:border-slate-300 hover:text-blue-600 hover:shadow-sm"
              title={locale === 'zh' ? '分享' : 'Share'}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
              </svg>
            </button>
            <button
              onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-300 hover:shadow-sm"
            >
              {locale === 'zh' ? 'EN' : '中'}
            </button>
          </div>
        </div>
      </nav>

      <ShareModal open={shareOpen} onClose={() => setShareOpen(false)} locale={locale} />
    </>
  )
}
