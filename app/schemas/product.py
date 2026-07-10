from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.enums import Unit
from datetime import datetime

class ProductBase(BaseModel):
    sku: str | None = None
    name: str
    category_id: int
    unit_of_measure: Unit
    product_type: str = "GENERAL"
    purchase_price: Decimal = Field(default=Decimal("0"), ge=0)
    selling_price: Decimal = Field(ge=0)
    minimum_stock: Decimal = Field(default=Decimal("0"), ge=0)
    active: bool = True

class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    sku: str | None = None
    name: str | None = None
    category_id: int | None = None
    unit_of_measure: Unit | None = None
    product_type: str | None = None
    purchase_price: Decimal | None = Field(default=None, ge=0)
    selling_price: Decimal | None = Field(default=None, ge=0)
    minimum_stock: Decimal | None = Field(default=None, ge=0)
    active: bool | None = None

class ProductResponse(ProductBase):
    id: int
    current_stock: Decimal
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
