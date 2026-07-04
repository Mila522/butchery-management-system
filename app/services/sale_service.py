import logging
from datetime import datetime
from decimal import Decimal

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.customer import Customer
from app.models.invoice import Invoice
from app.models.invoice_item import InvoiceItem
from app.models.product import Product
from app.models.sale import Sale
from app.models.sale_item import SaleItem
from app.schemas.sale import SaleCreate

logger = logging.getLogger(__name__)


def _next_invoice_number() -> str:
    return f"INV-{datetime.utcnow():%Y%m%d%H%M%S%f}"


def list_sales(db: Session, limit: int = 50, offset: int = 0):
    return db.query(Sale).order_by(Sale.sale_date.desc()).offset(offset).limit(limit).all()


def get_sale(db: Session, sale_id: int) -> Sale:
    sale = db.query(Sale).filter(Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sale not found.")
    return sale


def create_sale(db: Session, payload: SaleCreate) -> Sale:
    if payload.customer_id:
        customer = db.query(Customer).filter(Customer.id == payload.customer_id).first()
        if not customer or not customer.active:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Active customer not found.")

    sale = Sale(
        customer_id=payload.customer_id,
        payment_method=payload.payment_method,
        recorded_by=payload.recorded_by,
        subtotal=Decimal("0"),
        total=Decimal("0"),
    )

    try:
        db.add(sale)
        db.flush()

        subtotal = Decimal("0")
        sale_items: list[SaleItem] = []
        invoice_items: list[InvoiceItem] = []

        for item in payload.items:
            product = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
            if not product:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Product {item.product_id} not found.")
            if not product.active:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Product {product.name} is inactive.")
            if product.current_stock < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Insufficient stock for {product.name}. Available: {product.current_stock}.",
                )

            line_total = item.quantity * product.selling_price
            product.current_stock -= item.quantity
            subtotal += line_total

            sale_items.append(
                SaleItem(
                    sale_id=sale.id,
                    product_id=product.id,
                    quantity=item.quantity,
                    unit_price=product.selling_price,
                    line_total=line_total,
                )
            )
            invoice_items.append(
                InvoiceItem(
                    product_id=product.id,
                    description=product.name,
                    quantity=item.quantity,
                    unit_price=product.selling_price,
                    line_total=line_total,
                )
            )

        sale.subtotal = subtotal
        sale.total = subtotal
        db.add_all(sale_items)

        invoice = Invoice(
            invoice_number=_next_invoice_number(),
            sale_id=sale.id,
            customer_id=payload.customer_id,
            subtotal=subtotal,
            total=subtotal,
        )
        db.add(invoice)
        db.flush()
        for invoice_item in invoice_items:
            invoice_item.invoice_id = invoice.id
        db.add_all(invoice_items)

        db.commit()
        db.refresh(sale)
        logger.info("Sale %s recorded. Total: %s.", sale.id, sale.total)
        return sale
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Duplicate invoice number.") from exc
    except Exception:
        db.rollback()
        logger.exception("Failed to record sale.")
        raise
