from datetime import datetime
import enum

from sqlalchemy import Column, Date, DateTime, Enum, Integer, String, UniqueConstraint

from app.core.database import Base


class BusinessDayStatus(str, enum.Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"


class BusinessDay(Base):
    __tablename__ = "business_days"
    __table_args__ = (
        UniqueConstraint("business_date", name="uq_business_days_business_date"),
    )

    id = Column(Integer, primary_key=True, index=True)
    business_date = Column(Date, nullable=False, index=True)
    status = Column(Enum(BusinessDayStatus), nullable=False, default=BusinessDayStatus.OPEN)
    opened_by = Column(Integer)
    closed_by = Column(Integer)
    reopened_by = Column(Integer)
    opened_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    closed_at = Column(DateTime)
    reopened_at = Column(DateTime)
    notes = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
