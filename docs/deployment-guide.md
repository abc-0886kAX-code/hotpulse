# HotPulse 部署指南

## 项目架构

| 层级 | 平台 | 地址 |
|------|------|------|
| 前端 | Vercel | https://hotpulse-psi.vercel.app |
| 后端 | Railway | https://hotpulse-api-production-7248.up.railway.app |
| 数据库 | Supabase | kernjlhwrnnrskrdzggi.supabase.co |
| AI | 智谱 AI | open.bigmodel.cn |

---

## 一、数据库（Supabase）

### 1.1 创建项目

1. 打开 https://supabase.com ，GitHub 登录
2. **New Project** → 输入项目名 `HotPulse` → 选择离你近的区域 → 创建

### 1.2 创建表

进入 **SQL Editor**，执行以下 SQL：

```sql
-- 热点新闻表
CREATE TABLE trending_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT,
  source_url TEXT,
  title TEXT,
  original_text TEXT,
  ai_summary_zh TEXT,
  ai_summary_en TEXT,
  category TEXT DEFAULT 'other',
  sentiment TEXT DEFAULT 'neutral',
  heat_score INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ
);

-- 励志名言表
CREATE TABLE quotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text_zh TEXT,
  text_en TEXT,
  author TEXT,
  category TEXT DEFAULT 'motivation',
  used_count INTEGER DEFAULT 0,
  last_used_at DATE
);

-- 股市指数表
CREATE TABLE stock_indices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT,
  name TEXT,
  price NUMERIC,
  change_pct NUMERIC,
  snapshot_time TIMESTAMPTZ
);

-- 开启 RLS 并允许匿名访问
ALTER TABLE trending_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_indices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon access" ON trending_items FOR ALL USING (true);
CREATE POLICY "Allow anon access" ON quotes FOR ALL USING (true);
CREATE POLICY "Allow anon access" ON stock_indices FOR ALL USING (true);
```

### 1.3 获取连接信息

在 Supabase 中记录以下信息：
- **Project URL**: `https://kernjlhwrnnrskrdzggi.supabase.co`
- **Anon (public) Key**: 在 Settings → API Keys 中找到 `anon public` 的 key

---

## 二、后端（Railway）

### 2.1 创建服务

1. 打开 https://railway.app ，GitHub 登录
2. **New Project** → **Deploy from GitHub repo** → 选择 `hotpulse`
3. Railway 自动检测到 render.yaml 并创建服务

### 2. 配置环境变量

进入服务 → **Variables** → 添加以下变量：

| 变量名 | 值 |
|--------|-----|
| `SUPABASE_URL` | `https://kernjlhwrnnrskrdzggi.supabase.co` |
| `SUPABASE_ANON_KEY` | 你的 Supabase anon public key |
| `ANTHROPIC_API_KEY` | `81af3ebee1504a6a9db930c8e9fb79c2.zyhUbQtR9bId5rL4` |
| `ANTHROPIC_BASE_URL` | `https://open.bigmodel.cn/api/anthropic` |
| `AI_MODEL` | `glm-4-flash` |

### 2.2 验证部署

部署完成后，访问以下地址验证：

```bash
# 健康检查
curl https://hotpulse-api-production-7248.up.railway.app/api/health

# 查看热点数据
curl https://hotpulse-api-production-7248.up.railway.app/api/trending

# 查看股市数据
curl https://hotpulse-api-production-7248.up.railway.app/api/stocks

# 查看名言
curl https://hotpulse-api-production-7248.up.railway.app/api/quotes/daily
```

---

## 三、数据抓取机制

### 3.1 自动抓取（Cron Job）

数据抓取通过 HTTP POST 请求触发，需要在定时任务服务中配置：

**热点抓取（每小时）：**
```
POST https://hotpulse-api-production-7248.up.railway.app/api/cron/fetch-trending
```

**股市抓取（每 5 分钟）：**
```
POST https://hotpulse-production-7248.up.railway.app/api/cron/fetch-stocks
```

### 3.2 免费定时任务服务

推荐使用 [cron-job.org](https://cron-job.org)（免费）：

1. 注册账号，GitHub 登录
2. **Create cronjob** → 设置定时任务
3. **URL** 填入上面的 POST 地址
4. **Schedule** 选择频率：
   - 热点：`0 * * * *`（每小时）
   - 股市：`*/5 * * * *`（每 5 分钟）

### 3.3 手动触发

随时可以手动触发抓取：
```bash
curl -X POST https://hotpulse-api-production-7248.up.railway.app/api/cron/fetch-trending
curl -X POST https://hotpulse-api-production-7248.up.railway.app/api/cron/fetch-stocks
```

### 3.4 抓取流程

```
定时任务触发
    ↓
多平台并行抓取
  ├── Reddit (r/technology, r/worldnews)
  ├── Hacker News (Top 30)
  ├── 微博热搜 (via RSSHub)
  ├── YouTube Trending (Data API)
  └── Twitter/X (via RSSHub)
    ↓
AI 智谱处理（每条热点）
  ├── 中文摘要 (一句话)
  ├── 英文摘要 (一句话)
  ├── 分类 (tech/finance/entertainment/...)
  └── 情感标签 (positive/negative/neutral)
    ↓
写入 Supabase 数据库
```

**注意：** 后端启动时会自动插入 6 条示例热点 + 4 个股市指数数据，确保首次访问有内容展示。爬虫抓取到真实数据后会覆盖示例数据。

---

## 四、前端（Vercel）

### 4.1 部署

1. 打开 https://vercel.com ，GitHub 登录
2. **New Project** → Import `hotpulse` 仓库
3. 配置：
   - **Root Directory**: `web`（点击 Edit 设置）
   - **Framework**: Next.js（自动检测）
4. 点击 **Deploy**

### 4. 设置环境变量

进入项目 → **Settings → Environment Variables**：

| 变量名 | 值 |
|--------|-----|
| `NEXT_PUBLIC_API_URL` | `https://hotpulse-api-production-7248.up.railway.app` |

### 4. 重新部署

环境变量修改后需要重新部署：
- **Deployments** → 最新部署 → **"..."** → **Redeploy**

---

## 五、环境变量汇总

### 后端环境变量

| 变量 | 用途 | 获取方式 |
|------|------|----------|
| `SUPABASE_URL` | Supabase 项目地址 | Supabase → Settings → API |
| `SUPABASE_ANON_KEY` | Supabase 匿名公钥 | Supabase → Settings → API Keys |
| `ANTHROPIC_API_KEY` | 智谱 AI 密钥 | 智谱开放平台 |
| `ANTHROPIC_BASE_URL` | 智谱 API 地址 | 固定值 `https://open.bigmodel.cn/api/anthropic` |
| `AI_MODEL` | AI 模型名 | 固定值 `glm-4-flash` |
| `YOUTUBE_API_KEY` | YouTube Data API | Google Cloud Console（可选） |
| `YAHOO_FINANCE_API_URL` | 股市数据 API | 固定值（可选） |

### 前端环境变量

| 变量 | 用途 | 获取方式 |
|------|------|----------|
| `NEXT_PUBLIC_API_URL` | 后端 API 地址 | Railway 服务页面顶部 |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | Google AdSense ID | AdSense 后台（可选） |

---

## 六、常见问题

### Q: 页面只显示 fallback 数据，没有真实数据？

A: 后端启动时会自动插入示例数据。如果 API 连接正常但数据为空，可能需要手动触发抓取：
```bash
curl -X POST https://hotpulse-api-production-7248.up.railway.app/api/cron/fetch-trending
```

### Q: AI 摘要都是空的？

A: 检查后端日志中是否有 AI 处理错误。可能原因：
- 智谱 API Key 无效
- AI 模型不支持
- API 调用频率限制

### Q: 想更新代码后重新部署？

A: 直接 `git push`，Railway 和 Vercel 都会自动检测到 push 并重新部署。

### Q: 如何查看后端运行日志？

A: 在 Railway 服务页面 → **Deployments** → 点击对应部署 → 查看 Logs。
