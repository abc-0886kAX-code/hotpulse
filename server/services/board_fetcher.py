import logging

import httpx

logger = logging.getLogger(__name__)

EASTMONEY_CLIST_URL = "http://push2.eastmoney.com/api/qt/clist/get"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

BOARD_FIELDS = "f2,f3,f4,f8,f12,f14,f104,f105,f128,f136,f140,f141"
BOARD_FS_MAP = {
    "industry": "m:90+t:2",
    "concept": "m:90+t:3",
}

# A股个股排行
STOCK_RANK_FS_MAP = {
    "up": "m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23",      # 涨幅榜
    "down": "m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23",     # 跌幅榜
    "volume": "m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23",   # 成交量榜
    "amount": "m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23",    # 成交额榜
}


async def fetch_sector_boards(board_type: str = "industry", top_n: int = 20) -> list[dict]:
    fs = BOARD_FS_MAP.get(board_type)
    if not fs:
        logger.warning(f"未知板块类型: {board_type}")
        return []

    try:
        params = {
            "pn": "1",
            "pz": str(top_n),
            "po": "1",
            "np": "1",
            "fltt": "2",
            "invt": "2",
            "fid": "f3",
            "fs": fs,
            "fields": BOARD_FIELDS,
        }
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(EASTMONEY_CLIST_URL, params=params, headers={"User-Agent": UA})
            resp.raise_for_status()
            data = resp.json()

            diff = data.get("data", {}).get("diff", [])
            if not diff:
                return []

            results = []
            for item in diff:
                change_pct = _safe_float(item.get("f3"))
                results.append({
                    "code": item.get("f12", ""),
                    "name": item.get("f14", ""),
                    "change_pct": change_pct,
                    "change_amount": _safe_float(item.get("f4")),
                    "turnover": _safe_float(item.get("f8")),
                    "up_count": _safe_int(item.get("f104")),
                    "down_count": _safe_int(item.get("f105")),
                    "volume": _safe_int(item.get("f128")),
                    "amount": _safe_int(item.get("f136")),
                })
            return results
    except Exception as e:
        logger.error(f"获取板块排行失败: {e}")
        return []


async def fetch_stock_rankings(rank_type: str = "up", top_n: int = 15) -> list[dict]:
    fs = STOCK_RANK_FS_MAP.get(rank_type)
    if not fs:
        logger.warning(f"未知排行类型: {rank_type}")
        return []

    try:
        stock_fields = "f2,f3,f4,f5,f6,f7,f8,f12,f14,f15,f16,f17,f18,f20"
        params = {
            "pn": "1",
            "pz": str(top_n),
            "po": "1",
            "np": "1",
            "fltt": "2",
            "invt": "2",
            "fid": "f3" if rank_type in ("up", "down") else "f6",
            "fs": fs,
            "fields": stock_fields,
        }
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(EASTMONEY_CLIST_URL, params=params, headers={"User-Agent": UA})
            resp.raise_for_status()
            data = resp.json()

            diff = data.get("data", {}).get("diff", [])
            if not diff:
                return []

            results = []
            for item in diff:
                results.append({
                    "code": item.get("f12", ""),
                    "name": item.get("f14", ""),
                    "price": _safe_float(item.get("f2")),
                    "change_pct": _safe_float(item.get("f3")),
                    "change_amount": _safe_float(item.get("f4")),
                    "high": _safe_float(item.get("f15")),
                    "low": _safe_float(item.get("f16")),
                    "open": _safe_float(item.get("f17")),
                    "volume": _safe_int(item.get("f6")),
                    "amount": _safe_int(item.get("f7")),
                    "turnover": _safe_float(item.get("f8")),
                    "pe": _safe_float(item.get("f18")),
                    "pb": _safe_float(item.get("f20")),
                })
            return results
    except Exception as e:
        logger.error(f"获取个股排行失败: {e}")
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
