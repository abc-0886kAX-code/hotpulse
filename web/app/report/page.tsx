'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useApp } from '@/lib/app-context'
import { fetchStocks, fetchStockKLine } from '@/lib/api'
import type { StockIndex } from '@/lib/api'
import { stockDisplayNames } from '@/lib/i18n'
import { t } from '@/lib/i18n'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hotpulse-psi.vercel.app'

interface ReportData {
  stocks: StockIndex[]
  topGainers: StockIndex[]
  topLosers: StockIndex[]
  date: string
  greeting: string
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 6) return '夜深了'
  if (h < 12) return '早上好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
}

function getDateStr(): string {
  return new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
}

function getShortDate(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function DailyReportPage() {
  const { locale } = useApp()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const stockData = await fetchStocks()
        stockData.sort((a, b) => b.change_pct - a.change_pct)
        setData({
          stocks: stockData,
          topGainers: stockData.filter(s => s.change_pct > 0).slice(0, 3),
          topLosers: stockData.filter(s => s.change_pct < 0).sort((a, b) => a.change_pct - b.change_pct).slice(0, 3),
          date: getDateStr(),
          greeting: getGreeting(),
        })
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
    if (!canvas || !data) return

    const W = 800
    const H = 1200
    canvas.width = W * 2
    canvas.height = H * 2
    canvas.style.width = `${W}px`
    canvas.style.height = `${H}px`
    const ctx = canvas.getContext('2d')!
    ctx.scale(2, 2)

    // 背景
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H)
    bgGrad.addColorStop(0, '#0f172a')
    bgGrad.addColorStop(0.3, '#1e293b')
    bgGrad.addColorStop(1, '#0f172a')
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, W, H)

    // 顶部装饰线
    const topGrad = ctx.createLinearGradient(0, 0, W, 0)
    topGrad.addColorStop(0, '#3b82f6')
    topGrad.addColorStop(0.5, '#8b5cf6')
    topGrad.addColorStop(1, '#ec4899')
    ctx.fillStyle = topGrad
    ctx.fillRect(0, 0, W, 4)

    const px = 40
    let y = 50

    // Logo
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 28px system-ui, sans-serif'
    ctx.fillText('HotPulse', px, y)
    ctx.fillStyle = '#94a3b8'
    ctx.font = '14px system-ui, sans-serif'
    ctx.fillText('AI 驱动的全球热点聚合', px, y + 24)
    y += 60

    // 分割线
    ctx.strokeStyle = '#334155'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(px, y)
    ctx.lineTo(W - px, y)
    ctx.stroke()
    y += 30

    // 日期
    ctx.fillStyle = '#fbbf24'
    ctx.font = 'bold 22px system-ui, sans-serif'
    ctx.fillText(`📊 ${data.date}`, px, y)
    y += 20
    ctx.fillStyle = '#94a3b8'
    ctx.font = '14px system-ui, sans-serif'
    ctx.fillText('全球市场速报 · AI 精选', px, y)
    y += 50

    // 上涨下跌统计
    const rising = data.stocks.filter(s => s.change_pct > 0).length
    const falling = data.stocks.filter(s => s.change_pct < 0).length

    ctx.fillStyle = '#1e293b'
    ctx.beginPath()
    ctx.roundRect(px - 10, y - 10, W - px * 2 + 20, 50, 10)
    ctx.fill()

    ctx.fillStyle = '#94a3b8'
    ctx.font = '13px system-ui, sans-serif'
    ctx.fillText(`监测 ${data.stocks.length} 个指数`, px + 8, y + 15)
    ctx.fillStyle = '#ef4444'
    ctx.fillText(`▲ ${rising} 上涨`, px + 150, y + 15)
    ctx.fillStyle = '#22c55e'
    ctx.fillText(`▼ ${falling} 下跌`, px + 260, y + 15)
    y += 70

    // 指数列表
    ctx.fillStyle = '#e2e8f0'
    ctx.font = 'bold 16px system-ui, sans-serif'
    ctx.fillText('全球指数行情', px, y)
    y += 30

    const colW = (W - px * 2) / 2
    const rowH = 52
    data.stocks.forEach((stock, idx) => {
      const col = idx % 2
      const row = Math.floor(idx / 2)
      const x = px + col * colW
      const ry = y + row * rowH

      if (ry > H - 280) return

      const display = stockDisplayNames[stock.symbol] ?? { zh: stock.name, en: stock.name }
      const isUp = stock.change_pct >= 0

      // 背景
      ctx.fillStyle = '#1e293b'
      ctx.beginPath()
      ctx.roundRect(x - 8, ry - 12, colW - 16, rowH - 4, 8)
      ctx.fill()

      // 名称
      ctx.fillStyle = '#e2e8f0'
      ctx.font = '14px system-ui, sans-serif'
      ctx.fillText(display.zh, x + 4, ry + 8)

      // 价格
      ctx.fillStyle = isUp ? '#ef4444' : '#22c55e'
      ctx.font = 'bold 18px system-ui, sans-serif'
      ctx.fillText(stock.price.toFixed(2), x + 4, ry + 32)

      // 涨跌幅
      const pctStr = `${isUp ? '+' : ''}${stock.change_pct.toFixed(2)}%`
      ctx.font = 'bold 13px system-ui, sans-serif'
      const pctW = ctx.measureText(pctStr).width + 16
      ctx.fillStyle = isUp ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)'
      ctx.beginPath()
      ctx.roundRect(x + colW - pctW - 20, ry + 20, pctW, 22, 6)
      ctx.fill()
      ctx.fillStyle = isUp ? '#ef4444' : '#22c55e'
      ctx.fillText(pctStr, x + colW - pctW - 12, ry + 36)
    })

    y += Math.ceil(data.stocks.length / 2) * rowH + 30

    // 底部
    const footerY = H - 130
    ctx.strokeStyle = '#334155'
    ctx.beginPath()
    ctx.moveTo(px, footerY)
    ctx.lineTo(W - px, footerY)
    ctx.stroke()

    // 热门板块提示
    ctx.fillStyle = '#94a3b8'
    ctx.font = '13px system-ui, sans-serif'
    ctx.fillText('🔥 实时行业/概念板块涨幅排行 · 访问 HotPulse 查看 K线图', px, footerY + 30)

    // 网站水印
    ctx.fillStyle = '#64748b'
    ctx.font = '14px system-ui, sans-serif'
    ctx.fillText(`由 HotPulse AI 生成 · ${getShortDate()}`, px, footerY + 65)

    ctx.fillStyle = '#3b82f6'
    ctx.font = 'bold 16px system-ui, sans-serif'
    ctx.fillText(SITE_URL, px, footerY + 95)
  }, [data])

  useEffect(() => {
    if (!loading && data) {
      drawReport()
    }
  }, [loading, data, drawReport])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `hotpulse-daily-${getShortDate()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  if (loading) {
    return (
      <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4">
        <p className="text-slate-400">加载中...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">
        {locale === 'zh' ? '每日市场早报' : 'Daily Market Brief'}
      </h1>
      <p className="mb-6 text-sm text-slate-400">
        {locale === 'zh' ? 'AI 生成的每日股市速报，一键下载分享到朋友圈/微信群' : 'AI-generated daily market briefing'}
      </p>

      <div className="mb-6 flex justify-center rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <canvas ref={canvasRef} className="rounded-xl shadow-lg" />
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-sm font-medium text-white transition-all hover:shadow-lg"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
          {locale === 'zh' ? '下载早报图片' : 'Download Report'}
        </button>
        <button
          onClick={() => {
            navigator.clipboard.writeText(SITE_URL).catch(() => {})
          }}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-600 transition-all hover:border-slate-300"
        >
          {locale === 'zh' ? '复制网站链接' : 'Copy Link'}
        </button>
      </div>

      <p className="mt-4 text-center text-xs text-slate-400">
        {locale === 'zh' ? '提示：图片适合分享到微信群、朋友圈，让更多人看到你的专业财经资讯' : 'Tip: Perfect for sharing on social media'}
      </p>
    </div>
  )
}
