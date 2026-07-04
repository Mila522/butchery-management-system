from fastapi import FastAPI
from sqlalchemy import text

from app.core.database import engine
from app.routers import (
    analytics,
    auth,
    categories,
    customers,
    dashboard,
    deliveries,
    inventory,
    invoices,
    products,
    sales,
)

app = FastAPI(
    title="Eyethu Butchery Management System",
    description="A custom ERP system for Eyethu Butchery",
    version="1.0.0",
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(categories.router)
app.include_router(customers.router)
app.include_router(deliveries.router)
app.include_router(sales.router)
app.include_router(invoices.router)
app.include_router(inventory.router)
app.include_router(dashboard.router)
app.include_router(analytics.router)


@app.get("/")
def home():
    return {
        "message": "Welcome to Eyethu Butchery Management System",
    }


@app.get("/health")
def health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {"status": "Connected to PostgreSQL"}

    except Exception as e:
        return {
            "status": "Database Connection Failed",
            "error": str(e),
        }
