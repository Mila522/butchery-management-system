from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


# ======================================================
# DAILY STOCK
# ======================================================

class DailyStockCreate(BaseModel):
    product_id: int
    stock_date: datetime
    opening_stock: Decimal
    received_stock: Decimal = Decimal("0")
    damaged_stock: Decimal = Decimal("0")
    adjusted_stock: Decimal = Decimal("0")
    closing_stock: Decimal
    notes: str | None = None


class DailyStockResponse(BaseModel):
    id: int

    product_id: int

    stock_date: datetime

    opening_stock: Decimal

    received_stock: Decimal

    damaged_stock: Decimal

    adjusted_stock: Decimal

    closing_stock: Decimal

    notes: str | None

    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ======================================================
# DAILY ANALYTICS
# ======================================================

class DailyAnalyticsCreate(BaseModel):
    product_id: int

    analytics_date: datetime

    opening_stock: Decimal

    received_stock: Decimal = Decimal("0")

    damaged_stock: Decimal = Decimal("0")

    adjusted_stock: Decimal = Decimal("0")

    closing_stock: Decimal

    remaining_stock: Decimal

    stock_value: Decimal


class DailyAnalyticsResponse(BaseModel):
    id: int

    product_id: int

    analytics_date: datetime

    opening_stock: Decimal

    received_stock: Decimal

    damaged_stock: Decimal

    adjusted_stock: Decimal

    closing_stock: Decimal

    remaining_stock: Decimal

    stock_value: Decimal

    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ======================================================
# PRODUCT DAILY STATUS
# ======================================================

class ProductDailyStatusCreate(BaseModel):
    product_id: int

    record_date: datetime

    delivery_recorded: bool = False

    damage_recorded: bool = False

    adjustment_recorded: bool = False

    closing_stock_recorded: bool = False


class ProductDailyStatusResponse(BaseModel):
    id: int

    product_id: int

    record_date: datetime

    delivery_recorded: bool

    damage_recorded: bool

    adjustment_recorded: bool

    closing_stock_recorded: bool

    model_config = ConfigDict(from_attributes=True)