'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useApp } from '@/lib/app-context'
import { fetchTrending, fetchTrendingStats } from '@/lib/api'
import type { TrendingItem, TrendingStats } from '@/lib/api'
import { platformNames, categories } from '@/lib/i18n'
import { t } from '@/lib/i18n'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hotpulse-psi.vercel.app'

interface NewsReportData {
  items: TrendingItem[]
  stats: TrendingStats | null
  date: string
}

function getShortDate(): string {
  const d = new Date()
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

function formatDate(): string {
  return new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
}

function categoryLabel(cat: string): string {
  const found = categories.find(c => c.slug === cat)
  return found?.zh ?? cat
}

function platformLabel(plat: string): string {
  return platformNames[plat]?.zh ?? plat
}

function sentimentEmoji(s: string): string {
  if (s === 'positive') return '😊'
  if (s === 'negative') return '😟'
  return '😐'
}

function sentimentColor(s: string): string {
  if (s === 'positive') return '#22c55e'
  if (s === 'negative') return '#ef4444'
  return '#94a3b8'
}

export default function NewsReportPage() {
  const { locale } = useApp()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [data, setData] = useState<NewsReportData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [items, stats] = await Promise.all([
          fetchTrending({ page_size: 30 }).catch(() => []),
          fetchTrendingStats().catch(() => null),
        ])
        setData({ items, stats, date: formatDate() })
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
    if (!canvas || !data || data.items.length === 0) return

    const W = 800
    const H = 1800
    const dpr = 2
    canvas.width = W * dpr
    canvas.height = H * dpr
    canvas.style.width = `${W}px`
    canvas.style.height = `${H}px`
    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)

    // 背景
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H)
    bgGrad.addColorStop(0, '#0c1222')
    bgGrad.addColorStop(0.5, '#131c31')
    bgGrad.addColorStop(1, '#0c1222')
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, W, H)

    const px = 40
    let y = 50

    // 顶部渐变条
    const topBar = ctx.createLinearGradient(0, 0, W, 0)
    topBar.addColorStop(0, '#3b82f6')
    topBar.addColorStop(0.5, '#8b5cf6')
    topBar.addColorStop(1, '#ec4899')
    ctx.fillStyle = topBar
    ctx.fillRect(0, 0, W, 5)

    // Logo
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 30px system-ui, sans-serif'
    ctx.fillText('⚡ HotPulse', px, y)
    y += 26
    ctx.fillStyle = '#64748b'
    ctx.font = '13px system-ui, sans-serif'
    ctx.fillText('AI 驱动的全球热点聚合 · 每日新闻速报', px, y)
    y += 35

    // 分割线
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(px, y)
    ctx.lineTo(W - px, y)
    ctx.stroke()
    y += 25

    // 日期
    ctx.fillStyle = '#fbbf24'
    ctx.font = 'bold 20px system-ui, sans-serif'
    ctx.fillText(`📰 ${data.date}`, px, y)
    y += 50

    // ===== 统计概览 =====
    if (data.stats) {
      ctx.fillStyle = '#162032'
      ctx.beginPath()
      ctx.roundRect(px - 10, y - 10, W - px * 2 + 20, 70, 10)
      ctx.fill()

      ctx.fillStyle = '#94a3b8'
      ctx.font = '13px system-ui, sans-serif'
      ctx.fillText(`共 ${data.items.length} 条热点`, px + 8, y + 12)

      // 分类统计
      const cats = data.stats.categoryDistribution
      let catX = px + 140
      if (cats) {
        const sorted = Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 5)
        sorted.forEach(([cat, count]) => {
          const label = categoryLabel(cat)
          const text = `${label} ${count}`
          ctx.fillStyle = '#64748b'
          ctx.font = '12px system-ui, sans-serif'
          ctx.fillText(text, catX, y + 12)
          catX += ctx.measureText(text).width + 16
        })
      }

      // 情感分布
      const sent = data.stats.sentimentDistribution
      if (sent) {
        const pos = sent.positive ?? 0
        const neg = sent.negative ?? 0
        const neu = sent.neutral ?? 0
        ctx.fillStyle = '#22c55e'
        ctx.font = '13px system-ui, sans-serif'
        ctx.fillText(`😊${pos}`, px + 8, y + 38)
        ctx.fillStyle = '#ef4444'
        ctx.fillText(`😟${neg}`, px + 60, y + 38)
        ctx.fillStyle = '#94a3b8'
        ctx.fillText(`😐${neu}`, px + 120, y + 38)
      }

      y += 85
    }

    // ===== 按来源分组的热点 =====
    const grouped = new Map<string, TrendingItem[]>()
    data.items.forEach(item => {
      const plat = item.platform || 'other'
      if (!grouped.has(plat)) grouped.set(plat, [])
      grouped.get(plat)!.push(item)
    })

    const colors: Record<string, string> = {
      daily60s: '#3b82f6',
      weibo: '#ef4444',
      toutiao: '#f97316',
      baidu: '#6366f1',
      hackernews: '#10b981',
    }

    for (const [plat, items] of grouped) {
      if (y > H - 200) break

      ctx.strokeStyle = '#1e293b'
      ctx.beginPath()
      ctx.moveTo(px, y)
      ctx.lineTo(W - px, y)
      ctx.stroke()
      y += 20

      const color = colors[plat] ?? '#8b5cf6'
      ctx.fillStyle = color
      ctx.font = 'bold 15px system-ui, sans-serif'
      ctx.fillText(`📌 ${platformLabel(plat)}`, px, y)
      ctx.fillStyle = '#64748b'
      ctx.font = '12px system-ui, sans-serif'
      ctx.fillText(`${items.length} 条`, px + ctx.measureText(`📌 ${platformLabel(plat)}`).width + 10, y)
      y += 28

      items.slice(0, 10).forEach((item, i) => {
        if (y > H - 200) return

        const rankColor = i < 3 ? '#fbbf24' : '#475569'
        ctx.fillStyle = rankColor
        ctx.font = 'bold 12px system-ui, sans-serif'
        const num = i < 3 ? `${i + 1}` : `${i + 1}.`
        ctx.fillText(num, px + 4, y + 12)

        // 标题
        ctx.fillStyle = '#e2e8f0'
        ctx.font = '13px system-ui, sans-serif'
        const title = item.title.length > 28 ? item.title.slice(0, 28) + '...' : item.title
        ctx.fillText(title, px + 32, y + 12)

        // 情感
        ctx.fillStyle = sentimentColor(item.sentiment)
        ctx.font = '12px system-ui, sans-serif'
        ctx.fillText(sentimentEmoji(item.sentiment), W - px - 20, y + 12)

        // 热度
        if (item.heat_score > 0) {
          ctx.fillStyle = '#475569'
          ctx.font = '10px system-ui, sans-serif'
          ctx.fillText(`🔥${item.heat_score}`, W - px - 50, y + 12)
        }

        // AI 摘要（前5条显示）
        if (i < 5 && item.ai_summary_zh) {
          y += 18
          const summary = item.ai_summary_zh.length > 40 ? item.ai_summary_zh.slice(0, 40) + '...' : item.ai_summary_zh
          ctx.fillStyle = '#64748b'
          ctx.font = '11px system-ui, sans-serif'
          ctx.fillText(`  ${summary}`, px + 32, y + 8)
        }

        // 分类标签
        ctx.fillStyle = '#334155'
        ctx.font = '10px system-ui, sans-serif'
        const catLabel = categoryLabel(item.category)
        ctx.fillText(catLabel, px + 32, y + 28)

        y += 44
      })
    }

    // ===== 底部 =====
    const footerY = H - 80
    ctx.strokeStyle = '#1e293b'
    ctx.beginPath()
    ctx.moveTo(px, footerY)
    ctx.lineTo(W - px, footerY)
    ctx.stroke()

    ctx.fillStyle = '#475569'
    ctx.font = '12px system-ui, sans-serif'
    ctx.fillText(`由 HotPulse AI 生成 · ${getShortDate()}`, px, footerY + 22)

    ctx.fillStyle = '#3b82f6'
    ctx.font = 'bold 15px system-ui, sans-serif'
    ctx.fillText(SITE_URL, px, footerY + 48)
  }, [data])

  useEffect(() => {
    if (!loading && data) drawReport()
  }, [loading, data, drawReport])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `hotpulse-news-${getShortDate()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  if (loading) {
    return <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4"><p className="text-slate-400">{locale === 'zh' ? '加载新闻数据中...' : 'Loading news...'}</p></div>
  }

  if (!data || data.items.length === 0) {
    return <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4"><p className="text-slate-400">{locale === 'zh' ? '暂无新闻数据' : 'No news data available'}</p></div>
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">{locale === 'zh' ? '每日新闻早报' : 'Daily News Brief'}</h1>
      <p className="mb-6 text-sm text-slate-400">
        {locale === 'zh' ? 'AI 生成 · 热点新闻 + AI 摘要 + 情感分析，一键下载分享' : 'AI-generated · trending news + AI summaries + sentiment analysis'}
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
