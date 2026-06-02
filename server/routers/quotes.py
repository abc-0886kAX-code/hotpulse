import asyncio
from fastapi import APIRouter, HTTPException

from server.services.supabase_client import supabase

router = APIRouter(prefix="/api/quotes", tags=["quotes"])


@router.get("/daily")
async def daily_quote():
    def _fetch():
        resp = supabase.table("quotes").select("*").order("used_count", desc=True).limit(20).execute()
        return resp.data

    quotes = await asyncio.to_thread(_fetch)
    if not quotes:
        raise HTTPException(status_code=404, detail="暂无每日名言")

    import random
    quote = random.choice(quotes)

    new_count = quote.get("used_count", 0) + 1
    supabase.table("quotes").update({"used_count": new_count}).eq("id", quote["id"]).execute()

    return quote
