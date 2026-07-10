from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db

from app.core.dependencies import require_roles
from app.models.user import UserRole

from app.schemas.daily_stock import (
    DailyStockResponse,
    ClosingStockRequest,
)

from app.services import daily_stock_service

router = APIRouter(
    prefix="/daily-stock",
    tags=["Daily Stock"],
)


@router.get(
    "/today",
    response_model=list[DailyStockResponse],
)
def get_today_stock(
    db: Session = Depends(get_db),
):

    return daily_stock_service.get_today_stock(db)


@router.put(
    "/close",
)
def save_closing_stock(
    payload: ClosingStockRequest,
    db: Session = Depends(get_db),
    _=Depends(
        require_roles(
            UserRole.ADMIN,
            UserRole.MANAGER,
        )
    ),
):

    return daily_stock_service.save_closing_stock(
        db,
        payload,
    )