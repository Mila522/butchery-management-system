from datetime import date

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.user import User, UserRole
from app.schemas.inventory import (
    DailyStockSnapshotResponse,
    DamageCreate,
    DamageResponse,
    InventoryAdjustmentCreate,
    InventoryAdjustmentResponse,
)
from app.services import inventory_service

router = APIRouter(prefix="/inventory", tags=["Inventory"])


@router.post("/adjustments", response_model=InventoryAdjustmentResponse, status_code=status.HTTP_201_CREATED)
def create_adjustment(
    payload: InventoryAdjustmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.MANAGER)),
):
    return inventory_service.create_adjustment(db, payload, current_user)


@router.get("/adjustments", response_model=list[InventoryAdjustmentResponse])
def list_adjustments(
    limit: int = 50,
    offset: int = 0,
    product_id: int | None = None,
    db: Session = Depends(get_db),
):
    return inventory_service.list_adjustments(db, limit, offset, product_id)


@router.post("/damages", response_model=DamageResponse, status_code=status.HTTP_201_CREATED)
def create_damage(
    payload: DamageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.MANAGER)),
):
    return inventory_service.create_damage(db, payload, current_user)


@router.get("/damages", response_model=list[DamageResponse])
def list_damages(
    limit: int = 50,
    offset: int = 0,
    product_id: int | None = None,
    db: Session = Depends(get_db),
):
    return inventory_service.list_damages(db, limit, offset, product_id)


@router.post("/daily-snapshot", response_model=list[DailyStockSnapshotResponse])
def create_daily_snapshot(
    snapshot_date: date | None = None,
    db: Session = Depends(get_db),
    _=Depends(require_roles(UserRole.ADMIN, UserRole.MANAGER)),
):
    return inventory_service.create_daily_snapshot(db, snapshot_date or date.today())
