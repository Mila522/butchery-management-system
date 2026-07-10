from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.user import UserRole
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate
from app.services import product_service

router = APIRouter(
    prefix="/products",
    tags=["Products"]
)


@router.get("/", response_model=list[ProductResponse])
def get_products(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    search: str | None = None,
    sort_by: str = "name",
    sort_order: str = "asc",
    db: Session = Depends(get_db),
):
    return product_service.list_products(db, limit, offset, search, sort_by, sort_order)


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    return product_service.get_product(db, product_id)


@router.post("/", response_model=ProductResponse)
def create_product(
    product: ProductCreate,
    db: Session = Depends(get_db),
    _=Depends(require_roles(UserRole.ADMIN, UserRole.MANAGER)),
):
    return product_service.create_product(db, product)


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product: ProductUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_roles(UserRole.ADMIN, UserRole.MANAGER)),
):
    return product_service.update_product(db, product_id, product)


@router.patch("/{product_id}/deactivate", response_model=ProductResponse)
def deactivate_product(
    product_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_roles(UserRole.ADMIN, UserRole.MANAGER)),
):
    return product_service.deactivate_product(db, product_id)

@router.patch("/{product_id}/activate", response_model=ProductResponse)
def activate_product(
    product_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_roles(UserRole.ADMIN, UserRole.MANAGER)),
):
    return product_service.activate_product(db, product_id)
