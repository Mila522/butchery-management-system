from sqlalchemy import (
    Column,
    Integer,
    String,
    Numeric,
    Boolean,
    ForeignKey,
    DateTime
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy import Numeric


from app.core.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String(30), unique=True)
    name = Column(String(150), unique=True, nullable=False)

    category_id = Column(
        Integer,
        ForeignKey("categories.id"),
        nullable=False
    )


    unit_of_measure = Column(String(20), nullable=False)
    purchase_price = Column(Numeric(10, 2), default=0)
    selling_price = Column(Numeric(10, 2), nullable=False)
    minimum_stock = Column(Numeric(10, 2), default=0)
    active = Column(Boolean, default=True)
    current_stock = Column(
    Numeric(10, 2),
    nullable=False,
    default=0

    )

    created_at = Column(
        DateTime,
        server_default=func.now()
    )

    # Relationships
    category = relationship(
        "Category",
        back_populates="products"
    )

    delivery_items = relationship(
        "DeliveryItem",
        back_populates="product"
    )

    sale_items = relationship(
        "SaleItem",
        back_populates="product"
    )

    invoice_items = relationship(
        "InvoiceItem",
        back_populates="product"
    )

    damages = relationship(
        "Damage",
        back_populates="product"
    )

    inventory_adjustments = relationship(
        "InventoryAdjustment",
        back_populates="product"
    )

    daily_statuses = relationship(
        "ProductDailyStatus",
        back_populates="product"
    )

    daily_stock = relationship(
        "DailyStock",
        back_populates="product"
    )
