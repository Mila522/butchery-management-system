from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.user import User, UserRole
from app.schemas.inventory import DamageCreate, DamageResponse
from app.services import inventory_service

router = APIRouter(prefix="/damages", tags=["Damages"])


@router.get("", response_model=list[DamageResponse])
def list_damages(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    product_id: int | None = None,
    db: Session = Depends(get_db),
):
    return inventory_service.list_damages(db, limit, offset, product_id)


@router.post("", response_model=DamageResponse, status_code=status.HTTP_201_CREATED)
def create_damage(
    payload: DamageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.ADMIN, UserRole.MANAGER)),
):
    return inventory_service.create_damage(db, payload, current_user)


@router.get("/{damage_id}", response_model=DamageResponse)
def get_damage(damage_id: int, db: Session = Depends(get_db)):
    return inventory_service.get_damage(db, damage_id)
