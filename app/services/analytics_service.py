from datetime import date, datetime, time, timedelta
from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.delivery import Delivery
from app.models.product import Product
from app.models.sale import Sale
from app.models.sale_item import SaleItem


def _day_bounds(day: date):
    return datetime.combine(day, time.min), datetime.combine(day, time.max)


def _sum_total(query) -> Decimal:
    return Decimal(str(query.scalar() or 0))


def dashboard(db: Session) -> dict:
    today = date.today()
    start, end = _day_bounds(today)
    month_start = today.replace(day=1)

    today_sales = _sum_total(db.query(func.coalesce(func.sum(Sale.total), 0)).filter(Sale.sale_date.between(start, end)))
    today_cost = _sum_total(
        db.query(func.coalesce(func.sum(SaleItem.quantity * Product.purchase_price), 0))
        .join(Product, Product.id == SaleItem.product_id)
        .join(Sale, Sale.id == SaleItem.sale_id)
        .filter(Sale.sale_date.between(start, end))
    )
    month_revenue = _sum_total(db.query(func.coalesce(func.sum(Sale.total), 0)).filter(Sale.sale_date >= month_start))

    most_sold = (
        db.query(Product.id, Product.name, func.coalesce(func.sum(SaleItem.quantity), 0).label("quantity_sold"))
        .join(SaleItem, SaleItem.product_id == Product.id)
        .join(Sale, Sale.id == SaleItem.sale_id)
        .group_by(Product.id, Product.name)
        .order_by(func.sum(SaleItem.quantity).desc())
        .limit(10)
        .all()
    )

    top_categories = (
        db.query(Category.id, Category.name, func.coalesce(func.sum(SaleItem.line_total), 0).label("revenue"))
        .join(Product, Product.category_id == Category.id)
        .join(SaleItem, SaleItem.product_id == Product.id)
        .group_by(Category.id, Category.name)
        .order_by(func.sum(SaleItem.line_total).desc())
        .limit(10)
        .all()
    )

    return {
        "today_sales": today_sales,
        "today_profit": today_sales - today_cost,
        "today_deliveries": db.query(Delivery).filter(Delivery.delivery_date.between(start, end)).count(),
        "low_stock_products": db.query(Product).filter(Product.current_stock <= Product.minimum_stock, Product.current_stock > 0).all(),
        "out_of_stock_products": db.query(Product).filter(Product.current_stock <= 0).all(),
        "most_sold_products": [dict(row._mapping) for row in most_sold],
        "revenue_this_month": month_revenue,
        "top_selling_categories": [dict(row._mapping) for row in top_categories],
    }


def sales_by_period(db: Session, start_date: date, end_date: date, grain: str) -> list[dict]:
    trunc = {"daily": "day", "weekly": "week", "monthly": "month"}[grain]
    rows = (
        db.query(func.date_trunc(trunc, Sale.sale_date).label("period"), func.coalesce(func.sum(Sale.total), 0).label("total"))
        .filter(Sale.sale_date >= start_date, Sale.sale_date < end_date + timedelta(days=1))
        .group_by("period")
        .order_by("period")
        .all()
    )
    return [dict(row._mapping) for row in rows]


def profit(db: Session, start_date: date, end_date: date) -> dict:
    revenue = _sum_total(
        db.query(func.coalesce(func.sum(SaleItem.line_total), 0))
        .join(Sale, Sale.id == SaleItem.sale_id)
        .filter(Sale.sale_date >= start_date, Sale.sale_date < end_date + timedelta(days=1))
    )
    cost = _sum_total(
        db.query(func.coalesce(func.sum(SaleItem.quantity * Product.purchase_price), 0))
        .join(Product, Product.id == SaleItem.product_id)
        .join(Sale, Sale.id == SaleItem.sale_id)
        .filter(Sale.sale_date >= start_date, Sale.sale_date < end_date + timedelta(days=1))
    )
    return {"revenue": revenue, "cost": cost, "profit": revenue - cost}


def inventory_valuation(db: Session) -> dict:
    cost_value = _sum_total(db.query(func.coalesce(func.sum(Product.current_stock * Product.purchase_price), 0)))
    retail_value = _sum_total(db.query(func.coalesce(func.sum(Product.current_stock * Product.selling_price), 0)))
    return {"cost_value": cost_value, "retail_value": retail_value}


def product_performance(db: Session, limit: int = 20) -> list[dict]:
    rows = (
        db.query(
            Product.id,
            Product.name,
            func.coalesce(func.sum(SaleItem.quantity), 0).label("quantity_sold"),
            func.coalesce(func.sum(SaleItem.line_total), 0).label("revenue"),
        )
        .outerjoin(SaleItem, SaleItem.product_id == Product.id)
        .group_by(Product.id, Product.name)
        .order_by(func.sum(SaleItem.line_total).desc().nullslast())
        .limit(limit)
        .all()
    )
    return [dict(row._mapping) for row in rows]
