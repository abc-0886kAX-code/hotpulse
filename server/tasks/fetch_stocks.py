import asyncio
import logging
import uuid

from sqlalchemy import delete

from server.database import AsyncSessionLocal
from server.models.stock import StockIndex
from server.services.stock_fetcher import fetch_stock_indices
from server.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)


def _run_async(coro):
    loop = asyncio.new_event_loop()
    try:
        return loop.run_until_complete(coro)
    finally:
        loop.close()


@celery_app.task(name="fetch_stocks")
def fetch_stocks_task():
    indices = _run_async(fetch_stock_indices())
    logger.info(f"获取到 {len(indices)} 个股票指数")

    _run_async(_save_stock_indices(indices))
    logger.info(f"保存 {len(indices)} 个股票指数到数据库")
    return len(indices)


async def _save_stock_indices(items: list[dict]):
    async with AsyncSessionLocal() as db:
        await db.execute(delete(StockIndex))
        for item in items:
            stock = StockIndex(
                id=uuid.uuid4(),
                symbol=item.get("symbol", ""),
                name=item.get("name", ""),
                price=item.get("price", 0.0),
                change_pct=item.get("change_pct", 0.0),
                snapshot_time=item.get("snapshot_time"),
            )
            db.add(stock)
        await db.commit()
