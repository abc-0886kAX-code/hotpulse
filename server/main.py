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
from server.services.ai_processor import process_trending_item
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
    logger.info(f"获取到 {len(items)} 条热门话题")

    processed = []
    for item in items:
        result = await process_trending_item(item)
        processed.append(result)

    def _save():
        supabase.table("trending_items").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        rows = [{
            "platform": item.get("platform", ""),
            "source_url": item.get("source_url", ""),
            "title": item.get("title", ""),
            "original_text": item.get("original_text", ""),
            "ai_summary_zh": item.get("ai_summary_zh", ""),
            "ai_summary_en": item.get("ai_summary_en", ""),
            "category": item.get("category", "other"),
            "sentiment": item.get("sentiment", "neutral"),
            "heat_score": item.get("heat_score", 0),
            "published_at": item.get("published_at", datetime.now(timezone.utc).isoformat()),
            "fetched_at": datetime.now(timezone.utc).isoformat(),
        } for item in processed]
        if rows:
            supabase.table("trending_items").insert(rows).execute()

    await asyncio.to_thread(_save)
    logger.info(f"保存 {len(processed)} 条热门话题")


@app.post("/api/cron/fetch-trending")
async def cron_fetch_trending():
    asyncio.create_task(_do_fetch_trending())
    return {"status": "accepted", "message": "热点抓取已在后台启动"}


async def _do_fetch_stocks():
    indices = await fetch_stock_indices()
    logger.info(f"获取到 {len(indices)} 个股票指数")

    def _save():
        supabase.table("stock_indices").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
        rows = [{
            "symbol": item.get("symbol", ""),
            "name": item.get("name", ""),
            "price": item.get("price", 0.0),
            "change_pct": item.get("change_pct", 0.0),
            "snapshot_time": item.get("snapshot_time", datetime.now(timezone.utc).isoformat()),
        } for item in indices]
        if rows:
            supabase.table("stock_indices").insert(rows).execute()

    await asyncio.to_thread(_save)
    logger.info(f"保存 {len(indices)} 个股票指数")


@app.post("/api/cron/fetch-stocks")
async def cron_fetch_stocks():
    asyncio.create_task(_do_fetch_stocks())
    return {"status": "accepted", "message": "股市数据抓取已在后台启动"}
