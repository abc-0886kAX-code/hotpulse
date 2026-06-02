# HotPulse — AI 驱动的全球热点聚合平台

## 产品设计文档

> **定位：** 你的 AI 新闻副驾驶 — 不只是聚合，而是理解
> **口号：** News · Mindset · Wealth — 一个窗口看懂世界

---

## 一、产品概述

### 背景

热点新闻聚合市场竞争激烈（Google News、今日头条等），但大多数只是简单的信息搬运。HotPulse 的差异化在于：**用 AI 对热点进行深度增值处理**，让用户不只是"看到新闻"，而是"理解世界"。

### 核心价值

- **节省时间：** AI 摘要让你 3 秒看懂一条热点
- **全球视野：** 一个页面看遍 Reddit、Hacker News、微博、YouTube、Twitter/X
- **心态建设：** 每日励志金句，正能量陪伴
- **财富感知：** 股市实时指数，新闻与行情联动

### 目标用户

- 全球互联网用户（中英双语）
- 关注科技、财经、时事的互联网从业者
- 投资者（股市模块）
- 信息密集型工作者（需要高效获取信息）

---

## 二、MVP 功能范围（2-3 周上线）

### 2.1 多平台热点聚合

**数据来源（全部使用免费 API/RSS，避免爬虫合规风险）：**

| 平台 | 接口方式 | 费用 |
|------|----------|------|
| Reddit | 官方 JSON API | 免费 |
| Hacker News | 官方 Firebase API | 免费 |
| 微博热搜 | RSSHub / 第三方 RSS | 免费 |
| YouTube Trending | Data API v3 | 免费（每日 10k 单位） |
| Twitter/X | RSSHub / Nitter RSS | 免费 |

**展示方式：**
- 统一时间线，按热度排序
- 每条热点包含：来源平台标签 + 标题 + AI 摘要 + 分类标签 + 情感标签 + 时间 + 热度分数
- 支持按分类筛选：科技 / 财经 / 娱乐 / 体育 / 健康 / 其他
- AI 自动去重（同一事件在不同平台的出现只保留最热的一条，其他折叠显示）

### 2.2 AI 分析功能

调用 **Claude API** 实现：

- **一句话摘要：** 每条热点自动生成中文 + 英文各一句话摘要
- **自动分类：** AI 判断热点所属分类（科技/财经/娱乐/体育/健康/其他）
- **情感分析：** 正面 / 负面 / 中性，颜色标签区分
- **批量处理：** 后端定时任务每小时抓取 + 批量 AI 处理

### 2.3 励志内容模块

- 首页顶部展示每日金句（中英双语）
- 预设 500+ 条名言库（Steve Jobs、Elon Musk、巴菲特、孔子等）
- 每日自动轮换
- 支持一键分享到 Twitter / 微博（生成带引号的分享卡片）

### 2.4 股市信息模块

- 侧边栏小部件展示全球主要指数：
  - 上证指数 (000001.SS)
  - 纳斯达克 (^IXIC)
  - 恒生指数 (^HSI)
  - 标普 500 (^GSPC)
- 涨跌幅颜色区分（绿涨红跌）
- 数据来源：Yahoo Finance API（免费额度）
- 每 5 分钟自动刷新

### 2.5 基础功能

- **中英双语切换：** 全站 UI + 内容双语支持
- **响应式设计：** 桌面端双栏布局，移动端单栏
- **广告位：** Google AdSense 展示广告（侧边栏 + 信息流间插）
- **SEO 优化：** SSR + Open Graph meta tags + 结构化数据

---

## 三、首页 UI 设计

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  [Logo] HotPulse     热点 科技 财经 娱乐 体育     [中/EN]   │
│  ─────────────────────────────────────────────────────────── │
│                                                              │
│  💡 "The only way to do great work is to love what you do." │
│                                           — Steve Jobs  [↗] │
│  ─────────────────────────────────────────────────────────── │
│                                                              │
│  ┌─ 热点卡片 ──────────────────────┐  ┌─ 股市速报 ───────┐ │
│  │                                  │  │                  │ │
│  │  [Reddit] [科技] [正面]          │  │  上证   +1.23%  │ │
│  │  OpenAI 发布 GPT-5              │  │  纳斯达克 +0.87% │ │
│  │  AI摘要：OpenAI正式发布GPT-5... │  │  恒生   -0.32%  │ │
│  │  2小时前 · 热度 98               │  │  标普500 +0.56% │ │
│  │                                  │  │                  │ │
│  └──────────────────────────────────┘  └──────────────────┘ │
│                                                              │
│  ┌─ 热点卡片 ──────────────────────┐  ┌─ 广告位 ────────┐ │
│  │                                  │  │                  │ │
│  │  [微博] [财经] [负面]            │  │  Google AdSense  │ │
│  │  央行宣布降准50个基点             │  │                  │ │
│  │  AI摘要：央行下调存款准备金...   │  │                  │ │
│  │  45分钟前 · 热度 95              │  │                  │ │
│  │                                  │  │                  │ │
│  └──────────────────────────────────┘  └──────────────────┘ │
│                                                              │
│  ┌─ 热点卡片 ──────────────────────┐  ┌─ 联盟营销 ──────┐ │
│  │                                  │  │                  │ │
│  │  [HN] [开源] [正面]              │  │  推荐内容        │ │
│  │  Rust 2.0 发布                  │  │  课程 / 书籍     │ │
│  │  AI摘要：Rust语言发布2.0...      │  │                  │ │
│  │  1小时前 · 热度 88               │  │                  │ │
│  │                                  │  │                  │ │
│  └──────────────────────────────────┘  └──────────────────┘ │
│                                                              │
│                  [ 加载更多 ]                                 │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**移动端布局：**
- 单栏全宽，热点卡片纵向排列
- 股市小部件移至顶部（金句下方）
- 广告位插入在每 5 条热点之间

---

## 四、技术架构

### 架构图

```
用户浏览器 (Chrome / Safari / Mobile)
         │
         ▼
┌─────────────────────────────────┐
│  Next.js 14+ (前端 + SSR)       │
│  TypeScript + Tailwind CSS      │
│  React Server Components        │
│  App Router                     │
└─────────────┬───────────────────┘
              │ API Routes / REST
              ▼
┌─────────────────────────────────┐
│  Python FastAPI (后端微服务)     │
│                                  │
│  ┌──────────┐  ┌──────────────┐ │
│  │ 热点爬虫 │  │ AI 处理服务  │ │
│  │ (定时任务)│  │ (Claude API) │ │
│  ├──────────┤  ├──────────────┤ │
│  │ 励志内容 │  │ 股市数据服务 │ │
│  │ (名言库) │  │ (Yahoo API)  │ │
│  └──────────┘  └──────────────┘ │
└─────────────┬───────────────────┘
              │
      ┌───────┴───────┐
      ▼               ▼
┌──────────┐   ┌──────────┐
│PostgreSQL │   │  Redis   │
│ 主数据存储 │   │ 缓存限流  │
└──────────┘   └──────────┘
```

### 技术栈

| 层级 | 技术 | 用途 |
|------|------|------|
| 前端框架 | Next.js 14+ (App Router) | SSR + 静态生成 + API Routes |
| 前端语言 | TypeScript | 类型安全 |
| UI 样式 | Tailwind CSS | 响应式设计 |
| 后端框架 | Python FastAPI | RESTful API 服务 |
| AI 服务 | Claude API (Anthropic) | 摘要、分类、情感分析 |
| 数据库 | PostgreSQL | 主数据存储 |
| 缓存 | Redis | 热点缓存、排行榜、API 限流 |
| 任务队列 | Celery + Redis | 定时爬虫任务 |
| 部署 | Vercel (前端) + Docker (后端) | 生产环境 |
| 监控 | Vercel Analytics + Sentry | 性能监控 + 错误追踪 |

### 数据库设计

**trending_items（热点条目）**
```
id              UUID, PK
platform        VARCHAR (reddit/hackernews/weibo/youtube/twitter)
source_url      TEXT
title           TEXT
original_text   TEXT
ai_summary_zh   TEXT -- AI 中文摘要
ai_summary_en   TEXT -- AI 英文摘要
category        VARCHAR (tech/finance/entertainment/sports/health/other)
sentiment       VARCHAR (positive/negative/neutral)
heat_score      INTEGER (0-100)
published_at    TIMESTAMP
fetched_at      TIMESTAMP
```

**quotes（励志名言）**
```
id              UUID, PK
text_zh         TEXT
text_en         TEXT
author          VARCHAR
category        VARCHAR
used_count      INTEGER
last_used_at    DATE
```

**stock_indices（股市指数快照）**
```
id              UUID, PK
symbol          VARCHAR (如 000001.SS)
name            VARCHAR
price           DECIMAL
change_pct      DECIMAL
snapshot_time   TIMESTAMP
```

---

## 五、项目结构

```
hotpulse/
├── web/                              # Next.js 前端
│   ├── app/
│   │   ├── layout.tsx                # 全局布局（导航栏、语言切换）
│   │   ├── page.tsx                  # 首页
│   │   ├── category/[slug]/page.tsx  # 分类筛选页
│   │   └── api/                      # API Routes 代理
│   ├── components/
│   │   ├── FeedCard.tsx              # 热点卡片组件
│   │   ├── DailyQuote.tsx            # 每日金句组件
│   │   ├── StockWidget.tsx           # 股市小部件
│   │   ├── CategoryFilter.tsx       # 分类筛选栏
│   │   ├── LanguageSwitch.tsx       # 语言切换按钮
│   │   ├── AdBanner.tsx              # 广告位组件
│   │   └── LoadMore.tsx              # 加载更多
│   ├── lib/
│   │   ├── api.ts                   # 后端 API 客户端
│   │   └── i18n.ts                  # 国际化配置
│   ├── messages/                     # i18n 翻译文件
│   │   ├── zh.json
│   │   └── en.json
│   └── public/
│       └── og-image.png             # 社交分享封面
├── server/                           # Python FastAPI 后端
│   ├── main.py                       # FastAPI 入口 + CORS
│   ├── routers/
│   │   ├── trending.py              # /api/trending 热点接口
│   │   ├── quotes.py                # /api/quotes 名言接口
│   │   └── stocks.py               # /api/stocks 行情接口
│   ├── services/
│   │   ├── scrapers/                 # 各平台爬虫
│   │   │   ├── reddit.py            # Reddit JSON API
│   │   │   ├── hackernews.py       # HN Firebase API
│   │   │   ├── weibo.py             # 微博 RSS
│   │   │   ├── youtube.py           # YouTube Data API
│   │   │   └── twitter.py           # Twitter RSSHub
│   │   ├── ai_processor.py          # Claude AI 处理服务
│   │   └── stock_fetcher.py         # Yahoo Finance 数据获取
│   ├── tasks/
│   │   ├── fetch_trending.py        # Celery 定时爬取任务
│   │   └── fetch_stocks.py          # Celery 定时行情任务
│   ├── models/
│   │   ├── trending.py              # SQLAlchemy 模型
│   │   ├── quote.py
│   │   └── stock.py
│   ├── config.py                     # 环境配置
│   └── seeds/
│       └── quotes.json              # 500+ 励志名言种子数据
├── docker-compose.yml
├── Dockerfile.server
├── package.json
├── requirements.txt
├── .env.example
└── README.md
```

---

## 六、迭代路线图

### 第一阶段：MVP（2-3 周）

- [x] 项目初始化（Next.js + FastAPI + 数据库）
- [x] 各平台数据爬虫（Reddit、HN、微博、YouTube、Twitter）
- [x] Claude AI 摘要/分类/情感分析
- [x] 首页 UI（热点流 + 励志金句 + 股市小部件）
- [x] 中英双语切换
- [x] 响应式设计
- [x] AdSense 广告位
- [x] SEO 优化
- [x] Docker 化部署

### 第二阶段：用户系统 + 增值功能（MVP 后 4-6 周）

- [ ] 用户注册/登录（邮箱 + Google OAuth）
- [ ] 个人看板（自定义关注分类 + 收藏热点）
- [ ] Pro 订阅（$9.9/月 或 $99/年）
  - 深度 AI 分析（一句话 → 200 字深度解读）
  - 无广告体验
  - API 接口访问
  - 个性化关键词订阅
- [ ] AI 趋势预测（热度趋势图，预测爆发话题）
- [ ] 关键词订阅提醒（邮件通知）
- [ ] 股市异动提醒 + 相关新闻联动
- [ ] Stripe / 支付宝集成

### 第三阶段：规模化 + 变现增强（3 个月后）

- [ ] 话题关系图谱可视化（D3.js）
- [ ] AI 日报自动生成（邮件订阅，$4.9/月）
- [ ] 移动端 PWA（离线支持）
- [ ] 联盟导流（券商开户返佣、在线课程佣金、书籍联盟）
- [ ] API 开放平台（开发者付费）
- [ ] 多语言扩展（日语、韩语、西班牙语）

---

## 七、收益模式

### 7.1 广告收入（MVP 阶段即可启用）

- **Google AdSense：** 展示广告 + 信息流原生广告位
- **预计：** 千次展示 $2-5
- **日活 1 万时：** 月收入约 $600-1500

### 7.2 Pro 订阅（第二阶段）

- **定价：** $9.9/月 或 $99/年
- **权益：** 深度 AI 分析 + 无广告 + API 接口 + 个性化看板
- **目标：** 5% 付费转化率
- **1 万用户时：** 月收入约 $4,950

### 7.3 AI 日报订阅（第三阶段）

- **定价：** $4.9/月
- **内容：** 每日自动生成"全球热点 + 股市 + 金句"邮件
- **优势：** 低门槛、高频触达

### 7.4 联盟导流（第三阶段）

- 券商开户返佣（CPA，$50-200/户）
- 在线课程平台联盟佣金（CPS，10-30%）
- 亚马逊书籍推荐联盟（CPS，3-5%）

---

## 八、成本估算

| 项目 | 月费用 | 备注 |
|------|--------|------|
| Vercel (前端) | $0-20 | 免费版可用，Pro $20/月 |
| 云服务器 (后端) | $10-20 | 一台 2C4G 足够 MVP |
| PostgreSQL | $0 | 自建 / Supabase 免费版 |
| Redis | $0 | 自建 |
| Claude API | $30-100 | 取决于调用量 |
| 域名 | $1/月 | .com 域名约 $12/年 |
| **合计** | **$40-140/月** | MVP 阶段 |

---

## 九、验证方案

1. **本地开发验证：**
   - `docker-compose up` 启动后端（PostgreSQL + Redis + FastAPI + Celery）
   - `npm run dev` 启动前端
   - 访问 `http://localhost:3000` 查看首页

2. **功能验证清单：**
   - [ ] 首页能展示来自 5 个平台的热点卡片
   - [ ] 每条卡片包含 AI 摘要 + 分类 + 情感标签
   - [ ] 每日金句正常显示
   - [ ] 股市小部件展示实时指数
   - [ ] 中英文切换正常
   - [ ] 分类筛选正常
   - [ ] 移动端布局适配
   - [ ] 广告位正确渲染

3. **性能验证：**
   - Lighthouse 评分 > 80（Performance / SEO / Accessibility）
   - 首屏加载 < 3 秒
   - AI 摘要生成 < 5 秒

4. **SEO 验证：**
   - Google 搜索能索引页面
   - Open Graph 标签正确（社交分享预览）
   - 结构化数据（JSON-LD）正确

---

## 十、风险与应对

| 风险 | 影响 | 应对策略 |
|------|------|----------|
| 数据源 API 限流/变更 | 热点获取中断 | 多源冗余 + 降级策略 |
| AI API 成本超预期 | 亏损 | 批量处理 + 缓存 + 摘要模板 |
| 微博/Twitter RSS 不稳定 | 数据缺失 | 优先保障稳定源（Reddit/HN） |
| 版权合规风险 | 法律风险 | 仅聚合标题+链接，不复制全文 |
| 用户增长缓慢 | 收入不足 | SEO 优化 + 社交分享 + 内容营销 |
