'use client'

import { useEffect, useRef, useMemo } from 'react'
import ReactEChartsCore from 'echarts-for-react'
import * as echarts from 'echarts/core'
import { CandlestickChart as EChartsCandlestick, LineChart, BarChart } from 'echarts/charts'
import {
  GridComponent, TooltipComponent, LegendComponent,
  DataZoomComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  EChartsCandlestick, LineChart, BarChart,
  GridComponent, TooltipComponent, LegendComponent,
  DataZoomComponent,
  CanvasRenderer,
])

interface KLineData {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  amount?: number
  change_pct?: number
}

interface CandlestickChartProps {
  data: KLineData[]
  height?: number
  maPeriods?: number[]
}

function calcMA(data: number[], period: number): (number | null)[] {
  return data.map((_, i) => {
    if (i < period - 1) return null
    let sum = 0
    for (let j = i - period + 1; j <= i; j++) sum += data[j]
    return Number((sum / period).toFixed(2))
  })
}

export default function CandlestickChart({ data, height = 500, maPeriods = [5, 10, 20] }: CandlestickChartProps) {
  const chartRef = useRef<ReactEChartsCore>(null)

  useEffect(() => {
    const handleResize = () => chartRef.current?.getEchartsInstance()?.resize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const option = useMemo(() => {
    if (data.length === 0) return {}

    const dates = data.map(d => d.date)
    const ohlc = data.map(d => [d.open, d.close, d.low, d.high])
    const volumes = data.map(d => d.volume)
    const closes = data.map(d => d.close)

    const maColors = ['#eab308', '#3b82f6', '#a855f7']

    const maSeries = maPeriods.map((period, idx) => ({
      name: `MA${period}`,
      type: 'line' as const,
      data: calcMA(closes, period),
      smooth: true,
      showSymbol: false,
      lineStyle: { width: 1, color: maColors[idx] },
      xAxisIndex: 0,
      yAxisIndex: 0,
    }))

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        textStyle: { color: '#334155', fontSize: 12 },
        /* eslint-disable @typescript-eslint/no-explicit-any */
        formatter(params: any[]) {
          if (!params.length) return ''
          const idx = params[0].dataIndex
          const d = data[idx]
          if (!d) return ''
          const changePct = d.change_pct != null ? d.change_pct : 0
          const color = changePct >= 0 ? '#ef4444' : '#22c55e'
          return `
            <div style="padding:4px 0">
              <div style="font-weight:600;margin-bottom:6px">${d.date}</div>
              <div>开盘: <b>${d.open.toFixed(2)}</b></div>
              <div>收盘: <b style="color:${color}">${d.close.toFixed(2)}</b></div>
              <div>最高: <b>${d.high.toFixed(2)}</b></div>
              <div>最低: <b>${d.low.toFixed(2)}</b></div>
              <div>成交量: <b>${(d.volume / 10000).toFixed(0)}万</b></div>
              <div>涨跌幅: <b style="color:${color}">${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%</b></div>
            </div>
          `
        },
        /* eslint-enable @typescript-eslint/no-explicit-any */
      },
      legend: {
        data: ['K线', ...maPeriods.map(p => `MA${p}`)],
        top: 0,
        textStyle: { fontSize: 11, color: '#64748b' },
        itemWidth: 14,
        itemHeight: 2,
      },
      grid: [
        { left: 60, right: 20, top: 40, height: '55%' },
        { left: 60, right: 20, top: '72%', height: '18%' },
      ],
      xAxis: [
        { type: 'category', data: dates, gridIndex: 0, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { show: false }, boundaryGap: true },
        { type: 'category', data: dates, gridIndex: 1, axisLine: { show: false }, axisTick: { show: false }, axisLabel: { fontSize: 10, color: '#94a3b8' }, boundaryGap: true },
      ],
      yAxis: [
        { type: 'value', gridIndex: 0, position: 'left', scale: true, axisLine: { show: false }, axisTick: { show: false }, splitLine: { lineStyle: { color: '#f1f5f9' } }, axisLabel: { fontSize: 10, color: '#94a3b8' } },
        { type: 'value', gridIndex: 1, position: 'left', axisLine: { show: false }, axisTick: { show: false }, splitLine: { show: false }, axisLabel: { fontSize: 10, color: '#94a3b8', formatter: (v: number) => `${(v / 10000).toFixed(0)}万` } },
      ],
      dataZoom: [
        { type: 'inside', xAxisIndex: [0, 1], start: 60, end: 100 },
        { show: true, xAxisIndex: [0, 1], type: 'slider', bottom: 5, height: 16, start: 60, end: 100, borderColor: '#e2e8f0', fillerColor: 'rgba(59,130,246,0.1)', handleStyle: { color: '#3b82f6' }, textStyle: { fontSize: 10 } },
      ],
      series: [
        {
          name: 'K线',
          type: 'candlestick',
          data: ohlc,
          xAxisIndex: 0,
          yAxisIndex: 0,
          itemStyle: { color: '#ef4444', color0: '#22c55e', borderColor: '#ef4444', borderColor0: '#22c55e' },
        },
        ...maSeries,
        {
          name: '成交量',
          type: 'bar',
          data: volumes,
          xAxisIndex: 1,
          yAxisIndex: 1,
          itemStyle: {
            /* eslint-disable @typescript-eslint/no-explicit-any */
            color(params: any) {
              const idx = params.dataIndex
              if (idx > 0 && ohlc[idx]) {
                return ohlc[idx][1] >= ohlc[idx][0] ? '#ef4444' : '#22c55e'
              }
              return '#94a3b8'
            },
            /* eslint-enable @typescript-eslint/no-explicit-any */
          },
        },
      ],
    }
  }, [data, maPeriods])

  if (data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/50">
        <p className="text-sm text-slate-400">暂无K线数据</p>
      </div>
    )
  }

  return <ReactEChartsCore ref={chartRef} echarts={echarts} option={option} style={{ height }} notMerge />
}
