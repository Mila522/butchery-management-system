from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate


def list_customers(db: Session, limit: int = 50, offset: int = 0, search: str | None = None):
    query = db.query(Customer)
    if search:
        pattern = f"%{search}%"
        query = query.filter(
            (Customer.name.ilike(pattern)) | (Customer.phone.ilike(pattern)) | (Customer.email.ilike(pattern))
        )
    return query.order_by(Customer.name).offset(offset).limit(limit).all()


def get_customer(db: Session, customer_id: int) -> Customer:
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found.")
    return customer


def create_customer(db: Session, payload: CustomerCreate) -> Customer:
    customer = Customer(**payload.model_dump())
    try:
        db.add(customer)
        db.commit()
        db.refresh(customer)
        return customer
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Customer already exists.") from exc


def update_customer(db: Session, customer_id: int, payload: CustomerUpdate) -> Customer:
    customer = get_customer(db, customer_id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(customer, field, value)
    try:
        db.commit()
        db.refresh(customer)
        return customer
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Customer already exists.") from exc


def deactivate_customer(db: Session, customer_id: int) -> Customer:
    customer = get_customer(db, customer_id)
    customer.active = False
    db.commit()
    db.refresh(customer)
    return customer
