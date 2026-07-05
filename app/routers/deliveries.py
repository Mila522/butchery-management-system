from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.user import UserRole
from app.schemas.delivery import DeliveryCreate, DeliveryResponse
from app.services import delivery_service

router = APIRouter(
    prefix="/deliveries",
    tags=["Deliveries"]
)


@router.post("", response_model=DeliveryResponse)
def create_delivery(
    delivery: DeliveryCreate,
    db: Session = Depends(get_db),
    _=Depends(require_roles(UserRole.ADMIN, UserRole.MANAGER)),
):
    return delivery_service.create_delivery(db, delivery)


@router.get("", response_model=list[DeliveryResponse])
def list_deliveries(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    search: str | None = None,
    db: Session = Depends(get_db),
):
    return delivery_service.list_deliveries(db, limit, offset, search)


@router.get("/{delivery_id}", response_model=DeliveryResponse)
def get_delivery(delivery_id: int, db: Session = Depends(get_db)):
    return delivery_service.get_delivery(db, delivery_id)
