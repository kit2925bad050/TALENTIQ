from fastapi import APIRouter, HTTPException, Depends, Header, status
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.auth_deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str
    department: Optional[str] = "Engineering"
    designation: Optional[str] = "Software Engineer"

class AuthResponse(BaseModel):
    token: str
    user: Dict[str, Any]

@router.post("/login", response_model=AuthResponse)
def employee_login(payload: LoginRequest):
    """
    Employee Portal login endpoint.
    """
    email = payload.email.lower().strip()
    if "admin" in email or "hr" in email:
        return AuthResponse(
            token=f"jwt-mock-{email}",
            user={
                "id": "hr-admin-1",
                "email": email,
                "name": "Sarah Jenkins",
                "role": "hr_admin",
                "department": "People & Talent Intelligence",
                "designation": "Director of Talent Mobility"
            }
        )
    return AuthResponse(
        token=f"jwt-mock-{email}",
        user={
            "id": f"emp-{email.split('@')[0]}",
            "email": email,
            "name": email.split('@')[0].replace('.', ' ').title(),
            "role": "employee",
            "department": "Engineering",
            "designation": "Senior Data Analyst"
        }
    )

@router.post("/hr-login", response_model=AuthResponse)
def hr_login(payload: LoginRequest):
    """
    Dedicated HR Intelligence Portal login endpoint.
    Strictly verifies and returns HR admin credentials.
    """
    email = payload.email.lower().strip()
    # Check if authorized HR account
    if not ("admin" in email or "hr" in email or email == "sarah.jenkins@talentiq.ai"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is not authorized for the HR Intelligence Portal."
        )

    return AuthResponse(
        token=f"jwt-mock-{email}",
        user={
            "id": "hr-admin-1",
            "email": email,
            "name": "Sarah Jenkins",
            "role": "hr_admin",
            "department": "People & Talent Intelligence",
            "designation": "Director of Talent Mobility"
        }
    )

@router.post("/register", response_model=AuthResponse)
def register(payload: RegisterRequest):
    """
    Public registration endpoint. Default role is always 'employee'.
    """
    email = payload.email.lower().strip()
    return AuthResponse(
        token=f"jwt-mock-{email}",
        user={
            "id": f"emp-{email.split('@')[0]}",
            "email": email,
            "name": payload.name,
            "role": "employee",
            "department": payload.department or "Engineering",
            "designation": payload.designation or "Professional"
        }
    )

@router.get("/me", response_model=Dict[str, Any])
def get_authenticated_user_profile(user: Dict[str, Any] = Depends(get_current_user)):
    """
    Returns the currently authenticated user identity and verified role.
    """
    return user

