"""Sale model for POS transactions."""

from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    receipt_number = Column(String(50), unique=True, nullable=False)
    sale_date = Column(DateTime, server_default=func.now())
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    cashier_id = Column(Integer, ForeignKey("users.id"))
    payment_method_id = Column(Integer, ForeignKey("payment_methods.id"))
    total_amount = Column(Numeric(12, 2))
    amount_paid = Column(Numeric(12, 2))
    change_given = Column(Numeric(12, 2))
    created_at = Column(DateTime, server_default=func.now())

    items = relationship("SaleItem", back_populates="sale", cascade="all, delete-orphan")
    cashier = relationship("User")
    customer = relationship("Customer", back_populates="sales")
    invoice = relationship("Invoice", back_populates="sale", uselist=False)
    payment_method_ref = relationship("PaymentMethod")

    @property
    def subtotal(self):
        return self.total_amount

    @property
    def total(self):
        return self.total_amount

    @property
    def payment_method(self):
        return self.payment_method_ref.name if self.payment_method_ref else None

    @property
    def recorded_by(self):
        return self.cashier_id


class PaymentMethod(Base):
    __tablename__ = "payment_methods"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
