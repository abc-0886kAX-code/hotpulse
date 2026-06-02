import asyncio

from fastapi import APIRouter

from server.services.supabase_client import supabase

router = APIRouter(prefix="/api/stocks", tags=["stocks"])


@router.get("")
async def get_stocks():
    def _fetch():
        return supabase.table("stock_indices").select("*").order("symbol").execute().data

    items = await asyncio.to_thread(_fetch)
    return {"items": items}
