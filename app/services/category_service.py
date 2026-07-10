from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.product import Product
from app.schemas.category import CategoryCreate, CategoryUpdate


def list_categories(db: Session):
    return db.query(Category).order_by(Category.name).all()


def get_category(db: Session, category_id: int):
    category = (
        db.query(Category)
        .filter(Category.id == category_id)
        .first()
    )

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found.",
        )

    return category


def create_category(
    db: Session,
    payload: CategoryCreate,
):
    category = Category(**payload.model_dump())

    try:
        db.add(category)
        db.commit()
        db.refresh(category)
        return category

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Category already exists.",
        )


def update_category(
    db: Session,
    category_id: int,
    payload: CategoryUpdate,
):
    category = get_category(db, category_id)

    for field, value in payload.model_dump(
        exclude_unset=True
    ).items():
        setattr(category, field, value)

    try:
        db.commit()
        db.refresh(category)
        return category

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Category already exists.",
        )


def delete_category(
    db: Session,
    category_id: int,
):
    category = get_category(db, category_id)

    product_count = (
        db.query(Product)
        .filter(Product.category_id == category_id)
        .count()
    )

    if product_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete category because products are assigned to it.",
        )

    db.delete(category)
    db.commit()

    return {
        "message": "Category deleted successfully."
    }