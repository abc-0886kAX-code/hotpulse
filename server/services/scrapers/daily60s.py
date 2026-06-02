import logging
from datetime import datetime, timezone

import httpx

logger = logging.getLogger(__name__)

DAILY_60S_URL = "https://60s.viki.moe/v2/60s"


async def fetch_daily60s() -> list[dict]:
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(DAILY_60S_URL)
            resp.raise_for_status()
            data = resp.json()
            if data.get("code") != 200:
                return []

            result = data.get("data", {})
            news_list = result.get("news", [])
            tip = result.get("tip", "")
            date = result.get("date", "")

            items = []
            for idx, headline in enumerate(news_list):
                heat_score = max(10, 100 - idx * 6)
                items.append({
                    "platform": "daily60s",
                    "source_url": result.get("link", ""),
                    "title": headline,
                    "original_text": headline,
                    "content_snippet": headline,
                    "ai_summary_zh": "",
                    "ai_summary_en": "",
                    "category": "domestic",
                    "sentiment": "neutral",
                    "heat_score": heat_score,
                    "published_at": datetime.now(timezone.utc).isoformat(),
                    "date": date,
                })

            if tip:
                items.append({
                    "platform": "daily60s",
                    "source_url": "",
                    "title": f"每日微语 ({date})",
                    "original_text": tip,
                    "content_snippet": tip,
                    "ai_summary_zh": tip,
                    "ai_summary_en": "",
                    "category": "other",
                    "sentiment": "neutral",
                    "heat_score": 50,
                    "published_at": datetime.now(timezone.utc).isoformat(),
                    "date": date,
                })

            logger.info(f"60s API 获取到 {len(items)} 条新闻")
            return items
    except Exception as e:
        logger.error(f"60s API 获取失败: {e}")
        return []
