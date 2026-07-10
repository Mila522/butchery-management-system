from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.user import User, UserRole
from app.schemas.inventory import InventoryAdjustmentCreate, InventoryAdjustmentResponse
from app.services import inventory_service
from datetime import date

router = APIRouter(prefix="/inventory-adjustments", tags=["Inventory Adjustments"])


@router.get("", response_model=list[InventoryAdjustmentResponse])
def list_inventory_adjustments(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    product_id: int | None = None,
    db: Session = Depends(get_db),
):
    return inventory_service.list_adjustments(db, limit, offset, product_id)


@router.post("", response_model=InventoryAdjustmentResponse, status_code=status.HTTP_201_CREATED)
def create_inventory_adjustment(
    payload: InventoryAdjustmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.MANAGER)),
):
    return inventory_service.create_adjustment(db, payload, current_user)

@router.post(
    "/daily-snapshot",
    status_code=status.HTTP_201_CREATED,
)
def create_daily_snapshot(
    snapshot_date: date = Query(default=date.today()),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.ADMIN, UserRole.MANAGER)
    ),
):
    snapshots = inventory_service.create_daily_snapshot(
        db,
        snapshot_date,
    )

    return {
        "message": f"Daily snapshot created successfully for {snapshot_date}",
        "records_created": len(snapshots),
    }


@router.get("/{adjustment_id}", response_model=InventoryAdjustmentResponse)
def get_inventory_adjustment(adjustment_id: int, db: Session = Depends(get_db)):
    return inventory_service.get_adjustment(db, adjustment_id)
