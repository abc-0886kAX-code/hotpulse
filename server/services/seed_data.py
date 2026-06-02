import logging
from datetime import datetime, timezone

from server.services.supabase_client import supabase

logger = logging.getLogger(__name__)


async def seed_initial_data():
    table = supabase.table("trending_items")
    result = table.select("id", count="exact").limit(1).execute()
    if result.count > 0:
        return

    logger.info("插入初始热点数据...")
    now = datetime.now(timezone.utc).isoformat()
    hour = 3600000

    items = [
        {
            "platform": "hackernews", "source_url": "https://news.ycombinator.com",
            "title": "The Open Source AI Definition 1.0 Released",
            "original_text": "The Open Source Initiative has released version 1.0 of the Open Source AI Definition (OSAID), providing clear guidelines for what constitutes open source AI.",
            "ai_summary_zh": "开源倡议组织发布了开源 AI 定义 1.0 版本，为开源 AI 提供明确指南。",
            "ai_summary_en": "The Open Source Initiative released version 1.0 of the Open Source AI Definition with clear guidelines.",
            "category": "tech", "sentiment": "positive", "heat_score": 95,
            "published_at": datetime.fromtimestamp(int(datetime.now(timezone.utc).timestamp()) - 3600, tz=timezone.utc).isoformat(),
            "fetched_at": now,
        },
        {
            "platform": "hackernews", "source_url": "https://news.ycombinator.com",
            "title": "EU Passes Landmark AI Regulation Bill",
            "original_text": "The European Parliament has passed the AI Act, the world's most comprehensive artificial intelligence regulation framework.",
            "ai_summary_zh": "欧洲议会通过了 AI 法案，这是全球最全面的 AI 监管框架。",
            "ai_summary_en": "The European Parliament passed the AI Act, the world's most comprehensive AI regulation.",
            "category": "tech", "sentiment": "neutral", "heat_score": 93,
            "published_at": datetime.fromtimestamp(int(datetime.now(timezone.utc).timestamp()) - 7200, tz=timezone.utc).isoformat(),
            "fetched_at": now,
        },
        {
            "platform": "hackernews", "source_url": "https://news.ycombinator.com",
            "title": "Tesla Announces Affordable Robotaxi for Under $25,000",
            "original_text": "Tesla unveiled its long-awaited Robotaxi with a starting price of $25,000, targeting mass-market adoption of autonomous robotaxis.",
            "ai_summary_zh": "特斯拉宣布无人出租车 Robotaxi 售价 2.5 万美元，瞄准大众市场。",
            "ai_summary_en": "Tesla unveiled Robotaxi at $25,000, targeting mass-market autonomous ride-hailing.",
            "category": "tech", "sentiment": "positive", "heat_score": 90,
            "published_at": datetime.fromtimestamp(int(datetime.now(timezone.utc).timestamp()) - 10800, tz=timezone.utc).isoformat(),
            "fetched_at": now,
        },
        {
            "platform": "hackernews", "source_url": "https://news.ycombinator.com",
            "title": "Global Semiconductor Shortage Expected to Ease by Q3 2026",
            "original_text": "Industry analysts predict the global chip shortage that has disrupted supply chains will significantly ease by Q3 2026.",
            "ai_summary_zh": "分析师预测全球芯片短缺将在 2026 年第三季度大幅缓解。",
            "ai_summary_en": "Industry analysts predict the global chip shortage will ease significantly by Q3 2026.",
            "category": "finance", "sentiment": "positive", "heat_score": 87,
            "published_at": datetime.fromtimestamp(int(datetime.now(timezone.utc).timestamp()) - 14400, tz=timezone.utc).isoformat(),
            "fetched_at": now,
        },
        {
            "platform": "hackernews", "source_url": "https://news.ycombinator.com",
            "title": "New Study Reveals Ocean Temperatures Rising Faster Than Predicted",
            "original_text": "A comprehensive ocean temperature study published in Nature shows ocean warming is accelerating beyond previous scientific models.",
            "ai_summary_zh": "《自然》杂志发表的研究显示海洋升温速度超出之前的科学模型预测。",
            "ai_summary_en": "A Nature study shows ocean warming is accelerating beyond previous models.",
            "category": "science", "sentiment": "negative", "heat_score": 85,
            "published_at": datetime.fromtimestamp(int(datetime.now(timezone.utc).timestamp()) - 18000, tz=timezone.utc).isoformat(),
            "fetched_at": now,
        },
        {
            "platform": "hackernews", "source_url": "https://news.ycombinator.com",
            "title": "Apple Unveils Next-Generation M4 Ultra Chip",
            "original_text": "Apple introduced the M4 Ultra chip with 40-core CPU and 192GB unified memory, pushing the boundaries of on-device AI.",
            "ai_summary_zh": "苹果发布 M4 Ultra 芯片，40 核 CPU + 192GB 统一内存，推动端侧 AI 发展。",
            "ai_summary_en": "Apple unveiled the M4 Ultra with 40-core CPU and 192GB unified memory.",
            "category": "tech", "sentiment": "positive", "heat_score": 92,
            "published_at": datetime.fromtimestamp(int(datetime.now(timezone.utc).timestamp()) - 5400, tz=timezone.utc).isoformat(),
            "fetched_at": now,
        },
    ]

    table.insert(items).execute()

    stock_table = supabase.table("stock_indices")
    stock_count = stock_table.select("id", count="exact").limit(1).execute()
    if stock_count.count == 0:
        logger.info("插入初始股市数据...")
        stocks = [
            {"symbol": "000001.SS", "name": "上证指数", "price": 3245.68, "change_pct": 1.23, "snapshot_time": now},
            {"symbol": "^IXIC", "name": "纳斯达克", "price": 18456.78, "change_pct": 0.87, "snapshot_time": now},
            {"symbol": "^HSI", "name": "恒生指数", "price": 18234.56, "change_pct": -0.32, "snapshot_time": now},
            {"symbol": "^GSPC", "name": "标普500", "price": 5678.90, "change_pct": 0.56, "snapshot_time": now},
        ]
        stock_table.insert(stocks).execute()

    logger.info(f"初始数据插入完成: {len(items)} 条热点, {len(stocks)} 条股市")
