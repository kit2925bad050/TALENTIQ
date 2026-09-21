import logging
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Query
from app.models.schemas import (
    DocumentExtractRequest, DocumentExtractionResponse,
    VerifyProfileRequest, DocumentItem, Employee, ExtractedProfileData,
    GeneratedDocumentItem, GenerateReportRequest
)
from app.services.db_service import db
from app.services.document_service import extract_profile_from_document_text
from app.services.s3_service import get_s3_object_bytes
from app.services.report_service import generate_career_development_report

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/documents", tags=["Verified Documents & Career Reports"])

@router.post("/extract", response_model=DocumentExtractionResponse)
@router.post("/process", response_model=DocumentExtractionResponse)
async def extract_document_endpoint(
    employeeId: str = Form(...),
    documentType: str = Form("certificate"),
    s3Key: Optional[str] = Form(None),
    fileUrl: Optional[str] = Form(None),
    rawText: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    """
    Extract factual talent information from an uploaded document or raw text using Gemini OCR.
    """
    logger.info(f"[Documents] /extract requested for employeeId='{employeeId}', type='{documentType}'")
    doc_id = f"doc-{uuid.uuid4().hex[:8]}"
    file_name = file.filename if file else (s3Key.split("/")[-1] if s3Key else f"{documentType}.txt")
    key = s3Key or f"employees/{employeeId}/documents/{doc_id}/{file_name}"
    
    extracted_text = rawText or ""
    
    # 1. Read from uploaded file if provided
    if file:
        file_bytes = await file.read()
        try:
            extracted_text = file_bytes.decode('utf-8', errors='ignore')
        except Exception:
            extracted_text = f"Binary {documentType} document: {file_name}"
            
    # 2. Read from S3 if s3Key provided and no text yet
    elif s3Key and not extracted_text:
        s3_bytes = get_s3_object_bytes(s3Key)
        if s3_bytes:
            try:
                extracted_text = s3_bytes.decode('utf-8', errors='ignore')
            except Exception:
                extracted_text = f"S3 Document object: {file_name}"

    if not extracted_text:
        extracted_text = f"Verified {documentType} certification document for candidate."

    # 3. Perform Gemini extraction
    extracted_data = extract_profile_from_document_text(
        text=extracted_text,
        document_type=documentType,
        filename=file_name
    )

    # 4. Save document record in DB with EXTRACTED status
    now_str = datetime.utcnow().isoformat() + "Z"
    doc_item = DocumentItem(
        documentId=doc_id,
        ownerUid=employeeId,
        s3Key=key,
        fileName=file_name,
        fileUrl=fileUrl or f"https://talentiq-assets.s3.amazonaws.com/{key}",
        documentType=documentType,
        extractedText=extracted_text[:1000],
        extractedData=extracted_data,
        verificationStatus="EXTRACTED",
        uploadedAt=now_str
    )
    db.save_document(doc_item)

    return DocumentExtractionResponse(
        documentId=doc_id,
        ownerUid=employeeId,
        fileName=file_name,
        s3Key=key,
        fileUrl=doc_item.fileUrl,
        documentType=documentType,
        verificationStatus="EXTRACTED",
        extractedData=extracted_data
    )

@router.post("/confirm", response_model=Employee)
def confirm_extracted_profile(payload: VerifyProfileRequest):
    """
    User confirms and saves reviewed extracted profile data to their verified employee profile in Firestore.
    """
    logger.info(f"[Documents] /confirm requested for employeeId='{payload.employeeId}' with {len(payload.verifiedData.skills)} skills")
    
    # 1. Update employee profile status to VERIFIED and persist confirmed data
    emp = db.verify_and_update_employee_profile(
        uid=payload.employeeId,
        verified_data=payload.verifiedData
    )

    # 2. Update document verification status if documentId provided
    if payload.documentId:
        docs = db.get_employee_documents(payload.employeeId)
        for doc in docs:
            if doc.documentId == payload.documentId:
                doc.verificationStatus = "VERIFIED"
                db.save_document(doc)
                break

    return emp

@router.post("/{document_id}/confirm", response_model=Employee)
def confirm_document_by_id(document_id: str, payload: VerifyProfileRequest):
    """
    Confirm document verification by specific documentId route.
    """
    payload.documentId = document_id
    return confirm_extracted_profile(payload)

@router.get("/employee/{employee_id}", response_model=List[DocumentItem])
def get_employee_documents_endpoint(employee_id: str):
    """
    List all uploaded and verified documents for an employee.
    """
    return db.get_employee_documents(employee_id)

@router.get("/{document_id}", response_model=DocumentItem)
def get_document_by_id(document_id: str):
    """
    Get a single document record by document ID.
    """
    for uid, docs in db.documents.items():
        for d in docs:
            if d.documentId == document_id:
                return d
    raise HTTPException(status_code=404, detail="Document not found")

@router.get("", response_model=List[DocumentItem])
def list_all_documents(employee_id: Optional[str] = Query(None)):
    """
    List documents, optionally filtered by employeeId.
    """
    if employee_id:
        return db.get_employee_documents(employee_id)
    all_docs = []
    for docs in db.documents.values():
        all_docs.extend(docs)
    return all_docs

# ==========================================================
# Report Generation Endpoints
# ==========================================================
@router.post("/generate-career-report", response_model=GeneratedDocumentItem)
def generate_career_report_endpoint(payload: GenerateReportRequest):
    logger.info(f"[Documents] /generate-career-report for emp='{payload.employeeId}'")
    emp = db.get_employee(payload.employeeId)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    role = db.get_role(payload.targetRoleId) if payload.targetRoleId else None
    return generate_career_development_report(emp, role, report_type="career_development")

@router.post("/generate-roadmap", response_model=GeneratedDocumentItem)
def generate_roadmap_report_endpoint(payload: GenerateReportRequest):
    logger.info(f"[Documents] /generate-roadmap report for emp='{payload.employeeId}'")
    emp = db.get_employee(payload.employeeId)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    role = db.get_role(payload.targetRoleId) if payload.targetRoleId else None
    return generate_career_development_report(emp, role, report_type="career_roadmap")

@router.post("/generate-learning-report", response_model=GeneratedDocumentItem)
def generate_learning_report_endpoint(payload: GenerateReportRequest):
    logger.info(f"[Documents] /generate-learning-report for emp='{payload.employeeId}'")
    emp = db.get_employee(payload.employeeId)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    role = db.get_role(payload.targetRoleId) if payload.targetRoleId else None
    return generate_career_development_report(emp, role, report_type="learning_plan")

@router.post("/generate-skill-report", response_model=GeneratedDocumentItem)
def generate_skill_report_endpoint(payload: GenerateReportRequest):
    logger.info(f"[Documents] /generate-skill-report for emp='{payload.employeeId}'")
    emp = db.get_employee(payload.employeeId)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    role = db.get_role(payload.targetRoleId) if payload.targetRoleId else None
    return generate_career_development_report(emp, role, report_type="skill_audit")

@router.get("/generated/{employee_id}", response_model=List[GeneratedDocumentItem])
def get_employee_generated_documents_endpoint(employee_id: str):
    """
    List all generated reports and documents for an employee.
    """
    return db.get_employee_generated_documents(employee_id)

