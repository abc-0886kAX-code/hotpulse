import { type StockIndex } from '@/lib/api'
import { type Locale, t } from '@/lib/i18n'
import SparklineChart from './SparklineChart'

interface StockCardProps {
  stock: StockIndex
  history: { price: number }[]
  locale: Locale
}

const stockDisplayNames: Record<string, { zh: string; en: string }> = {
  '上证指数': { zh: '上证指数', en: 'Shanghai Composite' },
  '纳斯达克综合': { zh: '纳斯达克', en: 'NASDAQ Composite' },
  '恒生指数': { zh: '恒生指数', en: 'Hang Seng Index' },
  '标普500': { zh: '标普500', en: 'S&P 500' },
}

export default function StockCard({ stock, history, locale }: StockCardProps) {
  const display = stockDisplayNames[stock.name] ?? { zh: stock.name, en: stock.name }
  const isPositive = stock.change_pct >= 0

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition-all hover:border-zinc-700">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-300">
          {locale === 'zh' ? display.zh : display.en}
        </h3>
        <span className={`text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? '+' : ''}{stock.change_pct.toFixed(2)}%
        </span>
      </div>
      <p className="mb-3 text-2xl font-bold text-zinc-100">
        {stock.price.toFixed(2)}
      </p>
      <SparklineChart data={history} positive={isPositive} />
    </div>
  )
}
