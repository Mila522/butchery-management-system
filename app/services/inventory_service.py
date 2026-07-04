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
from app.models.sale import Sale
from app.models.sale_item import SaleItem
from app.schemas.inventory import DamageCreate, InventoryAdjustmentCreate

logger = logging.getLogger(__name__)


def _get_locked_product(db: Session, product_id: int) -> Product:
    product = db.query(Product).filter(Product.id == product_id).with_for_update().first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")
    return product


def create_adjustment(db: Session, payload: InventoryAdjustmentCreate) -> InventoryAdjustment:
    try:
        product = _get_locked_product(db, payload.product_id)
        if payload.adjustment_type.value == "increase":
            product.current_stock += payload.quantity_adjusted
        else:
            if product.current_stock < payload.quantity_adjusted:
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Stock cannot go below zero.")
            product.current_stock -= payload.quantity_adjusted

        adjustment = InventoryAdjustment(**payload.model_dump())
        db.add(adjustment)
        db.commit()
        db.refresh(adjustment)
        logger.info("Inventory adjustment %s recorded for product %s.", adjustment.id, product.id)
        return adjustment
    except Exception:
        db.rollback()
        logger.exception("Failed to create inventory adjustment.")
        raise


def create_damage(db: Session, payload: DamageCreate) -> Damage:
    try:
        product = _get_locked_product(db, payload.product_id)
        if product.current_stock < payload.quantity_damaged:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Stock cannot go below zero.")
        product.current_stock -= payload.quantity_damaged

        damage = Damage(**payload.model_dump())
        db.add(damage)
        db.commit()
        db.refresh(damage)
        logger.info("Damage %s recorded for product %s.", damage.id, product.id)
        return damage
    except Exception:
        db.rollback()
        logger.exception("Failed to record damage.")
        raise


def create_daily_snapshot(db: Session, snapshot_date: date) -> list[DailyStock]:
    products = db.query(Product).all()
    snapshots: list[DailyStock] = []

    for product in products:
        existing = db.query(DailyStock).filter(
            DailyStock.product_id == product.id,
            DailyStock.stock_date == snapshot_date,
        ).first()
        if existing:
            snapshots.append(existing)
            continue

        sold = db.query(func.coalesce(func.sum(SaleItem.quantity), 0)).join(Sale).filter(
            SaleItem.product_id == product.id,
            func.date(Sale.sale_date) == snapshot_date,
        ).scalar()
        received = db.query(func.coalesce(func.sum(DeliveryItem.quantity), 0)).join(Delivery).filter(
            DeliveryItem.product_id == product.id,
            func.date(Delivery.delivery_date) == snapshot_date,
        ).scalar()
        damaged = db.query(func.coalesce(func.sum(Damage.quantity_damaged), 0)).filter(
            Damage.product_id == product.id,
            func.date(Damage.damage_date) == snapshot_date,
        ).scalar()

        closing = product.current_stock
        opening = closing + Decimal(str(sold)) + Decimal(str(damaged)) - Decimal(str(received))
        snapshot = DailyStock(
            product_id=product.id,
            stock_date=snapshot_date,
            opening_stock=opening,
            closing_stock=closing,
            quantity_sold=sold,
            quantity_received=received,
            quantity_damaged=damaged,
            estimated_value=closing * product.purchase_price,
        )
        db.add(snapshot)
        snapshots.append(snapshot)

    db.commit()
    for snapshot in snapshots:
        db.refresh(snapshot)
    return snapshots
