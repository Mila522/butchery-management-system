from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
)
from sqlalchemy.orm import relationship

from app.core.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)

    sku = Column(String(100), unique=True, index=True)

    name = Column(String(255), nullable=False)

    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)

    unit_of_measure = Column(String(20), nullable=False)

    purchase_price = Column(Numeric(10, 2), nullable=False)

    selling_price = Column(Numeric(10, 2), nullable=False)

    minimum_stock = Column(Numeric(10, 2), default=0)

    current_stock = Column(Numeric(10, 2), default=0)

    active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    category = relationship("Category", back_populates="products")
    deliveries = relationship("Delivery", back_populates="product")
    damages = relationship("Damage", back_populates="product")
    adjustments = relationship("InventoryAdjustment", back_populates="product")
    daily_stock = relationship("DailyStock", back_populates="product")
    daily_status = relationship("ProductDailyStatus", back_populates="product")
    analytics = relationship("DailyAnalytics", back_populates="product")

    def __repr__(self):
        return f"<Product(id={self.id}, name='{self.name}')>"