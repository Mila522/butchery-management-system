from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.user import UserRole
from app.services.dashboard_service import (
    get_dashboard,
    get_category_stock,
    get_inventory_distribution,
    get_low_stock,
    get_stock_trend,
)

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get("")
def dashboard(
    db: Session = Depends(get_db),
    _=Depends(require_roles(UserRole.ADMIN, UserRole.MANAGER)),
):
    return get_dashboard(db)


@router.get("/category-stock")
def category_stock(
    db: Session = Depends(get_db),
    _=Depends(require_roles(UserRole.ADMIN, UserRole.MANAGER)),
):
    return get_category_stock(db)

@router.get("/inventory-distribution")
def inventory_distribution(
    db: Session = Depends(get_db),
    _=Depends(require_roles(UserRole.ADMIN, UserRole.MANAGER)),
):
    return get_inventory_distribution(db)

@router.get("/stock-trend")
def stock_trend(
    db: Session = Depends(get_db),
    _=Depends(require_roles(UserRole.ADMIN, UserRole.MANAGER)),
):
    return get_stock_trend(db)

@router.get("/low-stock")
def low_stock(
    db: Session = Depends(get_db),
    _=Depends(require_roles(UserRole.ADMIN, UserRole.MANAGER)),
):
    return get_low_stock(db)