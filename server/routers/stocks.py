import asyncio
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Query

from server.services.supabase_client import supabase
from server.services.stock_fetcher import fetch_stock_history

router = APIRouter(prefix="/api/stocks", tags=["stocks"])

SYMBOLS = ["000001.SS", "^IXIC", "^HSI", "^GSPC"]


@router.get("")
async def get_stocks():
    def _fetch():
        return supabase.table("stock_indices").select("*").order("symbol").execute().data

    items = await asyncio.to_thread(_fetch)
    return {"items": items}


@router.get("/history/{symbol}")
async def get_stock_history(symbol: str, days: int = Query(30, ge=1, le=90)):
    def _fetch():
        since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
        return supabase.table("stock_history")\
            .select("symbol, name, price, change_pct, snapshot_time")\
            .eq("symbol", symbol)\
            .gte("snapshot_time", since)\
            .order("snapshot_time")\
            .execute().data

    items = await asyncio.to_thread(_fetch)

    if not items:
        items = await fetch_stock_history(symbol, days)

    return {"symbol": symbol, "data": items}


@router.get("/history-all")
async def get_all_stock_history(days: int = Query(7, ge=1, le=30)):
    result = {}
    for symbol in SYMBOLS:
        def _fetch(s=symbol):
            since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
            return supabase.table("stock_history")\
                .select("symbol, name, price, change_pct, snapshot_time")\
                .eq("symbol", s)\
                .gte("snapshot_time", since)\
                .order("snapshot_time")\
                .execute().data

        items = await asyncio.to_thread(_fetch)
        if not items:
            items = await fetch_stock_history(symbol, days)
        result[symbol] = items
    return result
