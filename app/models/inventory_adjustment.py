"""Inventory Adjustment model for recording manual inventory changes."""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class InventoryAdjustment(Base):
    """Model representing manual inventory adjustments."""
    
    __tablename__ = "inventory_adjustments"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    adjustment_type = Column(String(50), nullable=False)  # e.g., 'increase', 'decrease'
    quantity_adjusted = Column(Integer, nullable=False)
    reason = Column(String(255), nullable=False)
    notes = Column(Text)
    adjusted_by = Column(String(255))
    adjustment_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    product = relationship("Product", back_populates="adjustments")
    
    def __repr__(self):
        return f"<InventoryAdjustment(id={self.id}, product_id={self.product_id}, type={self.adjustment_type})>"
