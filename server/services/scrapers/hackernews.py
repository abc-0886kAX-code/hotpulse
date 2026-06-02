from datetime import datetime, timezone

import httpx

HN_TOP_URL = "https://hacker-news.firebaseio.com/v0/topstories.json"
HN_ITEM_URL = "https://hacker-news.firebaseio.com/v0/item/{id}.json"
TOP_N = 30


async def fetch_hackernews() -> list[dict]:
    results: list[dict] = []
    async with httpx.AsyncClient(timeout=15) as client:
        try:
            resp = await client.get(HN_TOP_URL)
            resp.raise_for_status()
            story_ids = resp.json()[:TOP_N]
            for sid in story_ids:
                try:
                    item_resp = await client.get(HN_ITEM_URL.format(id=sid))
                    item_resp.raise_for_status()
                    item = item_resp.json()
                    published_at = datetime.fromtimestamp(item.get("time", 0), tz=timezone.utc)
                    results.append({
                        "platform": "hackernews",
                        "source_url": item.get("url", f"https://news.ycombinator.com/item?id={sid}"),
                        "title": item.get("title", ""),
                        "original_text": item.get("title", ""),
                        "published_at": published_at,
                        "heat_score": item.get("score", 0),
                    })
                except Exception:
                    continue
        except Exception:
            pass
    return results
