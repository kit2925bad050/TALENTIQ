from fastapi import APIRouter
from app.services.db_service import db

router = APIRouter(prefix="/demo", tags=["Demo Management"])

@router.post("/seed")
def seed_demo():
    """Load rich demo dataset for instant hackathon evaluation"""
    return db.reset_demo_data()

@router.post("/clear")
def clear_demo():
    """Clear all data to test empty state"""
    return db.clear_all()
