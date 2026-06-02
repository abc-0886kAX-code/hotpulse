import json
import uuid
from datetime import date, datetime, timezone
from pathlib import Path

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from server.models.quote import Quote

SEEDS_PATH = Path(__file__).resolve().parent.parent / "seeds" / "quotes.json"


async def get_daily_quote(db: AsyncSession) -> Quote | None:
    result = await db.execute(select(Quote).order_by(func.random()).limit(1))
    quote = result.scalar_one_or_none()
    if quote:
        quote.used_count += 1
        quote.last_used_at = date.today()
        await db.commit()
        await db.refresh(quote)
    return quote


async def seed_quotes(db: AsyncSession) -> int:
    count_result = await db.execute(select(func.count()).select_from(Quote))
    existing = count_result.scalar()
    if existing and existing > 0:
        return existing

    if not SEEDS_PATH.exists():
        return 0

    with open(SEEDS_PATH, "r", encoding="utf-8") as f:
        quotes_data = json.load(f)

    count = 0
    for q in quotes_data:
        quote = Quote(
            id=uuid.uuid4(),
            text_zh=q.get("text_zh", ""),
            text_en=q.get("text_en", ""),
            author=q.get("author", ""),
            category=q.get("category", "other"),
            used_count=0,
            last_used_at=date.today(),
        )
        db.add(quote)
        count += 1
    await db.commit()
    return count
