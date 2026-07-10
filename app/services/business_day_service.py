from datetime import date, datetime, timedelta
from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.business_day import BusinessDay, BusinessDayStatus
from app.models.daily_analytics import DailyAnalytics
from app.models.daily_stock import DailyStock
from app.models.damage import Damage
from app.models.delivery import Delivery
from app.models.delivery_item import DeliveryItem
from app.models.product import Product
from app.models.user import User
from app.schemas.daily_stock import ClosingStockRequest


ZERO = Decimal("0")


def get_business_day(db: Session, business_date: date) -> BusinessDay | None:
    return (
        db.query(BusinessDay)
        .filter(BusinessDay.business_date == business_date)
        .first()
    )


def open_business_day(
    db: Session,
    business_date: date | None = None,
    current_user: User | None = None,
) -> BusinessDay:
    target_date = business_date or date.today()
    existing = get_business_day(db, target_date)

    if existing:
        if existing.status == BusinessDayStatus.CLOSED:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Business day is closed. Reopen it before making changes.",
            )
        prepare_daily_stock(db, target_date)
        db.commit()
        db.refresh(existing)
        return existing

    business_day = BusinessDay(
        business_date=target_date,
        status=BusinessDayStatus.OPEN,
        opened_by=current_user.id if current_user else None,
    )
    db.add(business_day)
    prepare_daily_stock(db, target_date)
    db.commit()
    db.refresh(business_day)
    return business_day


def reopen_business_day(
    db: Session,
    business_date: date | None = None,
    current_user: User | None = None,
    notes: str | None = None,
) -> BusinessDay:
    target_date = business_date or date.today()
    business_day = get_business_day(db, target_date)

    if not business_day:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business day not found.",
        )

    business_day.status = BusinessDayStatus.OPEN
    business_day.reopened_by = current_user.id if current_user else None
    business_day.reopened_at = datetime.utcnow()
    business_day.notes = notes or business_day.notes
    db.commit()
    db.refresh(business_day)
    return business_day


def ensure_business_day_open(db: Session, business_date: date) -> BusinessDay:
    business_day = get_business_day(db, business_date)

    if not business_day:
        business_day = BusinessDay(
            business_date=business_date,
            status=BusinessDayStatus.OPEN,
        )
        db.add(business_day)
        db.flush()

    if business_day.status == BusinessDayStatus.CLOSED:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Business day is closed. Reopen it before making changes.",
        )

    return business_day


def prepare_daily_stock(db: Session, stock_date: date | None = None) -> list[DailyStock]:
    target_date = stock_date or date.today()
    products = db.query(Product).filter(Product.active == True).order_by(Product.name).all()
    stocks: list[DailyStock] = []

    for product in products:
        stock = (
            db.query(DailyStock)
            .filter(
                DailyStock.product_id == product.id,
                DailyStock.stock_date == target_date,
            )
            .first()
        )

        if not stock:
            previous = (
                db.query(DailyStock)
                .filter(
                    DailyStock.product_id == product.id,
                    DailyStock.stock_date < target_date,
                    DailyStock.closing_stock.isnot(None),
                )
                .order_by(DailyStock.stock_date.desc())
                .first()
            )
            opening_stock = previous.closing_stock if previous else product.current_stock
            stock = DailyStock(
                product_id=product.id,
                stock_date=target_date,
                opening_stock=opening_stock or ZERO,
                received_today=ZERO,
                damaged_today=ZERO,
                closing_stock=opening_stock or ZERO,
            )
            db.add(stock)
            db.flush()

        refresh_daily_stock_totals(db, stock)
        stocks.append(stock)

    return stocks


def refresh_daily_stock_totals(db: Session, stock: DailyStock) -> DailyStock:
    received = (
        db.query(func.coalesce(func.sum(DeliveryItem.quantity), 0))
        .join(Delivery)
        .filter(
            DeliveryItem.product_id == stock.product_id,
            func.date(Delivery.delivery_date) == stock.stock_date,
        )
        .scalar()
    )
    damaged = (
        db.query(func.coalesce(func.sum(Damage.quantity), 0))
        .filter(
            Damage.product_id == stock.product_id,
            func.date(Damage.damage_date) == stock.stock_date,
        )
        .scalar()
    )
    stock.received_today = Decimal(str(received or 0))
    stock.damaged_today = Decimal(str(damaged or 0))
    return stock


def close_business_day(
    db: Session,
    payload: ClosingStockRequest | None = None,
    business_date: date | None = None,
    current_user: User | None = None,
    notes: str | None = None,
) -> dict:
    target_date = business_date or date.today()

    try:
        business_day = ensure_business_day_open(db, target_date)
        stocks = prepare_daily_stock(db, target_date)
        closing_by_product = {}

        if payload:
            closing_by_product = {
                item.product_id: item
                for item in payload.items
            }

        for stock in stocks:
            closing_item = closing_by_product.get(stock.product_id)
            if closing_item:
                stock.closing_stock = closing_item.closing_stock
                if closing_item.notes is not None:
                    stock.notes = closing_item.notes

            if stock.closing_stock is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Closing stock is required for product {stock.product_id}.",
                )

            product = (
                db.query(Product)
                .filter(Product.id == stock.product_id)
                .with_for_update()
                .first()
            )
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product {stock.product_id} not found.",
                )

            refresh_daily_stock_totals(db, stock)
            analytics = _upsert_daily_analytics(db, product, stock, target_date)
            product.current_stock = stock.closing_stock
            db.add(analytics)

        business_day.status = BusinessDayStatus.CLOSED
        business_day.closed_by = current_user.id if current_user else None
        business_day.closed_at = datetime.utcnow()
        business_day.notes = notes or business_day.notes

        db.commit()

        return {
            "message": "Business day closed successfully.",
            "business_date": target_date,
            "status": business_day.status.value,
            "records_closed": len(stocks),
        }

    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise


def _upsert_daily_analytics(
    db: Session,
    product: Product,
    stock: DailyStock,
    analytics_date: date,
) -> DailyAnalytics:
    analytics = (
        db.query(DailyAnalytics)
        .filter(
            DailyAnalytics.product_id == product.id,
            DailyAnalytics.analytics_date == analytics_date,
        )
        .first()
    )

    opening = Decimal(str(stock.opening_stock or 0))
    received = Decimal(str(stock.received_today or 0))
    damaged = Decimal(str(stock.damaged_today or 0))
    closing = Decimal(str(stock.closing_stock or 0))
    purchase_price = Decimal(str(product.purchase_price or 0))
    selling_price = Decimal(str(product.selling_price or 0))

    estimated_sold = opening + received - damaged - closing
    if estimated_sold < ZERO:
        estimated_sold = ZERO

    revenue = estimated_sold * selling_price
    cost = estimated_sold * purchase_price
    gross_profit = revenue - cost
    damage_loss = damaged * purchase_price
    stock_value = closing * purchase_price
    markup = selling_price - purchase_price
    margin_percent = ZERO
    if selling_price > ZERO:
        margin_percent = ((selling_price - purchase_price) / selling_price) * Decimal("100")

    if not analytics:
        analytics = DailyAnalytics(
            analytics_date=analytics_date,
            product_id=product.id,
        )

    analytics.estimated_sold = estimated_sold
    analytics.actual_sold = ZERO
    analytics.remaining_stock = closing
    analytics.revenue = revenue
    analytics.cost = cost
    analytics.gross_profit = gross_profit
    analytics.damage_loss = damage_loss
    analytics.stock_value = stock_value
    analytics.markup = markup
    analytics.margin_percent = margin_percent
    return analytics
