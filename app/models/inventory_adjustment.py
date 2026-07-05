"""Inventory Adjustment model for recording manual inventory changes."""

from sqlalchemy import Column, Integer, Date, DateTime, ForeignKey, Text, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class InventoryAdjustment(Base):
    """Model representing manual inventory adjustments."""
    
    __tablename__ = "inventory_adjustments"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    adjustment_date = Column(Date, nullable=False)
    quantity_change = Column(Numeric(10, 2), nullable=False)
    reason = Column(Text)
    adjusted_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    product = relationship(
        "Product",
        back_populates="inventory_adjustments"
    )
    user = relationship("User")

    @property
    def adjustment_type(self):
        return "increase" if self.quantity_change >= 0 else "decrease"

    @property
    def quantity_adjusted(self):
        return abs(self.quantity_change)

    @property
    def notes(self):
        return None
    
    def __repr__(self):
        return f"<InventoryAdjustment(id={self.id}, product_id={self.product_id}, change={self.quantity_change})>"
