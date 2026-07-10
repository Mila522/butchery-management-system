from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship

from app.core.database import Base


class InventoryAdjustment(Base):
    __tablename__ = "inventory_adjustments"

    id = Column(Integer, primary_key=True, index=True)

    product_id = Column(
        Integer,
        ForeignKey("products.id"),
        nullable=False,
    )

    adjustment_date = Column(
        DateTime,
        nullable=False,
    )

    quantity_change = Column(
        Numeric(10, 2),
        nullable=False,
    )

    reason = Column(
        String(255),
        nullable=False,
    )

    adjusted_by = Column(Integer)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    product = relationship(
        "Product",
        back_populates="adjustments",
    )

    def __repr__(self):
        return f"<InventoryAdjustment(id={self.id})>"