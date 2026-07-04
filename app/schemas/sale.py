from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class SaleItemCreate(BaseModel):
    product_id: int
    quantity: Decimal = Field(gt=0)


class SaleCreate(BaseModel):
    customer_id: int | None = None
    payment_method: str = "cash"
    recorded_by: str | None = None
    items: list[SaleItemCreate] = Field(min_length=1)


class SaleItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: Decimal
    unit_price: Decimal
    line_total: Decimal

    model_config = ConfigDict(from_attributes=True)


class SaleResponse(BaseModel):
    id: int
    customer_id: int | None
    sale_date: datetime
    subtotal: Decimal
    total: Decimal
    payment_method: str | None
    recorded_by: str | None
    items: list[SaleItemResponse]

    model_config = ConfigDict(from_attributes=True)
