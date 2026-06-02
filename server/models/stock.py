import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from server.database import Base


class StockIndex(Base):
    __tablename__ = "stock_indices"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    symbol: Mapped[str] = mapped_column(String(50))
    name: Mapped[str] = mapped_column(String(256))
    price: Mapped[float] = mapped_column(Float)
    change_pct: Mapped[float] = mapped_column(Float)
    snapshot_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
