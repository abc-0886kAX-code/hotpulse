'use client'

import { type Locale, categories } from '@/lib/i18n'

interface CategoryFilterProps {
  activeCategory: string
  onCategoryChange: (c: string) => void
  locale: Locale
}

const categoryIcons: Record<string, string> = {
  all: '✦',
  tech: '⚡',
  finance: '📈',
  entertainment: '🎬',
  sports: '⚽',
  health: '💊',
  other: '📌',
  domestic: '🏠',
}

export default function CategoryFilter({ activeCategory, onCategoryChange, locale }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat.slug}
          onClick={() => onCategoryChange(cat.slug)}
          className={`rounded-xl px-3.5 py-1.5 text-sm font-medium transition-all ${
            activeCategory === cat.slug
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-sm shadow-blue-200'
              : 'border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
          }`}
        >
          <span className="mr-1">{categoryIcons[cat.slug] ?? '•'}</span>
          {locale === 'zh' ? cat.zh : cat.en}
        </button>
      ))}
    </div>
  )
}
