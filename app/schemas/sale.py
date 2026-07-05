from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class SaleItemCreate(BaseModel):
    product_id: int
    quantity: Decimal = Field(gt=0)


class SaleCreate(BaseModel):
    customer_id: int | None = None
    payment_method_id: int | None = None
    amount_paid: Decimal | None = Field(default=None, ge=0)
    items: list[SaleItemCreate] = Field(min_length=1)


class SaleItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: Decimal
    selling_price: Decimal
    line_total: Decimal

    model_config = ConfigDict(from_attributes=True)


class SaleResponse(BaseModel):
    id: int
    receipt_number: str
    customer_id: int | None
    sale_date: datetime
    cashier_id: int | None
    payment_method_id: int | None
    total_amount: Decimal | None
    amount_paid: Decimal | None
    change_given: Decimal | None
    items: list[SaleItemResponse]

    model_config = ConfigDict(from_attributes=True)
