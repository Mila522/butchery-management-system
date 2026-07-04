from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.invoice import InvoiceResponse
from app.services import invoice_service

router = APIRouter(prefix="/invoices", tags=["Invoices"])


@router.get("/", response_model=list[InvoiceResponse])
def list_invoices(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    search: str | None = None,
    db: Session = Depends(get_db),
):
    return invoice_service.list_invoices(db, limit, offset, search)


@router.get("/number/{invoice_number}", response_model=InvoiceResponse)
def get_invoice_by_number(invoice_number: str, db: Session = Depends(get_db)):
    return invoice_service.get_invoice_by_number(db, invoice_number)


@router.get("/{invoice_id}", response_model=InvoiceResponse)
def get_invoice(invoice_id: int, db: Session = Depends(get_db)):
    return invoice_service.get_invoice(db, invoice_id)
