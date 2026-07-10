from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.user import User, UserRole
from app.schemas.business_day import (
    BusinessDayCloseRequest,
    BusinessDayReopenRequest,
    BusinessDayResponse,
)
from app.services import business_day_service


router = APIRouter(
    prefix="/business-days",
    tags=["Business Days"],
)


@router.get("/today", response_model=BusinessDayResponse | None)
def get_today_business_day(db: Session = Depends(get_db)):
    return business_day_service.get_business_day(db, date.today())


@router.post("/today/open", response_model=BusinessDayResponse)
def open_today_business_day(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.MANAGER)),
):
    return business_day_service.open_business_day(db, date.today(), current_user)


@router.post("/today/close")
def close_today_business_day(
    payload: BusinessDayCloseRequest | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.MANAGER)),
):
    return business_day_service.close_business_day(
        db,
        business_date=date.today(),
        current_user=current_user,
        notes=payload.notes if payload else None,
    )


@router.post("/today/reopen", response_model=BusinessDayResponse)
def reopen_today_business_day(
    payload: BusinessDayReopenRequest | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.MANAGER)),
):
    return business_day_service.reopen_business_day(
        db,
        date.today(),
        current_user,
        payload.notes if payload else None,
    )


@router.get("", response_model=BusinessDayResponse | None)
def get_business_day(
    business_date: date = Query(default_factory=date.today),
    db: Session = Depends(get_db),
):
    return business_day_service.get_business_day(db, business_date)
