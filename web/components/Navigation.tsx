'use client'

import { type Locale } from '@/lib/i18n'

interface NavigationProps {
  locale: Locale
  onLocaleChange: (l: Locale) => void
  activeCategory: string
  onCategoryChange: (c: string) => void
}

const navCategories = [
  { slug: 'all', zh: '热点', en: 'Hot' },
  { slug: 'tech', zh: '科技', en: 'Tech' },
  { slug: 'finance', zh: '财经', en: 'Finance' },
  { slug: 'entertainment', zh: '娱乐', en: 'Entertainment' },
  { slug: 'sports', zh: '体育', en: 'Sports' },
]

export default function Navigation({ locale, onLocaleChange, activeCategory, onCategoryChange }: NavigationProps) {
  return (
    <nav className="sticky top-0 z-50 border-b border-[#222] bg-[#0f0f1a]/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <span className="bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent font-bold text-xl">
            HotPulse
          </span>
          <div className="hidden items-center gap-1 sm:flex">
            {navCategories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => onCategoryChange(cat.slug)}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  activeCategory === cat.slug
                    ? 'bg-[#667eea]/20 text-[#667eea]'
                    : 'text-[#888] hover:text-[#e0e0e0]'
                }`}
              >
                {locale === 'zh' ? cat.zh : cat.en}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => onLocaleChange(locale === 'zh' ? 'en' : 'zh')}
          className="rounded bg-white/10 px-2 py-1 text-sm transition-colors hover:bg-white/20"
        >
          {locale === 'zh' ? 'EN' : '中'}
        </button>
      </div>
    </nav>
  )
}
