export type Locale = 'zh' | 'en'

export const categories = [
  { slug: 'all', zh: '全部', en: 'All' },
  { slug: 'tech', zh: '科技', en: 'Tech' },
  { slug: 'finance', zh: '财经', en: 'Finance' },
  { slug: 'entertainment', zh: '娱乐', en: 'Entertainment' },
  { slug: 'sports', zh: '体育', en: 'Sports' },
  { slug: 'health', zh: '健康', en: 'Health' },
  { slug: 'other', zh: '其他', en: 'Other' },
] as const

export const platformNames: Record<string, { zh: string; en: string }> = {
  reddit: { zh: 'Reddit', en: 'Reddit' },
  hackernews: { zh: 'Hacker News', en: 'Hacker News' },
  weibo: { zh: '微博', en: 'Weibo' },
  youtube: { zh: 'YouTube', en: 'YouTube' },
  twitter: { zh: 'Twitter', en: 'Twitter' },
}

const messages: Record<Locale, Record<string, string>> = {
  zh: {
    'nav.news': '新闻', 'nav.stocks': '股市',
    'region.all': '全部', 'region.domestic': '国内', 'region.foreign': '国际',
    'stock.overview': '全球市场概览',
    'stock.shanghai': '上证指数', 'stock.nasdaq': '纳斯达克',
    'stock.hsi': '恒生指数', 'stock.sp500': '标普500',
    'quote.share': '分享', 'quote.export': '导出图片',
    'load.more': '加载更多', 'loading': '加载中...',
    'sentiment.positive': '正面', 'sentiment.negative': '负面', 'sentiment.neutral': '中性',
    'meta.ago': '{time}前', 'meta.heat': '热度 {score}',
    'export.csv': '导出 CSV', 'share.twitter': '分享到 Twitter', 'share.weibo': '分享到微博',
    'share.copy': '复制链接', 'copied': '已复制',
  },
  en: {
    'nav.news': 'News', 'nav.stocks': 'Stocks',
    'region.all': 'All', 'region.domestic': 'Domestic', 'region.foreign': 'International',
    'stock.overview': 'Global Market Overview',
    'stock.shanghai': 'Shanghai', 'stock.nasdaq': 'NASDAQ',
    'stock.hsi': 'Hang Seng', 'stock.sp500': 'S&P 500',
    'quote.share': 'Share', 'quote.export': 'Export Image',
    'load.more': 'Load More', 'loading': 'Loading...',
    'sentiment.positive': 'Positive', 'sentiment.negative': 'Negative', 'sentiment.neutral': 'Neutral',
    'meta.ago': '{time} ago', 'meta.heat': 'Heat {score}',
    'export.csv': 'Export CSV', 'share.twitter': 'Share on Twitter', 'share.weibo': 'Share on Weibo',
    'share.copy': 'Copy Link', 'copied': 'Copied',
  }
}

export function t(locale: Locale, key: string): string {
  return messages[locale]?.[key] ?? key
}
