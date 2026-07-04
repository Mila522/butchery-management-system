"""Daily Stock model for tracking inventory levels over time."""

from sqlalchemy import Column, Integer, DateTime, ForeignKey, Date, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime, date

from app.core.database import Base


class DailyStock(Base):
    """Model representing daily inventory snapshots."""
    
    __tablename__ = "daily_stock"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    stock_date = Column(Date, nullable=False, index=True)
    opening_stock = Column(Numeric(10, 2), nullable=False)
    closing_stock = Column(Numeric(10, 2), nullable=False)
    quantity_sold = Column(Numeric(10, 2), default=0)
    quantity_received = Column(Numeric(10, 2), default=0)
    quantity_damaged = Column(Numeric(10, 2), default=0)
    estimated_value = Column(Numeric(12, 2))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    product = relationship("Product", back_populates="daily_stock")
    
    def __repr__(self):
        return f"<DailyStock(id={self.id}, product_id={self.product_id}, date={self.stock_date})>"
