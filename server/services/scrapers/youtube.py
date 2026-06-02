from datetime import datetime, timezone

import httpx

from server.config import settings

YT_URL = "https://www.googleapis.com/youtube/v3/videos"


async def fetch_youtube() -> list[dict]:
    results: list[dict] = []
    if not settings.youtube_api_key:
        return results
    params = {
        "part": "snippet,statistics",
        "chart": "mostPopular",
        "regionCode": "US",
        "maxResults": 20,
        "key": settings.youtube_api_key,
    }
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(YT_URL, params=params)
            resp.raise_for_status()
            data = resp.json()
            for item in data.get("items", []):
                video_id = item.get("id", "")
                snippet = item.get("snippet", {})
                stats = item.get("statistics", {})
                published_at = datetime.now(timezone.utc)
                if snippet.get("publishedAt"):
                    published_at = datetime.fromisoformat(snippet["publishedAt"].replace("Z", "+00:00"))
                results.append({
                    "platform": "youtube",
                    "source_url": f"https://youtube.com/watch?v={video_id}",
                    "title": snippet.get("title", ""),
                    "original_text": snippet.get("description", "") or snippet.get("title", ""),
                    "published_at": published_at,
                    "heat_score": int(stats.get("viewCount", 0)),
                })
    except Exception:
        pass
    return results
