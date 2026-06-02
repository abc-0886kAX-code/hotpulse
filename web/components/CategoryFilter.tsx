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
          className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
            activeCategory === cat.slug
              ? 'bg-[#667eea] text-white'
              : 'bg-[#16213e] text-[#888] hover:text-[#e0e0e0]'
          }`}
        >
          {locale === 'zh' ? cat.zh : cat.en}
        </button>
      ))}
    </div>
  )
}
