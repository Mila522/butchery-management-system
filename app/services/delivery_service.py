import logging
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload
from fastapi import HTTPException, status

from app.models.delivery import Delivery
from app.models.delivery_item import DeliveryItem
from app.models.product import Product
from app.schemas.delivery import DeliveryCreate
from app.services.business_day_service import ensure_business_day_open
from app.services.analytics_service import (
    update_daily_analytics,
    update_daily_stock,
    update_product_status,
)

logger = logging.getLogger(__name__)


def list_deliveries(db: Session, limit: int = 50, offset: int = 0, search: str | None = None):
    query = db.query(Delivery).options(
        selectinload(Delivery.items).selectinload(DeliveryItem.product)
    )
    if search:
        pattern = f"%{search}%"
        query = query.filter(
            (Delivery.invoice_number.ilike(pattern)) | (Delivery.supplier_name.ilike(pattern))
        )
    return query.order_by(Delivery.delivery_date.desc()).offset(offset).limit(limit).all()


def get_delivery(db: Session, delivery_id: int) -> Delivery:
    delivery = (
        db.query(Delivery)
        .options(selectinload(Delivery.items).selectinload(DeliveryItem.product))
        .filter(Delivery.id == delivery_id)
        .first()
    )
    if not delivery:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Delivery not found.")
    return delivery


def create_delivery(db: Session, payload: DeliveryCreate) -> Delivery:
    ensure_business_day_open(db, payload.delivery_date.date())

    delivery = Delivery(
        invoice_number=payload.invoice_number,
        supplier_name=payload.supplier_name,
        delivery_date=payload.delivery_date,
        recorded_by=payload.recorded_by,
        notes=payload.notes,
    )

    try:
        db.add(delivery)
        db.flush()

        for item in payload.items:
            product = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product {item.product_id} not found.",
                )
            if not product.active:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Product {product.name} is inactive.",
                )

            delivery_item = DeliveryItem(delivery_id=delivery.id, **item.model_dump())
            delivery_item.product = product
            db.add(delivery_item)
            product.current_stock += item.quantity
            update_daily_stock(
                db,
                product,
                received=item.quantity,
            )

            update_daily_analytics(
                db,
                product,
            )


            update_product_status(
                db,
                product,
                delivery=True,
            )
            

        delivery_id = delivery.id
        db.commit()
        logger.info("Delivery %s recorded with %s items.", delivery.invoice_number, len(payload.items))
        return get_delivery(db, delivery_id)
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Delivery invoice number already exists.",
        ) from exc
    except Exception:
        db.rollback()
        logger.exception("Failed to record delivery %s.", payload.invoice_number)
        raise
