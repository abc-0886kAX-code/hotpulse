from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from server.database import get_db
from server.models.trending import TrendingItem

router = APIRouter(prefix="/api/trending", tags=["trending"])


@router.get("")
async def get_trending_list(
    category: Optional[str] = Query(None, description="按分类过滤"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(TrendingItem).order_by(TrendingItem.heat_score.desc())
    if category:
        query = query.where(TrendingItem.category == category)
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)

    from sqlalchemy import func
    count_query = select(func.count()).select_from(TrendingItem)
    if category:
        count_query = count_query.where(TrendingItem.category == category)

    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    result = await db.execute(query)
    items = result.scalars().all()

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("/{item_id}")
async def get_trending_detail(
    item_id: str,
    db: AsyncSession = Depends(get_db),
):
    import uuid
    try:
        uid = uuid.UUID(item_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="无效的ID格式")

    result = await db.execute(select(TrendingItem).where(TrendingItem.id == uid))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="未找到该热门话题")
    return item
