# HotPulse

**AI 驱动的全球热点聚合平台 — News · Mindset · Wealth**

一个用 AI 帮你理解世界的新闻聚合站。聚合 Reddit、Hacker News、微博、YouTube、Twitter/X 等多平台热点，通过 Claude AI 生成摘要、分类和情感分析，搭配每日励志金句和全球股市行情，一个窗口看懂世界。

## Features

- **多平台热点聚合** — Reddit、Hacker News、微博热搜、YouTube Trending、Twitter/X
- **AI 智能摘要** — 基于 Claude API，自动生成中英文摘要 + 分类 + 情感分析
- **每日励志金句** — 500+ 中英双语名言库，每日轮换，支持社交分享
- **全球股市速报** — 上证、纳斯达克、恒生、标普 500 实时指数
- **中英双语** — 全站 UI + 内容双语支持
- **响应式设计** — 桌面端 + 移动端完美适配

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14+, TypeScript, Tailwind CSS |
| Backend | Python FastAPI |
| AI | Claude API (Anthropic) |
| Database | PostgreSQL |
| Cache | Redis |
| Task Queue | Celery |
| Deploy | Vercel (frontend) + Docker (backend) |

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker & Docker Compose

### 1. Clone & Install

```bash
git clone https://github.com/abc-0886kAx-code/hotpulse.git
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

### 3. Start with Docker (Recommended)

```bash
docker-compose up -d
```

### 4. Start Frontend Dev Server

```bash
cd web && npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
hotpulse/
├── web/                    # Next.js frontend
│   ├── app/                 # App Router pages
│   ├── components/          # React components
│   ├── lib/                 # Utilities & API client
│   └── messages/            # i18n translations
├── server/                  # Python FastAPI backend
│   ├── routers/             # API route handlers
│   ├── services/            # Scrapers, AI, stocks
│   ├── tasks/               # Celery scheduled tasks
│   ├── models/              # SQLAlchemy models
│   └── seeds/               # Seed data (quotes)
├── docker-compose.yml
├── .env.example
└── README.md
```

## Roadmap

- [x] Product design document
- [ ] MVP: Multi-platform trending aggregation + AI summary + Daily quote + Stocks widget
- [ ] Phase 2: User system + Pro subscription + AI trend prediction
- [ ] Phase 3: Topic graph visualization + AI daily digest + PWA + Affiliate

## Revenue Model

| Model | Stage |
|-------|-------|
| Google AdSense | MVP |
| Pro Subscription ($9.9/mo) | Phase 2 |
| AI Daily Digest ($4.9/mo) | Phase 3 |
| Affiliate (Broker, Courses, Books) | Phase 3 |

## License

MIT
