'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { type Locale } from '@/lib/i18n'
import { fetchDailyQuote } from '@/lib/api'
import type { Quote } from '@/lib/api'

interface AppContextType {
  locale: Locale
  setLocale: (l: Locale) => void
  quote: Quote | null
}

const AppContext = createContext<AppContextType>({
  locale: 'zh',
  setLocale: () => {},
  quote: null,
})

export function useApp() { return useContext(AppContext) }

export function AppProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('zh')
  const [quote, setQuote] = useState<Quote | null>(null)
  const [quoteFetched, setQuoteFetched] = useState(false)

  useEffect(() => {
    if (quoteFetched) return
    setQuoteFetched(true)
    fetchDailyQuote().then(setQuote).catch(() => setQuote(null))
  }, [quoteFetched])

  return (
    <AppContext.Provider value={{ locale, setLocale, quote }}>
      {children}
    </AppContext.Provider>
  )
}
