import json
import logging
import re
from datetime import datetime, timezone

import httpx

logger = logging.getLogger(__name__)

BAIDU_HOT_URL = "https://top.baidu.com/board?tab=realtime"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"


async def fetch_baidu() -> list[dict]:
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(BAIDU_HOT_URL, headers={"User-Agent": UA})
            resp.raise_for_status()
            html = resp.text

        items = re.findall(r'\{[^{}]*"word":"[^"]*"[^{}]*\}', html)
        results = []
        for idx, item_str in enumerate(items[:30]):
            try:
                item = json.loads(item_str)
                title = item.get("word", "")
                if not title:
                    continue
                desc = item.get("desc", "")
                hot_score = item.get("hotScore", 0)
                url = item.get("url", "") or item.get("appUrl", "")
                results.append({
                    "platform": "baidu",
                    "source_url": url,
                    "title": title,
                    "original_text": desc or title,
                    "content_snippet": desc or title,
                    "ai_summary_zh": "",
                    "ai_summary_en": "",
                    "category": "domestic",
                    "sentiment": "neutral",
                    "heat_score": max(1, int(hot_score / 100000)),
                    "published_at": datetime.now(timezone.utc).isoformat(),
                })
            except (json.JSONDecodeError, KeyError):
                continue

        logger.info(f"百度热搜获取到 {len(results)} 条")
        return results
    except Exception as e:
        logger.error(f"百度热搜获取失败: {e}")
        return []
