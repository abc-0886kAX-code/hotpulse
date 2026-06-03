import asyncio
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Query

from server.services.supabase_client import supabase
from server.services.stock_fetcher import fetch_stock_history, fetch_stock_history_ohlcv, SYMBOLS
from server.services.board_fetcher import fetch_sector_boards, fetch_stock_rankings

router = APIRouter(prefix="/api/stocks", tags=["stocks"])


@router.get("")
async def get_stocks():
    def _fetch():
        return supabase.table("stock_indices").select("*").order("symbol").execute().data

    items = await asyncio.to_thread(_fetch)
    return {"items": items}


@router.get("/analysis")
async def get_market_analysis():
    def _fetch():
        return supabase.table("market_analysis").select("*")\
            .order("generated_at", desc=True)\
            .limit(1).execute().data

    items = await asyncio.to_thread(_fetch)
    if items:
        return {"item": items[0]}
    return {"item": None}


@router.get("/kline/{symbol}")
async def get_stock_kline(symbol: str, days: int = Query(30, ge=1, le=90)):
    name = SYMBOLS.get(symbol, symbol)
    data = await fetch_stock_history_ohlcv(symbol, name, days)
    return {"symbol": symbol, "data": data}


@router.get("/sectors")
async def get_sector_boards(
    board_type: str = Query("industry", description="industry 或 concept"),
    top_n: int = Query(20, ge=1, le=50),
):
    data = await fetch_sector_boards(board_type, top_n)
    return {"type": board_type, "items": data}


@router.get("/rankings")
async def get_stock_rankings(
    rank_type: str = Query("up", description="up/down/volume/amount"),
    top_n: int = Query(15, ge=1, le=30),
):
    data = await fetch_stock_rankings(rank_type, top_n)
    return {"type": rank_type, "items": data}


@router.get("/history/{symbol}")
async def get_stock_history(symbol: str, days: int = Query(30, ge=1, le=90)):
    def _fetch():
        since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
        return supabase.table("stock_history")\
            .select("symbol, name, price, change_pct, open_price, high_price, low_price, volume, amount, snapshot_time")\
            .eq("symbol", symbol)\
            .gte("snapshot_time", since)\
            .order("snapshot_time")\
            .execute().data

    items = await asyncio.to_thread(_fetch)

    if not items:
        items = await fetch_stock_history(symbol, days)

    return {"symbol": symbol, "data": items}


@router.get("/history-all")
async def get_all_stock_history(days: int = Query(7, ge=1, le=90)):
    result = {}
    for symbol in SYMBOLS:
        def _fetch(s=symbol):
            since = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
            return supabase.table("stock_history")\
                .select("symbol, name, price, change_pct, open_price, high_price, low_price, volume, amount, snapshot_time")\
                .eq("symbol", s)\
                .gte("snapshot_time", since)\
                .order("snapshot_time")\
                .execute().data

        items = await asyncio.to_thread(_fetch)
        if not items:
            items = await fetch_stock_history(symbol, days)
        result[symbol] = items
    return result
