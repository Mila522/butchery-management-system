from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.schemas.inventory import DamageResponse
from app.schemas.product import ProductResponse


class DashboardResponse(BaseModel):
    total_products: int
    low_stock: int
    inventory_value: Decimal
    damages_today: Decimal
    deliveries_today: int
    estimated_profit: Decimal

    recent_damages: list[DamageResponse]

    low_stock_products: list[ProductResponse]

    model_config = ConfigDict(from_attributes=True)