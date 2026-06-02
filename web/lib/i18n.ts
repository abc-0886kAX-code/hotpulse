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
    'nav.hot': '热点', 'nav.tech': '科技', 'nav.finance': '财经',
    'nav.entertainment': '娱乐', 'nav.sports': '体育',
    'stock.title': '股市速报', 'stock.shanghai': '上证指数', 'stock.nasdaq': '纳斯达克',
    'stock.hsi': '恒生指数', 'stock.sp500': '标普500',
    'quote.share': '分享', 'load.more': '加载更多', 'loading': '加载中...',
    'sentiment.positive': '正面', 'sentiment.negative': '负面', 'sentiment.neutral': '中性',
    'ad.placeholder': '广告位 AdSense',
    'meta.ago': '{time}前', 'meta.discussions': '{count} 讨论', 'meta.heat': '热度 {score}',
  },
  en: {
    'nav.hot': 'Hot', 'nav.tech': 'Tech', 'nav.finance': 'Finance',
    'nav.entertainment': 'Entertainment', 'nav.sports': 'Sports',
    'stock.title': 'Stock Market', 'stock.shanghai': 'Shanghai', 'stock.nasdaq': 'NASDAQ',
    'stock.hsi': 'Hang Seng', 'stock.sp500': 'S&P 500',
    'quote.share': 'Share', 'load.more': 'Load More', 'loading': 'Loading...',
    'sentiment.positive': 'Positive', 'sentiment.negative': 'Negative', 'sentiment.neutral': 'Neutral',
    'ad.placeholder': 'Ad Space',
    'meta.ago': '{time} ago', 'meta.discussions': '{count} comments', 'meta.heat': 'Heat {score}',
  }
}

export function t(locale: Locale, key: string): string {
  return messages[locale]?.[key] ?? key
}
