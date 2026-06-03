'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useApp } from '@/lib/app-context'
import { fetchStocks, fetchStockRankings, fetchSectorBoards } from '@/lib/api'
import type { StockIndex, StockRanking, SectorBoardItem } from '@/lib/api'
import { stockDisplayNames } from '@/lib/i18n'
import { t } from '@/lib/i18n'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hotpulse-psi.vercel.app'

interface ReportData {
  stocks: StockIndex[]
  topGainers: StockRanking[]
  topLosers: StockRanking[]
  topIndustry: SectorBoardItem[]
  topConcept: SectorBoardItem[]
  date: string
}

function getShortDate(): string {
  const d = new Date()
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

function formatDate(): string {
  return new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
}

function formatAmount(n: number): string {
  if (n >= 1e12) return `${(n / 1e12).toFixed(1)}万亿`
  if (n >= 1e8) return `${(n / 1e8).toFixed(1)}亿`
  if (n >= 1e4) return `${(n / 1e4).toFixed(0)}万`
  return String(n)
}

export default function DailyStockReportPage() {
  const { locale } = useApp()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [stockData, gainers, losers, industry, concept] = await Promise.all([
          fetchStocks().catch(() => []),
          fetchStockRankings('up').catch(() => []),
          fetchStockRankings('down').catch(() => []),
          fetchSectorBoards('industry').catch(() => []),
          fetchSectorBoards('concept').catch(() => []),
        ])
        setData({ stocks: stockData, topGainers: gainers, topLosers: losers, topIndustry: industry, topConcept: concept, date: formatDate() })
      } catch {
        setData(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const drawReport = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !data || data.stocks.length === 0) return

    const W = 800
    const H = 1600
    const dpr = 2
    canvas.width = W * dpr
    canvas.height = H * dpr
    canvas.style.width = `${W}px`
    canvas.style.height = `${H}px`
    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)

    // 深色背景渐变
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H)
    bgGrad.addColorStop(0, '#0c1222')
    bgGrad.addColorStop(0.5, '#131c31')
    bgGrad.addColorStop(1, '#0c1222')
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, W, H)

    const px = 40
    let y = 50

    // 顶部渐变装饰条
    const topBar = ctx.createLinearGradient(0, 0, W, 0)
    topBar.addColorStop(0, '#3b82f6')
    topBar.addColorStop(0.5, '#8b5cf6')
    topBar.addColorStop(1, '#ec4899')
    ctx.fillStyle = topBar
    ctx.fillRect(0, 0, W, 5)

    // Logo 区
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 30px system-ui, sans-serif'
    ctx.fillText('⚡ HotPulse', px, y)
    y += 26
    ctx.fillStyle = '#64748b'
    ctx.font = '13px system-ui, sans-serif'
    ctx.fillText('AI 驱动的全球热点聚合 · 全球市场速报', px, y)
    y += 35

    // 分割线
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(px, y)
    ctx.lineTo(W - px, y)
    ctx.stroke()
    y += 25

    // 日期标题
    ctx.fillStyle = '#fbbf24'
    ctx.font = 'bold 20px system-ui, sans-serif'
    ctx.fillText(`📊 ${data.date}`, px, y)
    y += 50

    // ===== 统计概览 =====
    const rising = data.stocks.filter(s => s.change_pct > 0).length
    const falling = data.stocks.filter(s => s.change_pct < 0).length
    const flat = data.stocks.length - rising - falling
    const avgChange = data.stocks.length > 0
      ? data.stocks.reduce((a, s) => a + s.change_pct, 0) / data.stocks.length
      : 0

    ctx.fillStyle = '#162032'
    ctx.beginPath()
    ctx.roundRect(px - 10, y - 10, W - px * 2 + 20, 60, 10)
    ctx.fill()

    ctx.fillStyle = '#94a3b8'
    ctx.font = '13px system-ui, sans-serif'
    ctx.fillText(`全球 ${data.stocks.length} 指数`, px + 8, y + 12)

    const upColor = rising > falling ? '#ef4444' : '#22c55e'
    const downColor = falling > rising ? '#22c55e' : '#ef4444'
    ctx.fillStyle = upColor
    ctx.font = 'bold 24px system-ui, sans-serif'
    ctx.fillText(`▲${rising}`, px + 160, y + 15)
    ctx.fillStyle = downColor
    ctx.fillText(`▼${falling}`, px + 260, y + 15)
    ctx.fillStyle = '#94a3b8'
    ctx.font = '13px system-ui, sans-serif'
    ctx.fillText(`平${flat}`, px + 360, y + 15)
    ctx.fillStyle = avgChange >= 0 ? '#ef4444' : '#22c55e'
    ctx.font = 'bold 16px system-ui, sans-serif'
    ctx.fillText(`均值 ${avgChange >= 0 ? '+' : ''}${avgChange.toFixed(2)}%`, px + 440, y + 15)
    y += 75

    // ===== 全球指数行情 =====
    ctx.fillStyle = '#e2e8f0'
    ctx.font = 'bold 15px system-ui, sans-serif'
    ctx.fillText('全球指数行情', px, y)
    y += 28

    const colW = (W - px * 2) / 2
    const rowH = 44
    const maxRows = Math.min(Math.ceil(data.stocks.length / 2), 10)

    for (let i = 0; i < maxRows * 2 && i < data.stocks.length; i++) {
      const stock = data.stocks[i]
      const col = i % 2
      const row = Math.floor(i / 2)
      const x = px + col * colW
      const ry = y + row * rowH

      const display = stockDisplayNames[stock.symbol] ?? { zh: stock.name, en: stock.name }
      const isUp = stock.change_pct >= 0

      ctx.fillStyle = '#162032'
      ctx.beginPath()
      ctx.roundRect(x - 6, ry - 10, colW - 12, rowH, 6)
      ctx.fill()

      ctx.fillStyle = '#cbd5e1'
      ctx.font = '13px system-ui, sans-serif'
      ctx.fillText(display.zh, x + 4, ry + 8)

      ctx.fillStyle = isUp ? '#ef4444' : '#22c55e'
      ctx.font = 'bold 16px system-ui, sans-serif'
      ctx.fillText(stock.price.toFixed(2), x + 4, ry + 28)

      const pctStr = `${isUp ? '+' : ''}${stock.change_pct.toFixed(2)}%`
      ctx.font = 'bold 12px system-ui, sans-serif'
      const pctW = ctx.measureText(pctStr).width + 12
      ctx.fillStyle = isUp ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)'
      ctx.beginPath()
      ctx.roundRect(x + colW - pctW - 18, ry + 16, pctW, 18, 4)
      ctx.fill()
      ctx.fillStyle = isUp ? '#ef4444' : '#22c55e'
      ctx.fillText(pctStr, x + colW - pctW - 12, ry + 30)
    }

    y += maxRows * rowH + 20

    // ===== 个股涨幅榜 =====
    if (data.topGainers.length > 0) {
      ctx.strokeStyle = '#1e293b'
      ctx.beginPath()
      ctx.moveTo(px, y)
      ctx.lineTo(W - px, y)
      ctx.stroke()
      y += 25

      ctx.fillStyle = '#ef4444'
      ctx.font = 'bold 15px system-ui, sans-serif'
      ctx.fillText('🔥 个股涨幅榜 Top 10', px, y)
      y += 28

      const rankData: { name: string; pct: string; amt: string }[] = data.topGainers.slice(0, 10).map((s, i) => ({
        name: s.name,
        pct: `${(s.change_pct ?? 0) >= 0 ? '+' : ''}${(s.change_pct ?? 0).toFixed(2)}%`,
        amt: formatAmount(s.amount),
      }))

      rankData.forEach((item, i) => {
        if (y > H - 250) return
        const num = `${i + 1}.`
        ctx.fillStyle = i < 3 ? '#fbbf24' : '#64748b'
        ctx.font = '12px system-ui, sans-serif'
        ctx.fillText(num, px + 4, y + 10)

        ctx.fillStyle = '#e2e8f0'
        ctx.font = '13px system-ui, sans-serif'
        ctx.fillText(item.name, px + 32, y + 10)

        ctx.fillStyle = '#ef4444'
        ctx.font = 'bold 13px system-ui, sans-serif'
        ctx.fillText(item.pct, W - px - 80, y + 10)

        ctx.fillStyle = '#64748b'
        ctx.font = '11px system-ui, sans-serif'
        ctx.fillText(item.amt, W - px - 140, y + 10)

        y += 26
      })
    }

    // ===== 个股跌幅榜 =====
    if (data.topLosers.length > 0) {
      ctx.strokeStyle = '#1e293b'
      ctx.beginPath()
      ctx.moveTo(px, y)
      ctx.lineTo(W - px, y)
      ctx.stroke()
      y += 25

      ctx.fillStyle = '#22c55e'
      ctx.font = 'bold 15px system-ui, sans-serif'
      ctx.fillText('📉 个股跌幅榜 Top 10', px, y)
      y += 28

      const loserData = data.topLosers.slice(0, 10).map((s) => ({
        name: s.name,
        pct: `${(s.change_pct ?? 0) >= 0 ? '+' : ''}${(s.change_pct ?? 0).toFixed(2)}%`,
      }))

      loserData.forEach((item, i) => {
        if (y > H - 250) return
        const num = `${i + 1}.`
        ctx.fillStyle = i < 3 ? '#22c55e' : '#64748b'
        ctx.font = '12px system-ui, sans-serif'
        ctx.fillText(num, px + 4, y + 10)

        ctx.fillStyle = '#e2e8f0'
        ctx.font = '13px system-ui, sans-serif'
        ctx.fillText(item.name, px + 32, y + 10)

        ctx.fillStyle = '#22c55e'
        ctx.font = 'bold 13px system-ui, sans-serif'
        ctx.fillText(item.pct, W - px - 80, y + 10)

        y += 26
      })
    }

    // ===== 行业板块 Top 5 =====
    if (data.topIndustry.length > 0) {
      ctx.strokeStyle = '#1e293b'
      ctx.beginPath()
      ctx.moveTo(px, y)
      ctx.lineTo(W - px, y)
      ctx.stroke()
      y += 25

      ctx.fillStyle = '#fbbf24'
      ctx.font = 'bold 15px system-ui, sans-serif'
      ctx.fillText('🏢 行业板块 Top 5', px, y)
      y += 28

      data.topIndustry.slice(0, 5).forEach((item, i) => {
        if (y > H - 250) return
        const num = `${i + 1}.`
        ctx.fillStyle = '#64748b'
        ctx.font = '12px system-ui, sans-serif'
        ctx.fillText(num, px + 4, y + 10)

        ctx.fillStyle = '#e2e8f0'
        ctx.font = '13px system-ui, sans-serif'
        ctx.fillText(item.name, px + 32, y + 10)

        const isUp = item.change_pct >= 0
        ctx.fillStyle = isUp ? '#ef4444' : '#22c55e'
        ctx.font = 'bold 13px system-ui, sans-serif'
        ctx.fillText(`${isUp ? '+' : ''}${item.change_pct.toFixed(2)}%`, W - px - 120, y + 10)

        ctx.fillStyle = '#64748b'
        ctx.font = '11px system-ui, sans-serif'
        ctx.fillText(`${item.up_count}涨 / ${item.down_count}跌`, W - px - 200, y + 10)

        y += 26
      })
    }

    // ===== 概念板块 Top 5 =====
    if (data.topConcept.length > 0) {
      ctx.strokeStyle = '#1e293b'
      ctx.beginPath()
      ctx.moveTo(px, y)
      ctx.lineTo(W - px, y)
      ctx.stroke()
      y += 25

      ctx.fillStyle = '#a855f7'
      ctx.font = 'bold 15px system-ui, sans-serif'
      ctx.fillText('💡 概念板块 Top 5', px, y)
      y += 28

      data.topConcept.slice(0, 5).forEach((item, i) => {
        if (y > H - 200) return
        const num = `${i + 1}.`
        ctx.fillStyle = '#64748b'
        ctx.font = '12px system-ui, sans-serif'
        ctx.fillText(num, px + 4, y + 10)

        ctx.fillStyle = '#e2e8f0'
        ctx.font = '13px system-ui, sans-serif'
        ctx.fillText(item.name, px + 32, y + 10)

        const isUp = item.change_pct >= 0
        ctx.fillStyle = isUp ? '#ef4444' : '#22c55e'
        ctx.font = 'bold 13px system-ui, sans-serif'
        ctx.fillText(`${isUp ? '+' : ''}${item.change_pct.toFixed(2)}%`, W - px - 120, y + 10)

        ctx.fillStyle = '#64748b'
        ctx.font = '11px system-ui, sans-serif'
        ctx.fillText(`${item.up_count}涨 / ${item.down_count}跌`, W - px - 200, y + 10)

        y += 26
      })
    }

    // ===== 底部 =====
    const footerY = H - 100
    ctx.strokeStyle = '#1e293b'
    ctx.beginPath()
    ctx.moveTo(px, footerY)
    ctx.lineTo(W - px, footerY)
    ctx.stroke()

    ctx.fillStyle = '#475569'
    ctx.font = '12px system-ui, sans-serif'
    ctx.fillText(`由 HotPulse AI 生成 · 数据来源：东方财富 · ${getShortDate()}`, px, footerY + 25)

    ctx.fillStyle = '#3b82f6'
    ctx.font = 'bold 15px system-ui, sans-serif'
    ctx.fillText(SITE_URL, px, footerY + 55)

    ctx.fillStyle = '#64748b'
    ctx.font = '11px system-ui, sans-serif'
    ctx.fillText('长按保存图片 · 分享到微信群/朋友圈', px, footerY + 78)
  }, [data])

  useEffect(() => {
    if (!loading && data) drawReport()
  }, [loading, data, drawReport])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `hotpulse-market-${getShortDate()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  if (loading) {
    return <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4"><p className="text-slate-400">{locale === 'zh' ? '加载数据中...' : 'Loading...'}</p></div>
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">{locale === 'zh' ? '每日股市早报' : 'Daily Market Brief'}</h1>
      <p className="mb-6 text-sm text-slate-400">
        {locale === 'zh' ? 'AI 生成 · 指数行情 + 个股涨跌 + 板块排行，一键下载分享' : 'AI-generated · indices + stock rankings + sector boards'}
      </p>

      <div className="mb-6 flex justify-center rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <canvas ref={canvasRef} className="rounded-xl shadow-lg" />
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        <button onClick={handleDownload} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-sm font-medium text-white transition-all hover:shadow-lg">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
          {t(locale, 'report.download')}
        </button>
        <button onClick={() => { navigator.clipboard.writeText(SITE_URL).catch(() => {}) }} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-600 transition-all hover:border-slate-300">
          {t(locale, 'report.copy')}
        </button>
      </div>

      <p className="mt-4 text-center text-xs text-slate-400">{t(locale, 'report.tip')}</p>
    </div>
  )
}
