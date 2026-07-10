from datetime import date, datetime

from pydantic import BaseModel, ConfigDict

from app.models.business_day import BusinessDayStatus


class BusinessDayResponse(BaseModel):
    id: int
    business_date: date
    status: BusinessDayStatus
    opened_by: int | None = None
    closed_by: int | None = None
    reopened_by: int | None = None
    opened_at: datetime
    closed_at: datetime | None = None
    reopened_at: datetime | None = None
    notes: str | None = None
    created_at: datetime
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class BusinessDayCloseRequest(BaseModel):
    notes: str | None = None


class BusinessDayReopenRequest(BaseModel):
    notes: str | None = None
