import json
import logging
import re
from datetime import datetime, timezone

import httpx

logger = logging.getLogger(__name__)

TOUTIAO_HOT_URL = "https://www.toutiao.com/hot-event/hot-board/?origin=toutiao_pc"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"


async def fetch_toutiao() -> list[dict]:
    """从今日头条热榜获取国内热点"""
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                TOUTIAO_HOT_URL,
                headers={
                    "User-Agent": UA,
                    "Accept": "application/json",
                    "Referer": "https://www.toutiao.com/",
                },
                follow_redirects=True,
            )
            resp.raise_for_status()

            # 响应可能是 JSON 直接返回，也可能用 self.__wrap__('...') 包装
            text = resp.text.strip()
            if text.startswith("self.__wrap__"):
                # 提取 JSON 字符串：self.__wrap__('{"data":[...]}')
                m = re.search(r"self\.__wrap__\(\s*'(.+?)'\s*\)", text, re.DOTALL)
                if m:
                    text = m.group(1).replace("\\'", "'").replace('\\"', '"')

            data = json.loads(text)
            event_list = data.get("data", [])

            items = []
            for idx, event in enumerate(event_list[:30]):
                title = event.get("Title", "")
                if not title:
                    continue

                hot_score = event.get("HotValue", 0) or 0
                url = event.get("Url", "")

                items.append({
                    "platform": "toutiao",
                    "source_url": url,
                    "title": title,
                    "original_text": title,
                    "content_snippet": title,
                    "ai_summary_zh": "",
                    "ai_summary_en": "",
                    "category": "domestic",
                    "sentiment": "neutral",
                    "heat_score": max(1, int(hot_score / 10000)),
                    "published_at": datetime.now(timezone.utc).isoformat(),
                })

            logger.info(f"头条热榜获取到 {len(items)} 条")
            return items
    except Exception as e:
        logger.error(f"头条热榜获取失败: {e}")
        return []
