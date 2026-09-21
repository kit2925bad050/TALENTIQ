from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional, Dict, Any
from app.models.schemas import InternalRole, InternalRoleCreate
from app.services.db_service import db
from app.auth_deps import require_hr_admin

router = APIRouter(prefix="/roles", tags=["Internal Roles"])

@router.get("", response_model=List[InternalRole])
def list_roles(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    search: Optional[str] = Query(None, description="Search role title or skills"),
    department: Optional[str] = Query(None, description="Filter by department")
):
    return db.get_roles(skip=skip, limit=limit, search=search, department=department)

@router.get("/{role_id}", response_model=InternalRole)
def get_role(role_id: str):
    role = db.get_role(role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Internal role not found")
    return role

@router.post("", response_model=InternalRole)
def create_role(data: InternalRoleCreate, admin_user: Dict[str, Any] = Depends(require_hr_admin)):
    return db.create_role(data)

@router.patch("/{role_id}", response_model=InternalRole)
def update_role(role_id: str, updates: Dict[str, Any], admin_user: Dict[str, Any] = Depends(require_hr_admin)):
    role = db.update_role(role_id, updates)
    if not role:
        raise HTTPException(status_code=404, detail="Internal role not found")
    return role

@router.delete("/{role_id}")
def delete_role(role_id: str, admin_user: Dict[str, Any] = Depends(require_hr_admin)):
    success = db.delete_role(role_id)
    if not success:
        raise HTTPException(status_code=404, detail="Internal role not found")
    return {"status": "success", "message": f"Role {role_id} deleted."}
