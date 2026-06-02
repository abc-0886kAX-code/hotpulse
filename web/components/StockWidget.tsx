import { type StockIndex, type Locale, t } from '@/lib/i18n'

interface StockWidgetProps {
  stocks: StockIndex[]
  locale: Locale
}

function stockNameKey(name: string): string {
  const key = `stock.${name.toLowerCase()}`
  return key
}

const stockDisplayNames: Record<string, { zh: string; en: string }> = {
  '上证指数': { zh: '上证指数', en: 'Shanghai' },
  '纳斯达克': { zh: '纳斯达克', en: 'NASDAQ' },
  '恒生指数': { zh: '恒生指数', en: 'Hang Seng' },
  '标普500': { zh: '标普500', en: 'S&P 500' },
}

export default function StockWidget({ stocks, locale }: StockWidgetProps) {
  return (
    <div className="rounded-lg border border-[#333] bg-[#16213e] p-4">
      <h3 className="mb-3 text-sm font-semibold text-[#4facfe]">
        {t(locale, 'stock.title')}
      </h3>
      <div className="space-y-2">
        {stocks.map((stock) => {
          const display = stockDisplayNames[stock.name] ?? { zh: stock.name, en: stock.name }
          const isPositive = stock.change_pct >= 0
          return (
            <div key={stock.id} className="flex items-center justify-between text-sm">
              <span className="text-[#e0e0e0]">
                {locale === 'zh' ? display.zh : display.en}
              </span>
              <div className="text-right">
                <span className="text-[#e0e0e0]">{stock.price.toFixed(2)}</span>
                <span
                  className={`ml-2 text-xs ${
                    isPositive ? 'text-[#00c853]' : 'text-[#ff1744]'
                  }`}
                >
                  {isPositive ? '+' : ''}{stock.change_pct.toFixed(2)}%
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
