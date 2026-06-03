import { type Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import StockIndexContent from './StockIndexContent'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const stockDisplayNames: Record<string, { zh: string; en: string }> = {
  '1.000001': { zh: '上证指数', en: 'Shanghai Composite' },
  '0.399001': { zh: '深证成指', en: 'Shenzhen Component' },
  '0.399006': { zh: '创业板指', en: 'ChiNext' },
  '1.000300': { zh: '沪深300', en: 'CSI 300' },
  '0.399905': { zh: '中证500', en: 'CSI 500' },
  '1.000688': { zh: '科创50', en: 'STAR 50' },
  '100.DJIA': { zh: '道琼斯', en: 'Dow Jones' },
  '100.NDX100': { zh: '纳斯达克', en: 'NASDAQ' },
  '100.SPX': { zh: '标普500', en: 'S&P 500' },
  '100.HSI': { zh: '恒生指数', en: 'Hang Seng' },
  '100.N225': { zh: '日经225', en: 'Nikkei 225' },
}

export async function generateStaticParams() {
  return Object.keys(stockDisplayNames).map((symbol) => ({ symbol }))
}

export async function generateMetadata({ params }: { params: Promise<{ symbol: string }> }): Promise<Metadata> {
  const { symbol } = await params
  const display = stockDisplayNames[symbol]
  if (!display) return { title: 'HotPulse' }

  return {
    title: `${display.zh} (${display.en}) 实时行情 + K线图 — HotPulse`,
    description: `${display.zh}最新价格、涨跌幅、OHLCV K线图、MA均线分析。HotPulse AI驱动的全球股市数据平台。`,
    openGraph: {
      title: `${display.zh} — 实时行情`,
      description: `${display.zh} OHLCV K线图 + 历史数据分析`,
      type: 'article',
      siteName: 'HotPulse',
    },
  }
}

export default async function StockIndexPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params
  const display = stockDisplayNames[symbol]
  if (!display) notFound()

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link href="/stocks" className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-blue-600">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
        返回股市首页
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{display.zh}</h1>
        <p className="mt-1 text-sm text-slate-400">{display.en} · {symbol}</p>
      </div>

      <StockIndexContent symbol={symbol} nameZh={display.zh} />
    </div>
  )
}
