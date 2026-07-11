from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class InventoryAdjustmentCreate(BaseModel):
    product_id: int
    quantity_change: Decimal
    reason: str
    adjustment_date: datetime


class InventoryAdjustmentResponse(BaseModel):
    id: int
    product_id: int
    product_name: str | None = None
    adjustment_type: str | None = None
    quantity_change: Decimal
    reason: str
    adjusted_by: int | None
    adjustment_date: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DamageCreate(BaseModel):
    product_id: int
    quantity: Decimal = Field(gt=0)
    reason: str
    damage_date: datetime
    recorded_by: int | None = None


class DamageResponse(BaseModel):
    id: int
    product_id: int
    product_name: str | None = None
    quantity: Decimal
    reason: str
    damage_date: datetime
    recorded_by: int | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DailyStockSnapshotResponse(BaseModel):
    id: int
    product_id: int | None
    stock_date: date
    opening_stock: Decimal | None
    closing_stock: Decimal | None

    model_config = ConfigDict(from_attributes=True)
