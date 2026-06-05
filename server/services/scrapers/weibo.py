import logging
from datetime import datetime, timezone

import httpx

logger = logging.getLogger(__name__)

WEIBO_HOT_URL = "https://weibo.com/ajax/side/hotSearch"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"


async def fetch_weibo() -> list[dict]:
    """从微博热搜获取国内热点"""
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                WEIBO_HOT_URL,
                headers={
                    "User-Agent": UA,
                    "Accept": "application/json",
                    "Referer": "https://weibo.com/",
                },
            )
            resp.raise_for_status()
            data = resp.json()

            realtime = data.get("data", {}).get("realtime", [])
            if not realtime:
                logger.warning("微博热搜返回空列表")
                return []

            items = []
            for idx, item in enumerate(realtime[:30]):
                word = item.get("word", "").strip()
                if not word:
                    continue

                # 从 label_name 提取标签（如"新"、"热"、"沸"等）
                label = item.get("label_name", "")
                num = item.get("num", 0)

                heat_score = max(10, int(num / 10000)) if num else max(10, 100 - idx * 3)

                title = word
                if label:
                    title = f"[{label}] {word}"

                items.append({
                    "platform": "weibo",
                    "source_url": f"https://s.weibo.com/weibo?q={word}",
                    "title": title,
                    "original_text": word,
                    "content_snippet": label or "",
                    "ai_summary_zh": "",
                    "ai_summary_en": "",
                    "category": "domestic",
                    "sentiment": "neutral",
                    "heat_score": heat_score,
                    "published_at": datetime.now(timezone.utc).isoformat(),
                })

            logger.info(f"微博热搜获取到 {len(items)} 条")
            return items
    except Exception as e:
        logger.error(f"微博热搜获取失败: {e}")
        return []
