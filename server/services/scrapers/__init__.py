import logging

from server.services.scrapers.daily60s import fetch_daily60s
from server.services.scrapers.baidu import fetch_baidu
from server.services.scrapers.hackernews import fetch_hackernews

logger = logging.getLogger(__name__)

DOMESTIC_SCRAPERS = [
    ("daily60s", fetch_daily60s),
    ("baidu", fetch_baidu),
]

FOREIGN_SCRAPERS = [
    ("hackernews", fetch_hackernews),
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
