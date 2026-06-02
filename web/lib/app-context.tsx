'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { type Locale } from '@/lib/i18n'
import { fetchDailyQuote } from '@/lib/api'
import type { Quote } from '@/lib/api'

const fallbackQuote: Quote = {
  id: 'fallback',
  text_zh: '唯一伟大的做事方式就是热爱你所做的事。',
  text_en: 'The only way to do great work is to love what you do.',
  author: 'Steve Jobs',
  category: 'motivation',
}

interface AppContextType {
  locale: Locale
  setLocale: (l: Locale) => void
  quote: Quote
}

const AppContext = createContext<AppContextType>({
  locale: 'zh',
  setLocale: () => {},
  quote: fallbackQuote,
})

export function useApp() { return useContext(AppContext) }

export function AppProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('zh')
  const [quote, setQuote] = useState<Quote>(fallbackQuote)
  const [quoteFetched, setQuoteFetched] = useState(false)

  useEffect(() => {
    if (quoteFetched) return
    setQuoteFetched(true)
    fetchDailyQuote().then(setQuote).catch(() => setQuote(fallbackQuote))
  }, [quoteFetched])

  const value: AppContextType = {
    locale,
    setLocale,
    quote,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
