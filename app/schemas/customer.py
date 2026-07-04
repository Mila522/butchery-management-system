from datetime import datetime

from pydantic import BaseModel, ConfigDict


class CustomerCreate(BaseModel):
    name: str
    phone: str | None = None
    email: str | None = None
    address: str | None = None
    is_walk_in: bool = False


class CustomerUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    email: str | None = None
    address: str | None = None
    is_walk_in: bool | None = None
    active: bool | None = None


class CustomerResponse(CustomerCreate):
    id: int
    active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
