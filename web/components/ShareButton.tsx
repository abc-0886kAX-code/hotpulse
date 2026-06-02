'use client'

import { useState, useRef, useEffect } from 'react'
import { type Locale, t } from '@/lib/i18n'
import { shareToTwitter, shareToWeibo, copyToClipboard } from '@/lib/export'

interface ShareButtonProps {
  text: string
  url?: string
  locale: Locale
}

export default function ShareButton({ text, url, locale }: ShareButtonProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleCopy = async () => {
    const fullText = url ? `${text} ${url}` : text
    const ok = await copyToClipboard(fullText)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      setOpen(false)
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="rounded-lg px-3 py-1 text-xs text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
      >
        {t(locale, 'quote.share')}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-zinc-700 bg-zinc-800 py-1 shadow-xl">
          <button
            onClick={() => { shareToTwitter(text, url); setOpen(false) }}
            className="block w-full px-3 py-1.5 text-left text-sm text-zinc-300 hover:bg-zinc-700"
          >
            {t(locale, 'share.twitter')}
          </button>
          <button
            onClick={() => { shareToWeibo(text, url); setOpen(false) }}
            className="block w-full px-3 py-1.5 text-left text-sm text-zinc-300 hover:bg-zinc-700"
          >
            {t(locale, 'share.weibo')}
          </button>
          <button
            onClick={handleCopy}
            className="block w-full px-3 py-1.5 text-left text-sm text-zinc-300 hover:bg-zinc-700"
          >
            {copied ? t(locale, 'copied') : t(locale, 'share.copy')}
          </button>
        </div>
      )}
    </div>
  )
}
