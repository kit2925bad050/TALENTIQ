from fastapi import APIRouter, Depends
from typing import Dict, Any, List
from app.services.db_service import db
from app.auth_deps import require_hr_admin

router = APIRouter(prefix="/analytics", tags=["Analytics & HR Intelligence"])

@router.get("/workforce", response_model=Dict[str, Any])
def get_workforce_intelligence(admin_user: Dict[str, Any] = Depends(require_hr_admin)):
    """
    Workforce Analytics & Talent Intelligence endpoint. Restricted strictly to HR Admins.
    """
    return db.get_workforce_analytics()

@router.get("/notifications", response_model=List[Dict[str, Any]])
def get_notifications():
    return db.get_notifications()

@router.post("/notifications/read")
def mark_read():
    db.mark_notifications_read()
    return {"status": "success"}

