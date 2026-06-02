from datetime import datetime, timezone

import feedparser
import httpx

WEIBO_RSS = "https://rsshub.app/weibo/hot"


async def fetch_weibo() -> list[dict]:
    results: list[dict] = []
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(WEIBO_RSS)
            resp.raise_for_status()
        feed = feedparser.parse(resp.text)
        for i, entry in enumerate(feed.entries):
            published_at = datetime.now(timezone.utc)
            if entry.get("published_parsed"):
                published_at = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
            results.append({
                "platform": "weibo",
                "source_url": entry.get("link", ""),
                "title": entry.get("title", ""),
                "original_text": entry.get("summary", "") or entry.get("title", ""),
                "published_at": published_at,
                "heat_score": max(1, 1000 - i * 50),
            })
    except Exception:
        pass
    return results
