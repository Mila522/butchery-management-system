"""Damage model for tracking damaged or spoiled products."""

from sqlalchemy import Column, Integer, Date, DateTime, ForeignKey, Text, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Damage(Base):
    """Model representing damaged or spoiled products."""
    
    __tablename__ = "damages"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    damage_date = Column(Date, nullable=False)
    quantity = Column(Numeric(10, 2), nullable=False)
    reason = Column(Text)
    recorded_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    product = relationship("Product", back_populates="damages")
    user = relationship("User")

    @property
    def quantity_damaged(self):
        return self.quantity

    @property
    def reported_by(self):
        return self.recorded_by

    @property
    def description(self):
        return None
    
    def __repr__(self):
        return f"<Damage(id={self.id}, product_id={self.product_id}, qty={self.quantity})>"
