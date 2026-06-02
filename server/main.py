import logging
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import delete

from server.database import init_db, AsyncSessionLocal
from server.routers.trending import router as trending_router
from server.routers.quotes import router as quotes_router
from server.routers.stocks import router as stocks_router
from server.services.quote_service import seed_quotes
from server.services.scrapers import fetch_all_trending
from server.services.ai_processor import process_trending_item
from server.services.stock_fetcher import fetch_stock_indices
from server.models.trending import TrendingItem
from server.models.stock import StockIndex
from server.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("初始化数据库...")
    await init_db()

    async with AsyncSessionLocal() as db:
        count = await seed_quotes(db)
        logger.info(f"名言种子数据: {count} 条")

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


@app.post("/api/cron/fetch-trending")
async def cron_fetch_trending():
    items = await fetch_all_trending()
    logger.info(f"获取到 {len(items)} 条热门话题")

    processed = []
    for item in items:
        result = await process_trending_item(item)
        processed.append(result)

    async with AsyncSessionLocal() as db:
        await db.execute(delete(TrendingItem))
        for item in processed:
            db.add(TrendingItem(
                id=uuid.uuid4(),
                platform=item.get("platform", ""),
                source_url=item.get("source_url", ""),
                title=item.get("title", ""),
                original_text=item.get("original_text", ""),
                ai_summary_zh=item.get("ai_summary_zh", ""),
                ai_summary_en=item.get("ai_summary_en", ""),
                category=item.get("category", "other"),
                sentiment=item.get("sentiment", "neutral"),
                heat_score=item.get("heat_score", 0),
                published_at=item.get("published_at", datetime.now(timezone.utc)),
                fetched_at=datetime.now(timezone.utc),
            ))
        await db.commit()

    logger.info(f"保存 {len(processed)} 条热门话题")
    return {"status": "ok", "count": len(processed)}


@app.post("/api/cron/fetch-stocks")
async def cron_fetch_stocks():
    indices = await fetch_stock_indices()
    logger.info(f"获取到 {len(indices)} 个股票指数")

    async with AsyncSessionLocal() as db:
        await db.execute(delete(StockIndex))
        for item in indices:
            db.add(StockIndex(
                id=uuid.uuid4(),
                symbol=item.get("symbol", ""),
                name=item.get("name", ""),
                price=item.get("price", 0.0),
                change_pct=item.get("change_pct", 0.0),
                snapshot_time=item.get("snapshot_time"),
            ))
        await db.commit()

    logger.info(f"保存 {len(indices)} 个股票指数")
    return {"status": "ok", "count": len(indices)}
