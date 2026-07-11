from datetime import datetime

from sqlalchemy import Column, Integer, DateTime, ForeignKey, String, Numeric
from sqlalchemy.orm import relationship

from app.core.database import Base


class Damage(Base):
    __tablename__ = "damages"

    id = Column(Integer, primary_key=True, index=True)

    product_id = Column(
        Integer,
        ForeignKey("products.id"),
        nullable=False,
    )

    quantity = Column(
        Numeric(10, 2),
        nullable=False,
    )

    reason = Column(
        String(255),
        nullable=False,
    )

    damage_date = Column(
        DateTime,
        nullable=False,
    )

    recorded_by = Column(Integer)

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )

    product = relationship(
        "Product",
        back_populates="damages",
    )

    @property
    def product_name(self):
        return self.product.name if self.product else None

    def __repr__(self):
        return f"<Damage(id={self.id}, product_id={self.product_id})>"
