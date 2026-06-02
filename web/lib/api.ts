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

export async function fetchTrending(params?: { category?: string; limit?: number; offset?: number }): Promise<TrendingItem[]> {
  const query = new URLSearchParams()
  if (params?.category) query.set('category', params.category)
  if (params?.limit) query.set('limit', String(params.limit))
  if (params?.offset) query.set('offset', String(params.offset))
  const res = await fetch(`${API_BASE}/api/trending?${query}`)
  return res.json()
}

export async function fetchDailyQuote(): Promise<Quote> {
  const res = await fetch(`${API_BASE}/api/quotes/daily`)
  return res.json()
}

export async function fetchStocks(): Promise<StockIndex[]> {
  const res = await fetch(`${API_BASE}/api/stocks`)
  return res.json()
}
