from datetime import datetime

from sqlalchemy import Column, Integer, Numeric, Date, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship

from app.core.database import Base


class DailyStock(Base):
    __tablename__ = "daily_stock"

    id = Column(Integer, primary_key=True)

    product_id = Column(
        Integer,
        ForeignKey("products.id"),
        nullable=False,
    )

    stock_date = Column(Date, nullable=False)

    opening_stock = Column(Numeric(10, 2), default=0)

    received_today = Column(Numeric(10, 2), default=0)

    damaged_today = Column(Numeric(10, 2), default=0)

    closing_stock = Column(Numeric(10, 2), default=0)

    notes = Column(Text)

    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship(
        "Product",
        back_populates="daily_stock",
    )