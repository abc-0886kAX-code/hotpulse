from datetime import datetime, timezone

import httpx

HEADERS = {"User-Agent": "HotPulse/1.0"}

SUBREDDITS = [
    "https://www.reddit.com/r/technology/hot.json",
    "https://www.reddit.com/r/worldnews/hot.json",
]


async def fetch_reddit() -> list[dict]:
    results: list[dict] = []
    async with httpx.AsyncClient(timeout=15) as client:
        for url in SUBREDDITS:
            try:
                resp = await client.get(url, headers=HEADERS)
                resp.raise_for_status()
                data = resp.json()
                for child in data.get("data", {}).get("children", []):
                    item = child.get("data", {})
                    published_at = datetime.fromtimestamp(item.get("created_utc", 0), tz=timezone.utc)
                    results.append({
                        "platform": "reddit",
                        "source_url": item.get("url", ""),
                        "title": item.get("title", ""),
                        "original_text": item.get("selftext", "") or item.get("title", ""),
                        "published_at": published_at,
                        "heat_score": item.get("score", 0),
                    })
            except Exception:
                continue
    return results
