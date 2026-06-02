'use client'

import { type Locale, categories } from '@/lib/i18n'

interface CategoryFilterProps {
  activeCategory: string
  onCategoryChange: (c: string) => void
  locale: Locale
}

export default function CategoryFilter({ activeCategory, onCategoryChange, locale }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat.slug}
          onClick={() => onCategoryChange(cat.slug)}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            activeCategory === cat.slug
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
          }`}
        >
          {locale === 'zh' ? cat.zh : cat.en}
        </button>
      ))}
    </div>
  )
}
