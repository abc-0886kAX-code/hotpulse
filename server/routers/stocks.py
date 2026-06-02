from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from server.database import get_db
from server.models.stock import StockIndex

router = APIRouter(prefix="/api/stocks", tags=["stocks"])


@router.get("")
async def get_stocks(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(StockIndex).order_by(StockIndex.symbol))
    items = result.scalars().all()
    return {"items": items}
