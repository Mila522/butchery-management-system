from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class InvoiceItemResponse(BaseModel):
    id: int
    product_id: int
    description: str
    quantity: Decimal
    unit_price: Decimal
    line_total: Decimal

    model_config = ConfigDict(from_attributes=True)


class InvoiceResponse(BaseModel):
    id: int
    invoice_number: str
    sale_id: int
    customer_id: int | None
    invoice_date: datetime
    subtotal: Decimal
    total: Decimal
    items: list[InvoiceItemResponse]

    model_config = ConfigDict(from_attributes=True)
