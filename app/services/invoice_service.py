from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.invoice import Invoice


def list_invoices(db: Session, limit: int = 50, offset: int = 0, search: str | None = None):
    query = db.query(Invoice)
    if search:
        query = query.filter(Invoice.invoice_number.ilike(f"%{search}%"))
    return query.order_by(Invoice.invoice_date.desc()).offset(offset).limit(limit).all()


def get_invoice(db: Session, invoice_id: int) -> Invoice:
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found.")
    return invoice


def get_invoice_by_number(db: Session, invoice_number: str) -> Invoice:
    invoice = db.query(Invoice).filter(Invoice.invoice_number == invoice_number).first()
    if not invoice:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not found.")
    return invoice
