import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.models.schemas import CertificateItem, CertificateGenerateRequest
from app.services.db_service import db

router = APIRouter(prefix="/certificates", tags=["Certificates & Skill Mastery"])

@router.post("/generate", response_model=CertificateItem)
def generate_certificate(request: CertificateGenerateRequest):
    """
    Generate and persist an official TALENTIQ AI Skill Mastery Certificate
    upon course completion, assessment passing, or mock interview evaluation.
    """
    emp = db.get_employee(request.employeeId)
    recipient_name = request.recipientName or (emp.name if emp else "TalentIQ Professional")
    now = datetime.utcnow()
    issued_date_str = now.strftime("%d %B %Y")
    
    unique_suffix = uuid.uuid4().hex[:6].upper()
    cert_id = f"TIQ-SM-{now.year}-{unique_suffix}"
    
    level = request.skillLevel or ("Master" if (request.achievementScore or 90) >= 95 else "Advanced" if (request.achievementScore or 90) >= 80 else "Intermediate")
    
    cert = CertificateItem(
        id=cert_id,
        employeeId=request.employeeId,
        recipientName=recipient_name,
        skillName=request.skillName,
        courseTitle=request.courseTitle or f"{request.skillName} Mastery & Application",
        achievementScore=request.achievementScore or 92,
        skillLevel=level,
        issuedOn=issued_date_str,
        certificateType=request.certificateType or "Skill Mastery",
        verifyUrl=f"https://tiq.ai/verify/{cert_id}",
        signatory1Name="Sridharan V.R",
        signatory1Title="Founder, TALENTIQ AI",
        signatory2Name="Authorized Signatory",
        signatory2Title="TALENTIQ AI",
        description="The recipient has successfully completed the assigned learning missions, practical exercises, assessments and AI-guided evaluation conducted through the TALENTIQ AI Skill Mentor platform.",
        createdAt=now.isoformat() + "Z"
    )
    
    db.save_certificate(cert)
    
    # Also update employee's skills list to verified mastery if employee exists
    if emp:
        db.update_employee_skill_mastery(
            emp_id=emp.id,
            skill_name=request.skillName,
            new_proficiency=request.achievementScore or 92,
            is_mastered=True
        )
        
    return cert

@router.get("/employee/{employee_id}", response_model=List[CertificateItem])
def get_employee_certificates(employee_id: str):
    """Get all earned certificates for an employee."""
    return db.get_employee_certificates(employee_id)

@router.get("/{certificate_id}", response_model=CertificateItem)
def get_certificate(certificate_id: str):
    """Get certificate details by certificate ID."""
    cert = db.get_certificate_by_id(certificate_id)
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found or expired")
    return cert

@router.get("/verify/{certificate_id}", response_model=CertificateItem)
def verify_certificate(certificate_id: str):
    """Verify certificate authenticity."""
    cert = db.get_certificate_by_id(certificate_id)
    if not cert:
        raise HTTPException(status_code=404, detail="Invalid certificate ID")
    return cert
