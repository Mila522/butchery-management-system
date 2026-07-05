"""Damage model for tracking damaged or spoiled products."""

from sqlalchemy import Column, Integer, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class Damage(Base):
    """Model representing damaged or spoiled products."""
    
    __tablename__ = "damages"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity_damaged = Column(Integer, nullable=False)
    reason = Column(String(255), nullable=False)
    description = Column(Text)
    damage_date = Column(DateTime, nullable=False)
    reported_by = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    product = relationship("Product", back_populates="damages")
    
    def __repr__(self):
        return f"<Damage(id={self.id}, product_id={self.product_id}, qty={self.quantity_damaged})>"
