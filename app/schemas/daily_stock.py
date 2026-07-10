from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class DailyStockBase(BaseModel):
    product_id: int
    stock_date: date
    notes: str | None = None


class DailyStockResponse(BaseModel):
    id: int

    product_id: int

    product_name: str

    stock_date: date

    opening_stock: Decimal

    received_today: Decimal

    damaged_today: Decimal

    closing_stock: Decimal

    notes: str | None = None

    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ClosingStockItem(BaseModel):
    product_id: int

    closing_stock: Decimal

    notes: str | None = None


class ClosingStockRequest(BaseModel):
    items: list[ClosingStockItem]
