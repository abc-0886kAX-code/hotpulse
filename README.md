# HotPulse

**AI 驱动的全球热点聚合平台 — News · Mindset · Wealth**

> 一个用 AI 帮你理解世界的新闻聚合站。聚合百度热搜、60s 每日新闻、Hacker News 多平台热点，通过 AI 生成摘要、分类和情感分析，搭配东方财富全球股市 K 线图、行业板块排行和每日励志金句，一个窗口看懂世界。

**在线体验：** https://hotpulse-psi.vercel.app

## Features

- **多平台热点聚合** — 百度热搜、每天60秒、Hacker News，国内优先
- **AI 智能摘要** — 基于 AI 自动生成中英文摘要 + 分类 + 情感分析
- **专业 K 线图** — ECharts 蜡烛图 + MA5/10/20 均线 + 成交量柱状图
- **11 个全球指数** — 上证/深证/创业板/沪深300/中证500/科创50/纳斯达克/标普/道琼斯/恒生/日经225
- **板块排行** — 行业板块 + 概念板块涨幅 Top 20，实时数据
- **数据可视化** — 分类分布、热度排行、多指数走势对比图
- **分享功能** — QR 码 + 复制链接 + 下载二维码 + Twitter/微博
- **中英双语** — 全站 UI + 内容双语支持
- **响应式设计** — 桌面端 + 移动端完美适配

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS v4 |
| Charts | ECharts (K线图), recharts (走势对比) |
| Backend | Python FastAPI |
| AI | 智谱 AI (glm-4-flash) |
| Stock Data | 东方财富 HTTP API (OHLCV K线 + 板块排行) |
| Database | Supabase (PostgreSQL) |
| Deploy | Vercel (frontend) + Railway (backend) |
| Cron | cron-job.org (free) |

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+

### 1. Clone & Install

```bash
git clone https://github.com/abc-0886kAX-code/hotpulse.git
cd hotpulse

# Frontend
cd web && npm install && cd ..

# Backend
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your API keys
```

### 3. Start Dev Server

```bash
# Backend
cd server && uvicorn main:app --reload --port 8000

# Frontend
cd web && npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
hotpulse/
├── web/                    # Next.js frontend
│   ├── app/                 # App Router pages
│   │   ├── page.tsx         # 新闻首页（Hero + 卡片网格）
│   │   └── stocks/          # 股市页面（K线 + 板块 + AI）
│   ├── components/          # React components
│   │   ├── CandlestickChart.tsx  # ECharts K线图
│   │   ├── MarketIndexCard.tsx   # 指数卡片
│   │   ├── MarketComparisonChart.tsx  # 多指数对比
│   │   ├── SectorBoard.tsx       # 板块排行表格
│   │   ├── ShareModal.tsx         # 分享弹窗（QR码）
│   │   ├── FeedCard.tsx           # 新闻卡片
│   │   └── Navigation.tsx        # 导航栏
│   └── lib/                 # API client + i18n
├── server/                  # Python FastAPI backend
│   ├── main.py              # 入口 + cron 端点
│   ├── routers/             # API 路由
│   ├── services/
│   │   ├── stock_fetcher.py     # 东方财富数据（OHLCV + 板块）
│   │   ├── board_fetcher.py     # 板块排行爬虫
│   │   ├── ai_processor.py      # AI 摘要/分类/情感
│   │   └── scrapers/            # 新闻爬虫
│   └── config.py
└── docs/
    └── 产品设计文档.md
```

## Screenshots

- **新闻页**：渐变 Hero 区域 + 排名徽章 + 平台颜色 + 热度进度条
- **股市页**：滚动行情条 + K线蜡烛图 + 成交量 + 板块排行
- **分享**：QR码弹窗 + 复制链接 + 社交分享

## Revenue Model

| Model | Stage |
|-------|-------|
| Google AdSense | Phase 2 |
| Pro Subscription ($9.9/mo) | Phase 2 |
| AI Daily Digest ($4.9/mo) | Phase 3 |
| Affiliate (Broker, Courses) | Phase 3 |

## License

MIT
