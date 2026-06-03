'use client'

import { useState, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { type Locale, t } from '@/lib/i18n'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hotpulse-psi.vercel.app'

interface ShareModalProps {
  open: boolean
  onClose: () => void
  locale: Locale
}

export default function ShareModal({ open, onClose, locale }: ShareModalProps) {
  const [copied, setCopied] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  if (!open) return null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SITE_URL)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = SITE_URL
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownloadQR = () => {
    const svg = document.querySelector('#share-qr svg')
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = () => {
      canvas.width = 400
      canvas.height = 400
      ctx?.drawImage(img, 0, 0, 400, 400)
      const link = document.createElement('a')
      link.download = 'hotpulse-qr.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  const handleShareTwitter = () => {
    const text = locale === 'zh'
      ? 'HotPulse — AI驱动的全球热点聚合，一个窗口看懂世界！'
      : 'HotPulse — AI-driven global trending news aggregator'
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(SITE_URL)}`, '_blank')
  }

  const handleShareWeibo = () => {
    const text = locale === 'zh'
      ? 'HotPulse — AI驱动的全球热点聚合，一个窗口看懂世界！'
      : 'HotPulse — AI-driven global trending news aggregator'
    window.open(`https://service.weibo.com/share/share.php?url=${encodeURIComponent(SITE_URL)}&title=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="animate-fade-in relative z-10 w-[90vw] max-w-md rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h3 className="mb-4 text-lg font-bold text-slate-900">
          {locale === 'zh' ? '分享 HotPulse' : 'Share HotPulse'}
        </h3>

        <p className="mb-4 text-sm text-slate-500">
          {locale === 'zh' ? '扫码或复制链接，把 AI 新闻聚合站分享给朋友' : 'Scan QR code or copy the link to share'}
        </p>

        <div className="mb-4 flex flex-col items-center rounded-xl bg-slate-50 p-4">
          <div id="share-qr" className="rounded-xl bg-white p-3">
            <QRCodeSVG
              value={SITE_URL}
              size={180}
              bgColor="#ffffff"
              fgColor="#0f172a"
              level="M"
              includeMargin={false}
            />
          </div>
          <p className="mt-2 text-xs text-slate-400">{SITE_URL}</p>
        </div>

        <div className="space-y-2">
          <button
            onClick={handleCopy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:shadow-md"
          >
            {copied ? (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                {t(locale, 'copied')}
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" /></svg>
                {t(locale, 'share.copy')}
              </>
            )}
          </button>

          <div className="flex gap-2">
            <button
              onClick={handleDownloadQR}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
              {locale === 'zh' ? '下载二维码' : 'Download QR'}
            </button>
            <button
              onClick={handleShareTwitter}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>
              Twitter
            </button>
            <button
              onClick={handleShareWeibo}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M10.098 20.323c-3.977.391-7.414-1.406-7.414-5.003 0-1.74.872-3.523 2.394-4.938 1.738-1.612 4.013-2.441 6.492-2.441 2.479 0 4.629.829 6.367 2.441 1.522 1.415 2.394 3.199 2.394 4.938 0 1.273-.597 2.383-1.533 3.158l1.414.488c-1.452 2.093-5.575 2.785-9.314 2.785-5.071 0-9.259-1.358-9.259-4.558 0-2.955 3.4-5.477 8.459-5.477 4.47 0 8.107 1.625 8.107 4.558 0 1.789-1.054 3.229-2.843 4.091l1.501-.483c-.6-.87-.854-1.862-.854-2.935 0-3.287 4.268-5.905 9.044-5.905s9.044 2.618 9.044 5.905c0 1.073-.254 2.065-.854 2.935l1.501.483c-1.789-.862-2.843-2.302-2.843-4.091zm-3.193 5.688c-.39.354-1.442.702-2.789.837a14.59 14.59 0 01-3.217.12c-2.604-.278-5.775-1.12-5.775-3.773 0-2.786 3.58-4.974 7.992-4.974 4.41 0 7.991 2.188 7.991 4.974 0 .986-.507 1.94-1.202 2.727l-.2.14c-.335.305-1.124.463-2.168.463-.378 0-.826-.032-1.324-.1.555-.514.833-1.142.833-1.834 0-1.614-1.372-2.924-3.063-2.924-1.69 0-3.063 1.31-3.063 2.924 0 .692.278 1.32.833 1.834-.498.068-.946.1-1.324.1-1.044 0-1.833-.158-2.168-.463l-.2-.14c-.695-.787-1.202-1.74-1.202-2.727z" /></svg>
              {locale === 'zh' ? '微博' : 'Weibo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
