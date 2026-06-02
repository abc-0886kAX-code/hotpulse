import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from server.database import Base


class Quote(Base):
    __tablename__ = "quotes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    text_zh: Mapped[str] = mapped_column(String(1024))
    text_en: Mapped[str] = mapped_column(String(1024))
    author: Mapped[str] = mapped_column(String(256))
    category: Mapped[str] = mapped_column(String(50))
    used_count: Mapped[int] = mapped_column(Integer, default=0)
    last_used_at: Mapped[date] = mapped_column(Date, default=date.today)
