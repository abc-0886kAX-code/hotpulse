import { type Quote } from '@/lib/api'
import { type Locale, t } from '@/lib/i18n'

export function exportQuoteAsImage(quote: Quote, locale: Locale) {
  const canvas = document.createElement('canvas')
  canvas.width = 800
  canvas.height = 400
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.fillStyle = '#18181b'
  ctx.fillRect(0, 0, 800, 400)

  ctx.fillStyle = '#3b82f6'
  ctx.fillRect(0, 0, 4, 400)

  ctx.fillStyle = '#fafafa'
  ctx.font = 'italic 24px Inter, system-ui, sans-serif'
  const text = locale === 'zh' ? quote.text_zh : quote.text_en
  const lines = wrapText(ctx, text, 700)
  const startY = 160 - (lines.length * 16)
  lines.forEach((line, i) => {
    ctx.fillText(line, 40, startY + i * 40)
  })

  ctx.fillStyle = '#71717a'
  ctx.font = '16px Inter, system-ui, sans-serif'
  ctx.fillText(`— ${quote.author}`, 40, startY + lines.length * 40 + 30)

  ctx.fillStyle = '#52525b'
  ctx.font = '14px Inter, system-ui, sans-serif'
  ctx.fillText('HotPulse', 40, 370)

  canvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hotpulse-quote-${Date.now()}.png`
    a.click()
    URL.revokeObjectURL(url)
  })
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split('')
  const lines: string[] = []
  let currentLine = ''
  for (const char of words) {
    const test = currentLine + char
    if (ctx.measureText(test).width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = char
    } else {
      currentLine = test
    }
  }
  if (currentLine) lines.push(currentLine)
  return lines.slice(0, 4)
}

export function shareToTwitter(text: string, url?: string) {
  const params = new URLSearchParams({ text })
  if (url) params.set('url', url)
  window.open(`https://twitter.com/intent/tweet?${params}`, '_blank')
}

export function shareToWeibo(title: string, url?: string) {
  const params = new URLSearchParams({ title })
  if (url) params.set('url', url)
  window.open(`https://service.weibo.com/share/share.php?${params}`, '_blank')
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
