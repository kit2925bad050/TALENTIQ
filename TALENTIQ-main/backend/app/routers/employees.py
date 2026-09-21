from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
from app.models.schemas import Employee, EmployeeCreate, RoleMatchScore
from app.services.db_service import db
from app.services.matcher_service import match_employee_with_roles

router = APIRouter(prefix="/employees", tags=["Employees"])

@router.get("", response_model=List[Employee])
def list_employees(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    search_skill: Optional[str] = Query(None, description="Search by skill name or keyword"),
    department: Optional[str] = Query(None, description="Filter by department")
):
    return db.get_employees(skip=skip, limit=limit, search_skill=search_skill, department=department)

@router.get("/{employee_id}", response_model=Employee)
def get_employee(employee_id: str):
    emp = db.get_employee(employee_id)
    if not emp:
        # Gracefully return a valid initial unverified profile for new users (e.g., fresh Firebase login)
        return Employee(
            id=employee_id,
            name="Employee",
            email=f"{employee_id}@talentiq.local",
            department="Engineering",
            designation="Professional",
            experienceYears=0.0,
            summary="New user profile. Please upload verification documents to discover your skills.",
            location="Remote",
            education="",
            profileStatus="INCOMPLETE",
            skills=[],
            hiddenSkills=[],
            certifications=[],
            projects=[],
            learningActivities=[],
            targetRoleId=None
        )
    return emp

@router.post("", response_model=Employee)
def create_employee(data: EmployeeCreate):
    return db.create_employee(data)

@router.patch("/{employee_id}", response_model=Employee)
def update_employee(employee_id: str, updates: Dict[str, Any]):
    emp = db.update_employee(employee_id, updates)
    if not emp:
        # If employee does not exist yet, create initialized record with updates
        base_emp = EmployeeCreate(
            name=updates.get("name", "Employee"),
            email=updates.get("email", f"{employee_id}@talentiq.local"),
            department=updates.get("department", "Engineering"),
            designation=updates.get("designation", "Professional"),
            experienceYears=updates.get("experienceYears", 0.0),
            summary=updates.get("summary", ""),
            location=updates.get("location", "Remote"),
            education=updates.get("education", ""),
            skills=updates.get("skills", [])
        )
        created = db.create_employee(base_emp)
        created.id = employee_id
        db.employees[employee_id] = created
        return created
    return emp

@router.get("/{employee_id}/matches", response_model=List[RoleMatchScore])
def get_employee_role_matches(employee_id: str):
    emp = db.get_employee(employee_id)
    roles = db.get_roles()
    if not emp:
        # Return empty matches for uninitialized user
        return []
    return match_employee_with_roles(emp, roles)

