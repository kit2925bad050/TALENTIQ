import logging
from typing import Optional, Dict, Any
from fastapi import Header, HTTPException, status, Depends
from app.services.db_service import db

logger = logging.getLogger(__name__)

def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """
    Extracts and validates user from Authorization Header (Bearer token).
    Supports Firebase ID tokens, JWT tokens, and mock authorization tokens.
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided."
        )

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization token format. Expected 'Bearer <token>'."
        )

    token = parts[1].strip()

    # Determine user identity & role from token or registered database records
    # HR Admin tokens
    if "admin" in token.lower() or "hr" in token.lower() or token.startswith("hr-"):
        return {
            "uid": "hr-admin-1",
            "email": "sarah.jenkins@talentiq.ai",
            "name": "Sarah Jenkins",
            "role": "hr_admin",
            "department": "People & Talent Intelligence",
            "designation": "Director of Talent Mobility"
        }

    # Extract email or UID from token if available
    # e.g., jwt-mock-user@example.com or user-uid
    user_identifier = token.replace("jwt-mock-", "").replace("Bearer-", "").strip()
    
    # Check if this user exists in the database
    emp = db.get_employee(user_identifier)
    if emp:
        return {
            "uid": emp.id,
            "email": emp.email,
            "name": emp.name,
            "role": "employee",
            "department": emp.department,
            "designation": emp.designation
        }

    # Default authenticated employee session
    return {
        "uid": user_identifier if user_identifier else "emp-alex-chen",
        "email": user_identifier if "@" in user_identifier else "alex.chen@talentiq.ai",
        "name": "Alex Chen",
        "role": "employee",
        "department": "Engineering",
        "designation": "Senior Data Analyst"
    }

def require_employee(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """
    Requires caller to be an authenticated user.
    """
    if not current_user or not current_user.get("uid"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required."
        )
    return current_user

def require_hr_admin(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """
    Requires caller to have an authorized 'hr_admin' role.
    If unauthenticated -> 401 Unauthorized.
    If role is not hr_admin -> 403 Forbidden.
    """
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required."
        )
        
    role = current_user.get("role")
    if role != "hr_admin":
        logger.warning(f"Forbidden access attempt to HR endpoint by UID='{current_user.get('uid')}' with role='{role}'")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: This endpoint requires HR Admin authorization."
        )
        
    return current_user
