const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface TrendingItem {
  id: string
  platform: string
  source_url: string
  title: string
  original_text: string
  ai_summary_zh: string
  ai_summary_en: string
  category: string
  sentiment: string
  heat_score: number
  published_at: string
  fetched_at: string
}

export interface Quote {
  id: string
  text_zh: string
  text_en: string
  author: string
  category: string
}

export interface StockIndex {
  id: string
  symbol: string
  name: string
  price: number
  change_pct: number
  snapshot_time: string
}

export async function fetchTrending(params?: { category?: string; page?: number; page_size?: number }): Promise<TrendingItem[]> {
  const query = new URLSearchParams()
  if (params?.category) query.set('category', params.category)
  if (params?.page) query.set('page', String(params.page))
  if (params?.page_size) query.set('page_size', String(params.page_size))
  const res = await fetch(`${API_BASE}/api/trending?${query}`)
  const data = await res.json()
  return data.items ?? []
}

export async function fetchDailyQuote(): Promise<Quote> {
  const res = await fetch(`${API_BASE}/api/quotes/daily`)
  return res.json()
}

export async function fetchStocks(): Promise<StockIndex[]> {
  const res = await fetch(`${API_BASE}/api/stocks`)
  const data = await res.json()
  return data.items ?? []
}
