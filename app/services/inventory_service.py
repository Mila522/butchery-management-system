import logging
from datetime import date
from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.daily_stock import DailyStock
from app.models.damage import Damage
from app.models.delivery import Delivery
from app.models.delivery_item import DeliveryItem
from app.models.inventory_adjustment import InventoryAdjustment
from app.models.product import Product
from app.models.user import User
from app.schemas.inventory import DamageCreate, InventoryAdjustmentCreate
from app.services.business_day_service import ensure_business_day_open
from app.services.analytics_service import update_daily_analytics, update_daily_stock, update_product_status

logger = logging.getLogger(__name__)


def _get_locked_product(db: Session, product_id: int) -> Product:
    product = db.query(Product).filter(Product.id == product_id).with_for_update().first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")
    return product


def list_adjustments(db: Session, limit: int = 50, offset: int = 0, product_id: int | None = None):
    query = db.query(InventoryAdjustment)
    if product_id is not None:
        query = query.filter(InventoryAdjustment.product_id == product_id)
    return query.order_by(InventoryAdjustment.adjustment_date.desc()).offset(offset).limit(limit).all()


def get_adjustment(db: Session, adjustment_id: int) -> InventoryAdjustment:
    adjustment = db.query(InventoryAdjustment).filter(InventoryAdjustment.id == adjustment_id).first()
    if not adjustment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inventory adjustment not found.")
    return adjustment


def list_damages(db: Session, limit: int = 50, offset: int = 0, product_id: int | None = None):
    query = db.query(Damage)
    if product_id is not None:
        query = query.filter(Damage.product_id == product_id)
    return query.order_by(Damage.damage_date.desc()).offset(offset).limit(limit).all()


def get_damage(db: Session, damage_id: int) -> Damage:
    damage = db.query(Damage).filter(Damage.id == damage_id).first()
    if not damage:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Damage record not found.")
    return damage


def create_adjustment(
    db: Session,
    payload: InventoryAdjustmentCreate,
    current_user: User | None = None,
) -> InventoryAdjustment:
    try:
        ensure_business_day_open(db, payload.adjustment_date.date())
        product = _get_locked_product(db, payload.product_id)

        if not product.active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot adjust an inactive product.",
            )

        # Positive = increase stock
        # Negative = decrease stock
        if payload.quantity_change < 0:
            if product.current_stock < abs(payload.quantity_change):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Insufficient stock for {product.name}. Available: {product.current_stock}.",
                )

        # Apply stock adjustment
        product.current_stock += payload.quantity_change
        update_daily_stock(db, product)

        update_daily_analytics(
        db,
        product,
        )
        update_product_status(
        db,
        product,
        adjustment=True,
        )

        adjustment = InventoryAdjustment(
            product_id=payload.product_id,
            adjustment_date=payload.adjustment_date,
            quantity_change=payload.quantity_change,
            reason=payload.reason,
            adjusted_by=current_user.id if current_user else None,
        )

        db.add(adjustment)
        db.commit()
        db.refresh(adjustment)

        logger.info(
            "Inventory adjustment %s recorded for product %s.",
            adjustment.id,
            product.id,
        )

        return adjustment

    except HTTPException:
        db.rollback()
        raise

    except Exception:
        db.rollback()
        logger.exception("Failed to create inventory adjustment.")
        raise


def create_damage(db: Session, payload: DamageCreate, current_user: User | None = None) -> Damage:
    try:
        ensure_business_day_open(db, payload.damage_date.date())
        product = _get_locked_product(db, payload.product_id)
        if not product.active:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot damage inactive product.")

        if product.current_stock < payload.quantity:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Insufficient stock for {product.name}. Available: {product.current_stock}.",
            )
        product.current_stock -= payload.quantity
        update_daily_stock(
        db,
        product,
        damaged=payload.quantity,
    )
        
        update_daily_analytics(
        db,
        product,
        )
        update_product_status(
        db,
        product,
        damage=True,
    )

        damage = Damage(
    product_id=payload.product_id,
    quantity=payload.quantity,
    reason=payload.reason,
    damage_date=payload.damage_date,
    recorded_by=current_user.id if current_user else None,
        )
        
        db.add(damage)
        db.commit()
        db.refresh(damage)
        logger.info("Damage %s recorded for product %s.", damage.id, product.id)
        return damage
    except Exception:
        db.rollback()
        logger.exception("Failed to record damage.")
        raise


from datetime import date
from decimal import Decimal
from sqlalchemy import func

def create_daily_snapshot(db: Session, snapshot_date: date) -> list[DailyStock]:
    """
    Creates the end-of-day stock snapshot for every product and updates
    all analytics tables.
    """

    products = db.query(Product).all()
    snapshots: list[DailyStock] = []

    for product in products:

        existing = (
            db.query(DailyStock)
            .filter(
                DailyStock.product_id == product.id,
                DailyStock.stock_date == snapshot_date,
            )
            .first()
        )

        if existing:
            snapshots.append(existing)
            continue

        received = (
            db.query(func.coalesce(func.sum(DeliveryItem.quantity), 0))
            .join(Delivery)
            .filter(
                DeliveryItem.product_id == product.id,
                func.date(Delivery.delivery_date) == snapshot_date,
            )
            .scalar()
        )

        damaged = (
            db.query(func.coalesce(func.sum(Damage.quantity), 0))
            .filter(
                Damage.product_id == product.id,
                func.date(Damage.damage_date) == snapshot_date,
            )
            .scalar()
        )

        closing = product.current_stock

        opening = (
            Decimal(str(closing))
            + Decimal(str(damaged))
            - Decimal(str(received))
        )

        snapshot = DailyStock(
            product_id=product.id,
            stock_date=snapshot_date,
            opening_stock=opening,
            closing_stock=closing,
            notes=f"Received: {received}; Damaged: {damaged}",
        )

        db.add(snapshot)

        # ----------------------------------
        # Update analytics tables
        # ----------------------------------

        update_daily_stock(
            db,
            product,
        )

        update_daily_analytics(
            db,
            product,
        )

        update_product_status(
            db,
            product,
            closing_stock=True,
        )

        snapshots.append(snapshot)

    db.commit()

    for snapshot in snapshots:
        db.refresh(snapshot)

    return snapshots
