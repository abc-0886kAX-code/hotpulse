import asyncio

from server.services.scrapers.hackernews import fetch_hackernews
from server.services.scrapers.reddit import fetch_reddit
from server.services.scrapers.weibo import fetch_weibo
from server.services.scrapers.youtube import fetch_youtube
from server.services.scrapers.twitter import fetch_twitter

SCRAPERS = [
    fetch_reddit,
    fetch_hackernews,
    fetch_weibo,
    fetch_youtube,
    fetch_twitter,
]


async def fetch_all_trending() -> list[dict]:
    results = await asyncio.gather(*[scraper() for scraper in SCRAPERS])
    items: list[dict] = []
    for batch in results:
        items.extend(batch)
    return items
