from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class DeliveryItemCreate(BaseModel):
    product_id: int
    quantity: Decimal = Field(gt=0)
    unit_cost: Decimal = Field(ge=0)

class DeliveryCreate(BaseModel):
    invoice_number: str
    supplier_name: str
    delivery_date: datetime
    recorded_by: str
    notes: str | None = None
    items: list[DeliveryItemCreate] = Field(min_length=1)

class DeliveryItemResponse(BaseModel):
    id: int
    product_id: int
    product_name: str | None = None
    quantity: Decimal
    unit_cost: Decimal

    model_config = ConfigDict(from_attributes=True)


class DeliveryResponse(BaseModel):
    id: int
    invoice_number: str
    supplier_name: str
    delivery_date: datetime
    recorded_by: str
    notes: str | None


    items: list[DeliveryItemResponse]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)