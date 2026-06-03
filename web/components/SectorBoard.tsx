'use client'

import { type SectorBoardItem } from '@/lib/api'
import { type Locale } from '@/lib/i18n'

interface SectorBoardProps {
  items: SectorBoardItem[]
  locale: Locale
}

function rankColor(rank: number): string {
  if (rank === 1) return 'bg-red-50 text-red-600 border-red-200'
  if (rank === 2) return 'bg-orange-50 text-orange-600 border-orange-200'
  if (rank === 3) return 'bg-amber-50 text-amber-600 border-amber-200'
  return 'bg-slate-50 text-slate-400 border-slate-200'
}

function formatAmount(amount: number): string {
  if (amount >= 1e12) return `${(amount / 1e12).toFixed(1)}万亿`
  if (amount >= 1e8) return `${(amount / 1e8).toFixed(1)}亿`
  if (amount >= 1e4) return `${(amount / 1e4).toFixed(1)}万`
  return String(amount)
}

export default function SectorBoard({ items, locale }: SectorBoardProps) {
  if (items.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/50">
        <p className="text-sm text-slate-400">{locale === 'zh' ? '暂无板块数据' : 'No sector data'}</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/50">
            <th className="w-10 px-3 py-2.5 text-left text-xs font-medium text-slate-400">{locale === 'zh' ? '# ' : ''}</th>
            <th className="px-3 py-2.5 text-left text-xs font-medium text-slate-400">{locale === 'zh' ? '板块名称' : 'Sector'}</th>
            <th className="px-3 py-2.5 text-right text-xs font-medium text-slate-400">{locale === 'zh' ? '涨跌幅' : 'Change %'}</th>
            <th className="hidden px-3 py-2.5 text-right text-xs font-medium text-slate-400 sm:table-cell">{locale === 'zh' ? '成交额' : 'Amount'}</th>
            <th className="hidden px-3 py-2.5 text-center text-xs font-medium text-slate-400 md:table-cell">{locale === 'zh' ? '涨/跌' : 'Up/Down'}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => {
            const isUp = item.change_pct >= 0
            return (
              <tr key={item.code} className="border-b border-slate-50 transition-colors hover:bg-slate-50/80">
                <td className="px-3 py-2.5">
                  <span className={`inline-flex h-6 w-6 items-center justify-center rounded-md border text-xs font-bold ${rankColor(idx + 1)}`}>
                    {idx + 1}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-sm font-medium text-slate-700">{item.name}</td>
                <td className={`px-3 py-2.5 text-right text-sm font-bold ${isUp ? 'stock-up' : 'stock-down'}`}>
                  {isUp ? '+' : ''}{item.change_pct.toFixed(2)}%
                </td>
                <td className="hidden px-3 py-2.5 text-right text-sm text-slate-500 sm:table-cell">
                  {formatAmount(item.amount)}
                </td>
                <td className="hidden px-3 py-2.5 text-center text-xs text-slate-400 md:table-cell">
                  <span className="text-red-500">{item.up_count}</span>
                  <span className="mx-0.5 text-slate-300">/</span>
                  <span className="text-green-500">{item.down_count}</span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
