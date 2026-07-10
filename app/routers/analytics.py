from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services import analytics_service

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/")
def analytics_placeholder():
    return {
        "message": "Analytics module temporarily disabled while being migrated."
    }


@router.get("/reports/daily")
def daily_report(
    report_date: date = Query(default_factory=date.today),
    db: Session = Depends(get_db),
):
    return analytics_service.get_daily_report(db, report_date)


@router.get("/reports/weekly")
def weekly_report(
    report_date: date = Query(default_factory=date.today),
    db: Session = Depends(get_db),
):
    return analytics_service.get_weekly_report(db, report_date)


@router.get("/reports/monthly")
def monthly_report(
    report_date: date = Query(default_factory=date.today),
    db: Session = Depends(get_db),
):
    return analytics_service.get_monthly_report(db, report_date)


@router.get("/reports/profit")
def profit_report(
    start_date: date,
    end_date: date,
    db: Session = Depends(get_db),
):
    return analytics_service.get_profit_report(db, start_date, end_date)


@router.get("/reports/damage")
def damage_report(
    start_date: date,
    end_date: date,
    db: Session = Depends(get_db),
):
    return analytics_service.get_damage_report(db, start_date, end_date)


@router.get("/reports/stock-valuation")
def stock_valuation(
    report_date: date = Query(default_factory=date.today),
    db: Session = Depends(get_db),
):
    return analytics_service.get_stock_valuation(db, report_date)


@router.get("/reports/business-overview")
def business_overview(
    start_date: date,
    end_date: date,
    db: Session = Depends(get_db),
):
    return analytics_service.get_business_overview(db, start_date, end_date)
