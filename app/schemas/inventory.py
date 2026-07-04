from datetime import date, datetime
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class AdjustmentType(str, Enum):
    INCREASE = "increase"
    DECREASE = "decrease"


class AdjustmentReason(str, Enum):
    STOCK_COUNT = "Stock Count"
    THEFT = "Theft"
    CORRECTION = "Correction"
    TRANSFER = "Transfer"
    OTHER = "Other"


class InventoryAdjustmentCreate(BaseModel):
    product_id: int
    adjustment_type: AdjustmentType
    quantity_adjusted: Decimal = Field(gt=0)
    reason: AdjustmentReason
    notes: str | None = None
    adjusted_by: str | None = None
    adjustment_date: datetime


class InventoryAdjustmentResponse(InventoryAdjustmentCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)


class DamageCreate(BaseModel):
    product_id: int
    quantity_damaged: Decimal = Field(gt=0)
    reason: str
    description: str | None = None
    damage_date: datetime
    reported_by: str | None = None


class DamageResponse(DamageCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)


class DailyStockSnapshotResponse(BaseModel):
    id: int
    product_id: int
    stock_date: date
    opening_stock: Decimal
    closing_stock: Decimal
    quantity_sold: Decimal
    quantity_received: Decimal
    quantity_damaged: Decimal
    estimated_value: Decimal | None

    model_config = ConfigDict(from_attributes=True)
