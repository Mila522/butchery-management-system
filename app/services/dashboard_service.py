from datetime import date

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.product import Product
from app.models.category import Category
from app.models.daily_analytics import DailyAnalytics
from app.models.damage import Damage
from app.models.delivery import Delivery
from app.models.inventory_adjustment import InventoryAdjustment


def get_dashboard(db: Session):
    today = date.today()
    total_products = db.query(Product).count()

    active_products = (
        db.query(Product)
        .filter(Product.active == True)
        .count()
    )

    total_stock = (
        db.query(func.coalesce(func.sum(Product.current_stock), 0))
        .scalar()
    )

    stock_value = (
        db.query(func.coalesce(func.sum(DailyAnalytics.stock_value), 0))
        .scalar()
    )

    today_totals = (
        db.query(
            func.coalesce(func.sum(DailyAnalytics.revenue), 0).label("revenue"),
            func.coalesce(func.sum(DailyAnalytics.gross_profit), 0).label("profit"),
            func.coalesce(func.sum(DailyAnalytics.damage_loss), 0).label("damage_loss"),
            func.coalesce(func.sum(DailyAnalytics.estimated_sold), 0).label("estimated_sales"),
            func.coalesce(func.sum(DailyAnalytics.stock_value), 0).label("remaining_stock_value"),
        )
        .filter(DailyAnalytics.analytics_date == today)
        .one()
    )

    low_stock_count = (
        db.query(Product)
        .filter(
            Product.active == True,
            Product.current_stock <= Product.minimum_stock,
        )
        .count()
    )

    damages_today = (
        db.query(func.coalesce(func.sum(Damage.quantity), 0))
        .filter(func.date(Damage.damage_date) == today)
        .scalar()
    )

    deliveries_today = (
        db.query(Delivery)
        .filter(func.date(Delivery.delivery_date) == today)
        .count()
    )

    adjustments_today = (
        db.query(InventoryAdjustment)
        .filter(func.date(InventoryAdjustment.adjustment_date) == today)
        .count()
    )

    products_sold_today = (
        db.query(DailyAnalytics)
        .filter(
            DailyAnalytics.analytics_date == today,
            DailyAnalytics.estimated_sold > 0,
        )
        .count()
    )

    return {
        "total_products": total_products,
        "active_products": active_products,
        "total_stock": float(total_stock),
        "stock_value": float(stock_value),
        "inventory_value": float(today_totals.remaining_stock_value or stock_value or 0),
        "low_stock": low_stock_count,
        "damages_today": float(damages_today or 0),
        "deliveries_today": deliveries_today,
        "adjustments_today": adjustments_today,
        "estimated_profit": float(today_totals.profit or 0),
        "today_revenue": float(today_totals.revenue or 0),
        "today_profit": float(today_totals.profit or 0),
        "today_damage_loss": float(today_totals.damage_loss or 0),
        "today_estimated_sales": float(today_totals.estimated_sales or 0),
        "remaining_stock_value": float(today_totals.remaining_stock_value or 0),
        "products_sold_today": products_sold_today,
    }


def get_category_stock(db: Session):

    data = (
        db.query(
            Category.name.label("category"),
            func.coalesce(func.sum(Product.current_stock), 0).label("stock"),
        )
        .join(Product)
        .group_by(Category.name)
        .order_by(Category.name)
        .all()
    )

    return [
        {
            "category": row.category,
            "stock": float(row.stock),
        }
        for row in data
    ]


def get_inventory_distribution(db: Session):

    data = (
        db.query(
            Category.name.label("name"),
            func.coalesce(func.sum(Product.current_stock), 0).label("value"),
        )
        .join(Product)
        .group_by(Category.name)
        .all()
    )

    return [
        {
            "name": row.name,
            "value": float(row.value),
        }
        for row in data
    ]

def get_stock_trend(db: Session):

    rows = (
        db.query(
            DailyAnalytics.analytics_date,
            func.coalesce(func.sum(DailyAnalytics.remaining_stock), 0)
        )
        .group_by(DailyAnalytics.analytics_date)
        .order_by(DailyAnalytics.analytics_date)
        .limit(7)
        .all()
    )

    return [
        {
            "date": row.analytics_date.strftime("%d %b"),
            "stock": float(row[1]),
        }
        for row in rows
    ]

def get_low_stock(db: Session):

    products = (
        db.query(Product)
        .filter(
            Product.active == True,
            Product.current_stock <= Product.minimum_stock
        )
        .order_by(Product.current_stock.asc())
        .limit(10)
        .all()
    )

    return [
        {
            "id": p.id,
            "name": p.name,
            "current_stock": float(p.current_stock),
            "minimum_stock": float(p.minimum_stock),
        }
        for p in products
    ]
