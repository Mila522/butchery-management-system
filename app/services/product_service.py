from sqlalchemy import asc, desc
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


SORT_FIELDS = {
    "id": Product.id,
    "name": Product.name,
    "sku": Product.sku,
    "current_stock": Product.current_stock,
    "selling_price": Product.selling_price,
    "created_at": Product.created_at,
}


def list_products(
    db: Session,
    limit: int = 50,
    offset: int = 0,
    search: str | None = None,
    sort_by: str = "name",
    sort_order: str = "asc",
) -> list[Product]:
    query = db.query(Product)
    if search:
        pattern = f"%{search}%"
        query = query.filter((Product.name.ilike(pattern)) | (Product.sku.ilike(pattern)))

    sort_column = SORT_FIELDS.get(sort_by, Product.name)
    query = query.order_by(desc(sort_column) if sort_order.lower() == "desc" else asc(sort_column))
    return query.offset(offset).limit(limit).all()


def get_product(db: Session, product_id: int) -> Product:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")
    return product


def create_product(db: Session, payload: ProductCreate) -> Product:
    product = Product(**payload.model_dump())
    try:
        db.add(product)
        db.commit()
        db.refresh(product)
        return product
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Product name or SKU already exists.",
        ) from exc


def update_product(db: Session, product_id: int, payload: ProductUpdate) -> Product:
    product = get_product(db, product_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(product, field, value)

    try:
        db.commit()
        db.refresh(product)
        return product
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Product name or SKU already exists.",
        ) from exc


def deactivate_product(db: Session, product_id: int) -> Product:
    product = get_product(db, product_id)
    product.active = False
    db.commit()
    db.refresh(product)
    return product

def activate_product(db: Session, product_id: int) -> Product:
    product = get_product(db, product_id)
    product.active = True
    db.commit()
    db.refresh(product)
    return product