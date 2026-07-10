from datetime import date, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.daily_stock import DailyStock
from app.models.product import Product
from app.models.product_daily_status import ProductDailyStatus
from decimal import Decimal
from datetime import date

from app.models.daily_analytics import DailyAnalytics


def update_daily_stock(
    db,
    product,
    received=0,
    damaged=0,
):
    today = date.today()

    snapshot = (
        db.query(DailyStock)
        .filter(
            
            
            DailyStock.product_id == product.id,
            DailyStock.stock_date == today,
        )
        .first()
    )

    if snapshot:
        snapshot.received_today += received
        snapshot.damaged_today += damaged

        snapshot.closing_stock = product.current_stock

    else:

        snapshot = DailyStock(
            product_id=product.id,
            stock_date=today,
            opening_stock=product.current_stock,
            received_today=received,
            damaged_today=damaged,
            closing_stock=product.current_stock,
            notes="Auto-generated",
        )

        db.add(snapshot)

def update_daily_analytics(
    db,
    product,
):
    today = date.today()

    stock = (
        db.query(DailyStock)
        .filter(
            DailyStock.product_id == product.id,
            DailyStock.stock_date == today,
        )
        .first()
    )

    if not stock:
        return

    analytics = (
        db.query(DailyAnalytics)
        .filter(
            DailyAnalytics.product_id == product.id,
            DailyAnalytics.analytics_date == today,
        )
        .first()
    )

    estimated_sold = (
        stock.opening_stock
        + stock.received_today
        - stock.closing_stock
        - stock.damaged_today
    )

    if estimated_sold < 0:
        estimated_sold = Decimal("0")

    revenue = estimated_sold * product.selling_price

    cost = estimated_sold * product.purchase_price

    gross_profit = revenue - cost

    damage_loss = (
        stock.damaged_today
        * product.purchase_price
    )

    stock_value = (
        stock.closing_stock
        * product.purchase_price
    )

    if analytics:

        analytics.estimated_sold = estimated_sold
        analytics.actual_sold = Decimal("0")
        analytics.remaining_stock = stock.closing_stock
        analytics.revenue = revenue
        analytics.cost = cost
        analytics.gross_profit = gross_profit
        analytics.damage_loss = damage_loss
        analytics.stock_value = stock_value

    else:

        analytics = DailyAnalytics(

            analytics_date=today,

            product_id=product.id,

            estimated_sold=estimated_sold,

            actual_sold=Decimal("0"),

            remaining_stock=stock.closing_stock,

            revenue=revenue,

            cost=cost,

            gross_profit=gross_profit,

            damage_loss=damage_loss,

            stock_value=stock_value,

        )

        db.add(analytics)


def update_product_status(
    db: Session,
    product: Product,
    *,
    delivery=False,
    damage=False,
    adjustment=False,
    closing=False,
):
    today = date.today()

    status = (
        db.query(ProductDailyStatus)
        .filter(
            ProductDailyStatus.product_id == product.id,
            ProductDailyStatus.record_date == today,
        )
        .first()
    )

    if not status:

        status = ProductDailyStatus(
            product_id=product.id,
            record_date=today,
            delivery_recorded=False,
            damage_recorded=False,
            adjustment_recorded=False,
            closing_stock_recorded=False,
        )

        db.add(status)

    if delivery:
        status.delivery_recorded = True

    if damage:
        status.damage_recorded = True

    if adjustment:
        status.adjustment_recorded = True

    if closing:
        status.closing_stock_recorded = True


def _analytics_rows(db: Session, start_date: date, end_date: date):
    return (
        db.query(DailyAnalytics, Product)
        .join(Product, Product.id == DailyAnalytics.product_id)
        .filter(
            DailyAnalytics.analytics_date >= start_date,
            DailyAnalytics.analytics_date <= end_date,
        )
        .order_by(DailyAnalytics.analytics_date.desc(), Product.name.asc())
        .all()
    )


def get_report(db: Session, start_date: date, end_date: date) -> dict:
    rows = _analytics_rows(db, start_date, end_date)
    items = []
    totals = {
        "revenue": Decimal("0"),
        "gross_profit": Decimal("0"),
        "damage_loss": Decimal("0"),
        "estimated_sold": Decimal("0"),
        "stock_value": Decimal("0"),
    }

    for analytics, product in rows:
        totals["revenue"] += Decimal(str(analytics.revenue or 0))
        totals["gross_profit"] += Decimal(str(analytics.gross_profit or 0))
        totals["damage_loss"] += Decimal(str(analytics.damage_loss or 0))
        totals["estimated_sold"] += Decimal(str(analytics.estimated_sold or 0))
        totals["stock_value"] += Decimal(str(analytics.stock_value or 0))

        items.append({
            "date": analytics.analytics_date,
            "product_id": product.id,
            "product_name": product.name,
            "estimated_sold": float(analytics.estimated_sold or 0),
            "remaining_stock": float(analytics.remaining_stock or 0),
            "revenue": float(analytics.revenue or 0),
            "cost": float(analytics.cost or 0),
            "gross_profit": float(analytics.gross_profit or 0),
            "damage_loss": float(analytics.damage_loss or 0),
            "stock_value": float(analytics.stock_value or 0),
            "markup": float(getattr(analytics, "markup", 0) or 0),
            "margin_percent": float(getattr(analytics, "margin_percent", 0) or 0),
        })

    return {
        "start_date": start_date,
        "end_date": end_date,
        "totals": {key: float(value) for key, value in totals.items()},
        "items": items,
    }


def get_daily_report(db: Session, report_date: date) -> dict:
    return get_report(db, report_date, report_date)


def get_weekly_report(db: Session, report_date: date) -> dict:
    start_date = report_date - timedelta(days=report_date.weekday())
    return get_report(db, start_date, start_date + timedelta(days=6))


def get_monthly_report(db: Session, report_date: date) -> dict:
    start_date = report_date.replace(day=1)
    if start_date.month == 12:
        next_month = start_date.replace(year=start_date.year + 1, month=1)
    else:
        next_month = start_date.replace(month=start_date.month + 1)
    return get_report(db, start_date, next_month - timedelta(days=1))


def get_profit_report(db: Session, start_date: date, end_date: date) -> dict:
    report = get_report(db, start_date, end_date)
    report["items"] = sorted(
        report["items"],
        key=lambda item: item["gross_profit"],
        reverse=True,
    )
    return report


def get_damage_report(db: Session, start_date: date, end_date: date) -> dict:
    report = get_report(db, start_date, end_date)
    report["items"] = [
        item for item in report["items"]
        if item["damage_loss"] > 0
    ]
    return report


def get_stock_valuation(db: Session, report_date: date | None = None) -> dict:
    target_date = report_date or date.today()
    latest_dates = (
        db.query(
            DailyAnalytics.product_id,
            func.max(DailyAnalytics.analytics_date).label("latest_date"),
        )
        .filter(DailyAnalytics.analytics_date <= target_date)
        .group_by(DailyAnalytics.product_id)
        .subquery()
    )

    rows = (
        db.query(DailyAnalytics, Product)
        .join(Product, Product.id == DailyAnalytics.product_id)
        .join(
            latest_dates,
            (latest_dates.c.product_id == DailyAnalytics.product_id)
            & (latest_dates.c.latest_date == DailyAnalytics.analytics_date),
        )
        .order_by(Product.name.asc())
        .all()
    )

    total_value = Decimal("0")
    items = []
    for analytics, product in rows:
        value = Decimal(str(analytics.stock_value or 0))
        total_value += value
        items.append({
            "product_id": product.id,
            "product_name": product.name,
            "remaining_stock": float(analytics.remaining_stock or 0),
            "stock_value": float(value),
        })

    return {
        "report_date": target_date,
        "total_stock_value": float(total_value),
        "items": items,
    }


def get_business_overview(db: Session, start_date: date, end_date: date) -> dict:
    report = get_report(db, start_date, end_date)
    totals = report["totals"]
    revenue = Decimal(str(totals["revenue"]))
    profit = Decimal(str(totals["gross_profit"]))
    totals["overall_margin_percent"] = float((profit / revenue) * Decimal("100")) if revenue else 0
    return report
