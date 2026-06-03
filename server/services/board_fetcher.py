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
