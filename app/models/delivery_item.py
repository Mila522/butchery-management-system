from sqlalchemy import (
    Column,
    Integer,
    Numeric,
    ForeignKey,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class DeliveryItem(Base):
    __tablename__ = "delivery_items"

    id = Column(Integer, primary_key=True, index=True)

    delivery_id = Column(
        Integer,
        ForeignKey("deliveries.id"),
        nullable=False,
    )

    product_id = Column(
        Integer,
        ForeignKey("products.id"),
        nullable=False,
    )

    quantity = Column(
        Numeric(10, 2),
        nullable=False,
    )

    unit_cost = Column(
        Numeric(10, 2),
        nullable=False,
    )

    delivery = relationship(
        "Delivery",
        back_populates="items",
    )

    product = relationship(
        "Product",
        back_populates="delivery_items",
    )

    @property
    def product_name(self):
        return self.product.name if self.product else None
