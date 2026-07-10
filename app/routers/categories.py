from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.user import UserRole

from app.schemas.category import (
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
)

from app.services import category_service

router = APIRouter(
    prefix="/categories",
    tags=["Categories"],
)


@router.get(
    "/",
    response_model=list[CategoryResponse],
)
def get_categories(
    db: Session = Depends(get_db),
):
    return category_service.list_categories(db)


@router.get(
    "/{category_id}",
    response_model=CategoryResponse,
)
def get_category(
    category_id: int,
    db: Session = Depends(get_db),
):
    return category_service.get_category(
        db,
        category_id,
    )


@router.post(
    "/",
    response_model=CategoryResponse,
)
def create_category(
    category: CategoryCreate,
    db: Session = Depends(get_db),
    _=Depends(
        require_roles(
            UserRole.ADMIN,
            UserRole.MANAGER,
        )
    ),
):
    return category_service.create_category(
        db,
        category,
    )


@router.put(
    "/{category_id}",
    response_model=CategoryResponse,
)
def update_category(
    category_id: int,
    category: CategoryUpdate,
    db: Session = Depends(get_db),
    _=Depends(
        require_roles(
            UserRole.ADMIN,
            UserRole.MANAGER,
        )
    ),
):
    return category_service.update_category(
        db,
        category_id,
        category,
    )


@router.delete(
    "/{category_id}",
)
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    _=Depends(
        require_roles(
            UserRole.ADMIN,
            UserRole.MANAGER,
        )
    ),
):
    return category_service.delete_category(
        db,
        category_id,
    )