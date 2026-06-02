import asyncio

from server.services.scrapers.hackernews import fetch_hackernews
from server.services.scrapers.reddit import fetch_reddit
from server.services.scrapers.weibo import fetch_weibo
from server.services.scrapers.youtube import fetch_youtube
from server.services.scrapers.twitter import fetch_twitter
from server.services.scrapers.daily60s import fetch_daily60s

DOMESTIC_SCRAPERS = [
    fetch_daily60s,
    fetch_weibo,
]

FOREIGN_SCRAPERS = [
    fetch_reddit,
    fetch_hackernews,
    fetch_youtube,
    fetch_twitter,
]

ALL_SCRAPERS = DOMESTIC_SCRAPERS + FOREIGN_SCRAPERS


async def fetch_all_trending() -> list[dict]:
    results = await asyncio.gather(*[scraper() for scraper in ALL_SCRAPERS])
    items: list[dict] = []
    for batch in results:
        items.extend(batch)
    return items
