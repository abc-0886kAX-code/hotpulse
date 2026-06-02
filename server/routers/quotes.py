from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from server.database import get_db
from server.services.quote_service import get_daily_quote

router = APIRouter(prefix="/api/quotes", tags=["quotes"])


@router.get("/daily")
async def daily_quote(db: AsyncSession = Depends(get_db)):
    quote = await get_daily_quote(db)
    if not quote:
        raise HTTPException(status_code=404, detail="暂无每日名言")
    return quote
