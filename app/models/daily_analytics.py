from datetime import datetime

from sqlalchemy import (
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
)

from sqlalchemy.orm import relationship

from app.core.database import Base


class DailyAnalytics(Base):
    __tablename__ = "daily_analytics"

    id = Column(Integer, primary_key=True, index=True)

    analytics_date = Column(
        Date,
        nullable=False,
    )

    product_id = Column(
        Integer,
        ForeignKey("products.id"),
        nullable=False,
    )

    estimated_sold = Column(
        Numeric(10, 2),
        default=0,
    )

    actual_sold = Column(
        Numeric(10, 2),
        default=0,
    )

    remaining_stock = Column(
        Numeric(10, 2),
        default=0,
    )

    revenue = Column(
        Numeric(12, 2),
        default=0,
    )

    cost = Column(
        Numeric(12, 2),
        default=0,
    )

    gross_profit = Column(
        Numeric(12, 2),
        default=0,
    )

    damage_loss = Column(
        Numeric(12, 2),
        default=0,
    )

    stock_value = Column(
        Numeric(12, 2),
        default=0,
    )

    markup = Column(
        Numeric(12, 2),
        default=0,
    )

    margin_percent = Column(
        Numeric(7, 2),
        default=0,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    product = relationship(
        "Product",
        back_populates="daily_analytics",
    )

    def __repr__(self):
        return (
            f"<DailyAnalytics("
            f"id={self.id}, "
            f"product_id={self.product_id})>"
        )
