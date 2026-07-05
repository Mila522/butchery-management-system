from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.database import engine
from app.routers import (
    analytics,
    auth,
    categories,
    damages,
    dashboard,
    deliveries,
    inventory,
    inventory_adjustments,
    products,
)

app = FastAPI(
    title="Eyethu Butchery Management System",
    description="A custom ERP system for Eyethu Butchery",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(categories.router)
app.include_router(deliveries.router)
app.include_router(damages.router)
app.include_router(inventory_adjustments.router)
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