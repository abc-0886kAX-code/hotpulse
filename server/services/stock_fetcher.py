import asyncio
import logging
from datetime import datetime, timezone

import httpx

logger = logging.getLogger(__name__)

SYMBOLS = {
    "1.000001": "上证指数",
    "0.399001": "深证成指",
    "0.399006": "创业板指",
    "1.000300": "沪深300",
    "0.399905": "中证500",
    "1.000688": "科创50",
    "100.DJIA": "道琼斯",
    "100.NDX100": "纳斯达克",
    "100.SPX": "标普500",
    "100.HSI": "恒生指数",
    "100.N225": "日经225",
}

EASTMONEY_REALTIME_URL = "http://push2.eastmoney.com/api/qt/stock/get"
EASTMONEY_KLINE_URL = "http://push2his.eastmoney.com/api/qt/stock/kline/get"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"


async def fetch_stock_indices() -> list[dict]:
    results: list[dict] = []
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            tasks = [_fetch_one_realtime(client, secid, name) for secid, name in SYMBOLS.items()]
            fetched = await asyncio.gather(*tasks)
            results = [r for r in fetched if r is not None]
    except Exception as e:
        logger.error(f"获取股票指数失败: {e}")
    logger.info(f"成功获取 {len(results)}/{len(SYMBOLS)} 个指数")
    return results


async def _fetch_one_realtime(client: httpx.AsyncClient, secid: str, name: str) -> dict | None:
    try:
        params = {
            "secid": secid,
            "fields": "f43,f44,f45,f46,f47,f48,f57,f58,f169,f170,f171",
        }
        resp = await client.get(EASTMONEY_REALTIME_URL, params=params, headers={"User-Agent": UA})
        resp.raise_for_status()
        data = resp.json()
        d = data.get("data")
        if not d:
            return None

        price = _safe_float(d.get("f43"), 0)
        prev_close = _safe_float(d.get("f60"), 0) or price
        change_pct = _safe_float(d.get("f170"), 0)

        return {
            "symbol": secid,
            "name": name,
            "price": price,
            "change_pct": change_pct,
            "change_amount": _safe_float(d.get("f169"), 0),
            "open_price": _safe_float(d.get("f46"), 0),
            "high_price": _safe_float(d.get("f44"), 0),
            "low_price": _safe_float(d.get("f45"), 0),
            "volume": _safe_int(d.get("f47"), 0),
            "amount": _safe_int(d.get("f48"), 0),
            "amplitude": _safe_float(d.get("f171"), 0),
            "snapshot_time": datetime.now(timezone.utc).isoformat(),
        }
    except Exception as e:
        logger.warning(f"获取 {name}({secid}) 失败: {e}")
        return None


async def fetch_stock_history_ohlcv(secid: str, name: str, days: int = 30) -> list[dict]:
    try:
        range_map = {5: 5, 7: 7, 14: 14, 30: 30, 60: 60, 90: 90}
        lmt = range_map.get(days, 30)
        params = {
            "secid": secid,
            "klt": "101",
            "fqt": "1",
            "fields1": "f1,f2,f3,f4,f5,f6",
            "fields2": "f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61",
            "lmt": str(lmt),
            "end": "29991010",
        }
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(EASTMONEY_KLINE_URL, params=params, headers={"User-Agent": UA})
            resp.raise_for_status()
            data = resp.json()

            klines = data.get("data", {}).get("klines", [])
            if not klines:
                return []

            results = []
            for line in klines:
                parts = line.split(",")
                if len(parts) < 7:
                    continue
                date_str = parts[0]
                try:
                    dt = datetime.strptime(date_str, "%Y-%m-%d")
                    dt = dt.replace(tzinfo=timezone.utc)
                except ValueError:
                    continue

                results.append({
                    "symbol": secid,
                    "name": name,
                    "date": date_str,
                    "open_price": _safe_float(parts[1]),
                    "close": _safe_float(parts[2]),
                    "high_price": _safe_float(parts[3]),
                    "low_price": _safe_float(parts[4]),
                    "volume": _safe_int(parts[5]),
                    "amount": _safe_int(parts[6]),
                    "change_pct": _safe_float(parts[8]) if len(parts) > 8 else 0,
                    "change_amount": _safe_float(parts[9]) if len(parts) > 9 else 0,
                    "turnover": _safe_float(parts[10]) if len(parts) > 10 else 0,
                    "snapshot_time": dt.isoformat(),
                })
            return results
    except Exception as e:
        logger.error(f"获取 {name} K线数据失败: {e}")
        return []


async def fetch_stock_history(symbol: str, days: int = 30) -> list[dict]:
    name = SYMBOLS.get(symbol, symbol)
    data = await fetch_stock_history_ohlcv(symbol, name, days)
    if not data:
        return []
    return [{
        "symbol": item["symbol"],
        "name": item["name"],
        "price": item["close"],
        "change_pct": item["change_pct"],
        "snapshot_time": item["snapshot_time"],
        "open_price": item.get("open_price"),
        "high_price": item.get("high_price"),
        "low_price": item.get("low_price"),
        "volume": item.get("volume"),
        "amount": item.get("amount"),
    } for item in data]


async def fetch_all_stock_history(days: int = 30) -> dict[str, list[dict]]:
    result = {}
    async with httpx.AsyncClient(timeout=15) as client:
        tasks = []
        for secid, name in SYMBOLS.items():
            tasks.append(_fetch_history_batch(client, secid, name, days))
        fetched = await asyncio.gather(*tasks)
        for data in fetched:
            if data:
                secid = data[0]["symbol"] if data else ""
                result[secid] = data
    return result


async def _fetch_history_batch(client: httpx.AsyncClient, secid: str, name: str, days: int) -> list[dict]:
    try:
        range_map = {5: 5, 7: 7, 14: 14, 30: 30, 60: 60, 90: 90}
        lmt = range_map.get(days, 30)
        params = {
            "secid": secid,
            "klt": "101",
            "fqt": "1",
            "fields1": "f1,f2,f3,f4,f5,f6",
            "fields2": "f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61",
            "lmt": str(lmt),
            "end": "29991010",
        }
        resp = await client.get(EASTMONEY_KLINE_URL, params=params, headers={"User-Agent": UA})
        resp.raise_for_status()
        klines = resp.json().get("data", {}).get("klines", [])

        results = []
        for line in klines:
            parts = line.split(",")
            if len(parts) < 7:
                continue
            date_str = parts[0]
            try:
                dt = datetime.strptime(date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
            except ValueError:
                continue
            results.append({
                "symbol": secid,
                "name": name,
                "price": _safe_float(parts[2]),
                "open_price": _safe_float(parts[1]),
                "high_price": _safe_float(parts[3]),
                "low_price": _safe_float(parts[4]),
                "volume": _safe_int(parts[5]),
                "amount": _safe_int(parts[6]),
                "change_pct": _safe_float(parts[8]) if len(parts) > 8 else 0,
                "snapshot_time": dt.isoformat(),
            })
        return results
    except Exception as e:
        logger.warning(f"获取 {name} 历史数据失败: {e}")
        return []


def _safe_float(val, default=0.0) -> float:
    if val is None:
        return default
    try:
        return round(float(val), 4)
    except (ValueError, TypeError):
        return default


def _safe_int(val, default=0) -> int:
    if val is None:
        return default
    try:
        return int(float(val))
    except (ValueError, TypeError):
        return default
