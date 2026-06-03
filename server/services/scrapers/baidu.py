import logging
from datetime import datetime, timezone

import httpx

logger = logging.getLogger(__name__)

BAIDU_HOT_URL = "https://api.vvhan.com/api/hotlist/baiduHot"


async def fetch_baidu() -> list[dict]:
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(BAIDU_HOT_URL)
            resp.raise_for_status()
            data = resp.json()
            items = data.get("data", [])
            results = []
            for idx, item in enumerate(items):
                title = item.get("title", "")
                if not title:
                    continue
                results.append({
                    "platform": "baidu",
                    "source_url": item.get("url", ""),
                    "title": title,
                    "original_text": item.get("desc", "") or title,
                    "content_snippet": item.get("desc", "") or title,
                    "ai_summary_zh": "",
                    "ai_summary_en": "",
                    "category": "domestic",
                    "sentiment": "neutral",
                    "heat_score": max(1, 100 - idx * 4),
                    "published_at": datetime.now(timezone.utc).isoformat(),
                })
            logger.info(f"百度热搜获取到 {len(results)} 条")
            return results
    except Exception as e:
        logger.error(f"百度热搜获取失败: {e}")
        return []
