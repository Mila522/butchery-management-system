from datetime import date

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.product import Product

from app.schemas.daily_stock import ClosingStockRequest
from app.services import business_day_service


def get_today_stock(db: Session):

    today = date.today()
    business_day_service.ensure_business_day_open(db, today)
    stocks = business_day_service.prepare_daily_stock(db, today)
    db.commit()

    products = {
        product.id: product
        for product in db.query(Product).filter(Product.active == True).all()
    }
    results = []

    for stock in stocks:
        product = products.get(stock.product_id)
        if not product:
            continue

        results.append({

            "id": stock.id,

            "product_id": stock.product_id,

            "product_name": product.name,

            "stock_date": stock.stock_date,

            "opening_stock": stock.opening_stock,

            "received_today": stock.received_today,

            "damaged_today": stock.damaged_today,

            "closing_stock": stock.closing_stock,

            "notes": stock.notes,

            "created_at": stock.created_at,

        })

    return results


def save_closing_stock(
    db: Session,
    payload: ClosingStockRequest,
):

    return business_day_service.close_business_day(
        db,
        payload,
        date.today(),
    )
