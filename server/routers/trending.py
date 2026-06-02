import asyncio
from typing import Optional

from fastapi import APIRouter, Query

from server.services.supabase_client import supabase

router = APIRouter(prefix="/api/trending", tags=["trending"])


@router.get("")
async def get_trending_list(
    category: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    query = supabase.table("trending_items").select("*", count="exact")

    if category:
        query = query.eq("category", category)

    offset = (page - 1) * page_size

    def _fetch():
        resp = query.order("heat_score", desc=True).range(offset, offset + page_size - 1).execute()
        return resp.data, resp.count

    items, total = await asyncio.to_thread(_fetch)
    return {"items": items, "total": total, "page": page, "page_size": page_size}


@router.get("/{item_id}")
async def get_trending_detail(item_id: str):
    def _fetch():
        return supabase.table("trending_items").select("*").eq("id", item_id).execute().data

    items = await asyncio.to_thread(_fetch)
    if not items:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="未找到该热门话题")
    return items[0]
