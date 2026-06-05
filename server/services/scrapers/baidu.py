import logging
from datetime import datetime, timezone

import httpx

logger = logging.getLogger(__name__)

BAIDU_HOT_API = "https://top.baidu.com/api/board?platform=wise&tab=realtime"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"


async def fetch_baidu() -> list[dict]:
    """从百度热搜 API 获取国内热点"""
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                BAIDU_HOT_API,
                headers={
                    "User-Agent": UA,
                    "Accept": "application/json",
                    "Referer": "https://top.baidu.com/",
                },
            )
            resp.raise_for_status()
            data = resp.json()

            cards = data.get("data", {}).get("cards", [])
            if not cards:
                logger.warning("百度热搜 API 返回空 cards")
                return []

            content = cards[0].get("content", [])
            if not content:
                return []

            items = []
            for idx, item in enumerate(content[:30]):
                word = item.get("word", "")
                if not word:
                    continue

                desc = item.get("desc", "")
                hot_score = item.get("hotScore", 0) or 0
                url = item.get("url", "")

                items.append({
                    "platform": "baidu",
                    "source_url": url,
                    "title": word,
                    "original_text": desc or word,
                    "content_snippet": desc or word,
                    "ai_summary_zh": "",
                    "ai_summary_en": "",
                    "category": "domestic",
                    "sentiment": "neutral",
                    "heat_score": max(1, int(hot_score / 100000)),
                    "published_at": datetime.now(timezone.utc).isoformat(),
                })

            logger.info(f"百度热搜获取到 {len(items)} 条")
            return items
    except Exception as e:
        logger.error(f"百度热搜获取失败: {e}")
        return []
