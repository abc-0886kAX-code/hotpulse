import asyncio
import logging
import uuid
from datetime import datetime, timezone

from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

from server.database import AsyncSessionLocal
from server.models.trending import TrendingItem
from server.services.ai_processor import process_trending_item
from server.services.scrapers import fetch_all_trending
from server.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)


def _run_async(coro):
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@celery_app.task(name="fetch_trending")
def fetch_trending_task():
    items = _run_async(fetch_all_trending())
    logger.info(f"获取到 {len(items)} 条热门话题")

    processed = []
    for item in items:
        result = _run_async(process_trending_item(item))
        processed.append(result)

    _run_async(_save_trending_items(processed))
    logger.info(f"保存 {len(processed)} 条热门话题到数据库")
    return len(processed)


async def _save_trending_items(items: list[dict]):
    async with AsyncSessionLocal() as db:
        await db.execute(delete(TrendingItem))
        for item in items:
            trending = TrendingItem(
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
            )
            db.add(trending)
        await db.commit()
