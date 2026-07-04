"""Delivery model for tracking product deliveries."""

from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Delivery(Base):
    __tablename__ = "deliveries"

    id = Column(Integer, primary_key=True, index=True)

    invoice_number = Column(String(100), unique=True, nullable=False)

    supplier_name = Column(String(150))

    delivery_date = Column(DateTime, nullable=False)

    recorded_by = Column(String(100))

    notes = Column(Text)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    items = relationship(
        "DeliveryItem",
        back_populates="delivery",
        cascade="all, delete-orphan"
    )