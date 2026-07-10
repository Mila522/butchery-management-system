from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
)

from sqlalchemy.orm import relationship

from app.core.database import Base


class ProductDailyStatus(Base):
    __tablename__ = "product_daily_status"

    id = Column(Integer, primary_key=True, index=True)

    product_id = Column(
        Integer,
        ForeignKey("products.id"),
        nullable=False,
    )

    record_date = Column(
        DateTime,
        nullable=False,
    )

    delivery_recorded = Column(
        Boolean,
        default=False,
    )

    damage_recorded = Column(
        Boolean,
        default=False,
    )

    adjustment_recorded = Column(
        Boolean,
        default=False,
    )

    closing_stock_recorded = Column(
        Boolean,
        default=False,
    )

    product = relationship(
        "Product",
        back_populates="daily_status",
    )

    def __repr__(self):
        return f"<ProductDailyStatus(id={self.id}, product={self.product_id})>"