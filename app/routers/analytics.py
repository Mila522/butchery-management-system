from fastapi import APIRouter

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/")
def analytics_placeholder():
    return {
        "message": "Analytics module temporarily disabled while being migrated."
    }