"""Delivery model for tracking product deliveries."""

from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class Delivery(Base):
    """Model representing product deliveries from suppliers."""
    
    __tablename__ = "deliveries"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity_received = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    supplier_name = Column(String(255))
    delivery_date = Column(DateTime, nullable=False)
    reference_number = Column(String(100), unique=True, index=True)
    notes = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    product = relationship("Product", back_populates="deliveries")
    
    def __repr__(self):
        return f"<Delivery(id={self.id}, product_id={self.product_id}, qty={self.quantity_received})>"
