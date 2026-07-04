from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.user import UserRole
from app.services import analytics_service

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/daily-sales")
def daily_sales(start_date: date, end_date: date, db: Session = Depends(get_db)):
    return analytics_service.sales_by_period(db, start_date, end_date, "daily")


@router.get("/weekly-sales")
def weekly_sales(start_date: date, end_date: date, db: Session = Depends(get_db)):
    return analytics_service.sales_by_period(db, start_date, end_date, "weekly")


@router.get("/monthly-sales")
def monthly_sales(start_date: date, end_date: date, db: Session = Depends(get_db)):
    return analytics_service.sales_by_period(db, start_date, end_date, "monthly")


@router.get("/profit")
def profit(
    start_date: date,
    end_date: date,
    db: Session = Depends(get_db),
    _=Depends(require_roles(UserRole.ADMIN, UserRole.MANAGER)),
):
    return analytics_service.profit(db, start_date, end_date)


@router.get("/inventory-valuation")
def inventory_valuation(
    db: Session = Depends(get_db),
    _=Depends(require_roles(UserRole.ADMIN, UserRole.MANAGER)),
):
    return analytics_service.inventory_valuation(db)


@router.get("/product-performance")
def product_performance(
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return analytics_service.product_performance(db, limit)
