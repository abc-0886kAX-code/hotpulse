const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface TrendingItem {
  id: string
  platform: string
  source_url: string
  title: string
  original_text: string
  content_snippet?: string
  ai_summary_zh: string
  ai_summary_en: string
  category: string
  sentiment: string
  heat_score: number
  published_at: string
  fetched_at: string
}

export interface TrendingStats {
  categoryDistribution: Record<string, number>
  sentimentDistribution: Record<string, number>
  topHeat: TrendingItem[]
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

export interface StockHistoryPoint {
  symbol: string
  name: string
  price: number
  change_pct?: number
  snapshot_time: string
}

export interface MarketAnalysis {
  content_zh: string
  content_en: string
  generated_at: string
}

export async function fetchTrending(params?: { category?: string; region?: string; page?: number; page_size?: number }): Promise<TrendingItem[]> {
  const query = new URLSearchParams()
  if (params?.category) query.set('category', params.category)
  if (params?.region) query.set('region', params.region)
  if (params?.page) query.set('page', String(params.page))
  if (params?.page_size) query.set('page_size', String(params.page_size))
  const res = await fetch(`${API_BASE}/api/trending?${query}`)
  const data = await res.json()
  return data.items ?? []
}

export async function fetchTrendingStats(): Promise<TrendingStats | null> {
  const res = await fetch(`${API_BASE}/api/trending/stats`)
  if (!res.ok) return null
  return res.json()
}

export async function fetchDailyQuote(): Promise<Quote | null> {
  try {
    const res = await fetch(`${API_BASE}/api/quotes/daily`)
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function fetchStocks(): Promise<StockIndex[]> {
  const res = await fetch(`${API_BASE}/api/stocks`)
  const data = await res.json()
  return data.items ?? []
}

export async function fetchAllStockHistory(days: number = 30): Promise<Record<string, StockHistoryPoint[]>> {
  const res = await fetch(`${API_BASE}/api/stocks/history-all?days=${days}`)
  return res.json()
}

export async function fetchStockHistory(symbol: string, days: number = 30): Promise<StockHistoryPoint[]> {
  const res = await fetch(`${API_BASE}/api/stocks/history/${encodeURIComponent(symbol)}?days=${days}`)
  const data = await res.json()
  return data.data ?? []
}

export async function fetchStockAnalysis(): Promise<MarketAnalysis | null> {
  try {
    const res = await fetch(`${API_BASE}/api/stocks/analysis`)
    if (!res.ok) return null
    const data = await res.json()
    return data.item ?? null
  } catch {
    return null
  }
}
