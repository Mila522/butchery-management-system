"""Product Daily Status model for tracking daily product information."""

from sqlalchemy import Column, Integer, DateTime, ForeignKey, Date, String, Float
from sqlalchemy.orm import relationship
from datetime import datetime, date

from app.core.database import Base


class ProductDailyStatus(Base):
    """Model representing daily status and metrics for each product."""
    
    __tablename__ = "product_daily_status"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    status_date = Column(Date, nullable=False, index=True)
    status = Column(String(50), default="active")  # e.g., 'active', 'low_stock', 'out_of_stock'
    quantity_available = Column(Integer, nullable=False)
    quantity_sold_today = Column(Integer, default=0)
    daily_sales_value = Column(Float, default=0.0)
    notes = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    product = relationship("Product", back_populates="daily_status")
    
    def __repr__(self):
        return f"<ProductDailyStatus(id={self.id}, product_id={self.product_id}, date={self.status_date})>"
