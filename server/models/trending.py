import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from server.database import Base


class TrendingItem(Base):
    __tablename__ = "trending_items"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    platform: Mapped[str] = mapped_column(String(50))
    source_url: Mapped[str] = mapped_column(String(1024))
    title: Mapped[str] = mapped_column(String(512))
    original_text: Mapped[str] = mapped_column(String(2048))
    ai_summary_zh: Mapped[str] = mapped_column(String(512), default="")
    ai_summary_en: Mapped[str] = mapped_column(String(512), default="")
    category: Mapped[str] = mapped_column(String(50), default="other")
    sentiment: Mapped[str] = mapped_column(String(20), default="neutral")
    heat_score: Mapped[int] = mapped_column(Integer, default=0)
    published_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    fetched_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
