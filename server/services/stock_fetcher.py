from datetime import datetime, timezone

import httpx

from server.config import settings

SYMBOLS = {
    "000001.SS": "上证指数",
    "^IXIC": "纳斯达克综合",
    "^HSI": "恒生指数",
    "^GSPC": "标普500",
}


async def fetch_stock_indices() -> list[dict]:
    results: list[dict] = []
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            for symbol, name in SYMBOLS.items():
                try:
                    url = f"{settings.yahoo_finance_api_url}/{symbol}"
                    params = {"interval": "1d", "range": "1d"}
                    resp = await client.get(url, params=params)
                    resp.raise_for_status()
                    data = resp.json()
                    result = data.get("chart", {}).get("result", [])
                    if not result:
                        continue
                    meta = result[0].get("meta", {})
                    price = meta.get("regularMarketPrice", 0.0)
                    prev_close = meta.get("chartPreviousClose", 0.0)
                    change_pct = 0.0
                    if prev_close and prev_close != 0:
                        change_pct = round((price - prev_close) / prev_close * 100, 2)
                    results.append({
                        "symbol": symbol,
                        "name": name,
                        "price": price,
                        "change_pct": change_pct,
                        "snapshot_time": datetime.now(timezone.utc),
                    })
                except Exception:
                    continue
    except Exception:
        pass
    return results


async def fetch_stock_history(symbol: str, days: int = 30) -> list[dict]:
    try:
        url = f"{settings.yahoo_finance_api_url}/{symbol}"
        range_map = {5: "5d", 7: "5d", 14: "14d", 30: "30d", 60: "60d", 90: "90d"}
        range_val = range_map.get(days, "30d")
        params = {"interval": "1d", "range": range_val}
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
            result = data.get("chart", {}).get("result", [])
            if not result:
                return []
            timestamps = result[0].get("timestamp", [])
            closes = result[0].get("indicators", {}).get("quote", [{}])[0].get("close", [])
            history = []
            for ts, price in zip(timestamps, closes):
                if price is None:
                    continue
                dt = datetime.fromtimestamp(ts, tz=timezone.utc)
                history.append({
                    "symbol": symbol,
                    "name": SYMBOLS.get(symbol, symbol),
                    "price": round(price, 2),
                    "snapshot_time": dt.isoformat(),
                })
            prev_close = result[0].get("meta", {}).get("chartPreviousClose", 0)
            if prev_close and history:
                latest = history[-1]
                latest["change_pct"] = round((latest["price"] - prev_close) / prev_close * 100, 2)
            return history
    except Exception:
        return []
