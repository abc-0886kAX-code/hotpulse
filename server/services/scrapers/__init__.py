import asyncio
import logging

from server.services.scrapers.hackernews import fetch_hackernews
from server.services.scrapers.reddit import fetch_reddit
from server.services.scrapers.weibo import fetch_weibo
from server.services.scrapers.youtube import fetch_youtube
from server.services.scrapers.twitter import fetch_twitter
from server.services.scrapers.daily60s import fetch_daily60s

logger = logging.getLogger(__name__)

DOMESTIC_SCRAPERS = [
    ("daily60s", fetch_daily60s),
    ("weibo", fetch_weibo),
]

FOREIGN_SCRAPERS = [
    ("reddit", fetch_reddit),
    ("hackernews", fetch_hackernews),
    ("youtube", fetch_youtube),
    ("twitter", fetch_twitter),
]

ALL_SCRAPERS = DOMESTIC_SCRAPERS + FOREIGN_SCRAPERS


async def fetch_all_trending() -> list[dict]:
    items: list[dict] = []
    for name, scraper in ALL_SCRAPERS:
        try:
            batch = await scraper()
            items.extend(batch)
            logger.info(f"爬虫 [{name}] 成功: {len(batch)} 条")
        except Exception as e:
            logger.error(f"爬虫 [{name}] 失败: {e}")
    return items
