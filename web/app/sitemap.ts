import { type MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hotpulse-psi.vercel.app'

const STOCK_INDICES = [
  { symbol: '1.000001', name: '上证指数' },
  { symbol: '0.399001', name: '深证成指' },
  { symbol: '0.399006', name: '创业板指' },
  { symbol: '1.000300', name: '沪深300' },
  { symbol: '0.399905', name: '中证500' },
  { symbol: '1.000688', name: '科创50' },
  { symbol: '100.DJIA', name: '道琼斯' },
  { symbol: '100.NDX100', name: '纳斯达克' },
  { symbol: '100.SPX', name: '标普500' },
  { symbol: '100.HSI', name: '恒生指数' },
  { symbol: '100.N225', name: '日经225' },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString()

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}`, lastModified: now, changeFrequency: 'always', priority: 1.0 },
    { url: `${SITE_URL}/stocks`, lastModified: now, changeFrequency: 'always', priority: 0.9 },
  ]

  const stockPages: MetadataRoute.Sitemap = STOCK_INDICES.map((s) => ({
    url: `${SITE_URL}/stocks/${s.symbol}`,
    lastModified: now,
    changeFrequency: 'hourly' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...stockPages]
}
