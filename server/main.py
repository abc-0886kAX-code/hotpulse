import asyncio
import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from server.routers.trending import router as trending_router
from server.routers.quotes import router as quotes_router
from server.routers.stocks import router as stocks_router
from server.services.supabase_client import supabase, seed_quotes
from server.services.seed_data import seed_initial_data
from server.services.scrapers import fetch_all_trending
from server.services.ai_processor import process_trending_item, generate_market_analysis
from server.services.stock_fetcher import fetch_stock_indices

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("初始化 Supabase...")
    count = seed_quotes()
    logger.info(f"名言种子数据: {count} 条")
    await seed_initial_data()
    yield
    logger.info("应用关闭")


app = FastAPI(
    title="HotPulse API",
    description="AI驱动的全球热门新闻聚合平台",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(trending_router)
app.include_router(quotes_router)
app.include_router(stocks_router)


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}


async def _do_fetch_trending():
    items = await fetch_all_trending()
    logger.info(f"爬虫获取到 {len(items)} 条原始话题")

    if not items:
        logger.warning("所有爬虫返回空结果，跳过保存以保护现有数据")
        return

    processed = []
    for item in items:
        try:
            result = await process_trending_item(item)
            processed.append(result)
        except Exception as e:
            logger.error(f"AI 处理失败 [{item.get('platform')}]: {e}")
            processed.append({
                **item,
                "ai_summary_zh": "",
                "ai_summary_en": "",
                "category": item.get("category", "other"),
                "sentiment": item.get("sentiment", "neutral"),
            })

    def _save():
        now = datetime.now(timezone.utc).isoformat()
        rows = [{
            "platform": item.get("platform", ""),
            "source_url": item.get("source_url", ""),
            "title": item.get("title", ""),
            "original_text": item.get("original_text", ""),
            "content_snippet": item.get("content_snippet", item.get("original_text", "")),
            "ai_summary_zh": item.get("ai_summary_zh", ""),
            "ai_summary_en": item.get("ai_summary_en", ""),
            "category": item.get("category", "other"),
            "sentiment": item.get("sentiment", "neutral"),
            "heat_score": item.get("heat_score", 0),
            "published_at": item.get("published_at", now),
            "fetched_at": now,
        } for item in processed]

        if not rows:
            logger.warning("处理后无有效数据，跳过保存")
            return

        supabase.table("trending_items").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        supabase.table("trending_items").insert(rows).execute()
        logger.info(f"保存 {len(rows)} 条热门话题到数据库")

    await asyncio.to_thread(_save)
    logger.info(f"热点抓取完成: 原始 {len(items)} 条, 处理 {len(processed)} 条")


@app.post("/api/cron/fetch-trending")
async def cron_fetch_trending():
    await _do_fetch_trending()
    return {"status": "completed", "message": "热点抓取完成"}


async def _do_fetch_stocks():
    from server.services.stock_fetcher import fetch_stock_history
    indices = await fetch_stock_indices()
    logger.info(f"获取到 {len(indices)} 个股票指数最新快照")

    if not indices:
        logger.warning("未获取到任何股票指数数据，跳过保存")
        return

    history_all = []
    for item in indices:
        sym = item.get("symbol", "")
        try:
            h = await fetch_stock_history(sym, 30)
            history_all.extend(h)
        except Exception as e:
            logger.error(f"获取 {sym} 历史数据失败: {e}")
    logger.info(f"获取到 {len(history_all)} 条历史数据")

    analysis = {}
    try:
        analysis = await generate_market_analysis(indices, history_all) or {}
        logger.info(f"AI 市场分析生成: {'成功' if analysis.get('content_zh') else '跳过'}")
    except Exception as e:
        logger.error(f"AI 市场分析生成失败: {e}")

    def _save():
        supabase.table("stock_indices").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        snapshot_rows = [{
            "symbol": item.get("symbol", ""),
            "name": item.get("name", ""),
            "price": item.get("price", 0.0),
            "change_pct": item.get("change_pct", 0.0),
            "snapshot_time": item.get("snapshot_time", datetime.now(timezone.utc).isoformat()),
        } for item in indices]
        if snapshot_rows:
            supabase.table("stock_indices").insert(snapshot_rows).execute()
            logger.info(f"保存 {len(snapshot_rows)} 个股票快照")

        if history_all:
            for h in history_all:
                supabase.table("stock_history").upsert(
                    h,
                    on_conflict="symbol,snapshot_time",
                ).execute()
            logger.info(f"保存 {len(history_all)} 条历史数据")

        if analysis and analysis.get("content_zh"):
            supabase.table("market_analysis").insert({
                "content_zh": analysis["content_zh"],
                "content_en": analysis.get("content_en", ""),
                "generated_at": datetime.now(timezone.utc).isoformat(),
            }).execute()
            logger.info("保存市场分析报告")

    await asyncio.to_thread(_save)
    logger.info(f"股市数据抓取完成: {len(indices)} 快照 + {len(history_all)} 历史")


@app.post("/api/cron/fetch-stocks")
async def cron_fetch_stocks():
    await _do_fetch_stocks()
    return {"status": "completed", "message": "股市数据抓取完成"}
