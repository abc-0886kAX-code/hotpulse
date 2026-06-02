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
              ? 'bg-blue-500 text-white'
              : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
          }`}
        >
          {locale === 'zh' ? cat.zh : cat.en}
        </button>
      ))}
    </div>
  )
}
