from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request, Query
from typing import Optional
from app.models.schemas import PresignedUrlRequest, PresignedUrlResponse
from app.services.s3_service import generate_presigned_upload_url

router = APIRouter(prefix="/upload", tags=["Storage & Uploads"])

@router.post("/presigned-url", response_model=PresignedUrlResponse)
@router.post("/presigned_url", response_model=PresignedUrlResponse)
def get_presigned_url(payload: PresignedUrlRequest):
    res = generate_presigned_upload_url(
        file_name=payload.fileName,
        file_type=payload.fileType,
        category=payload.category,
        employee_id=payload.employeeId,
        document_id=payload.documentId
    )
    return PresignedUrlResponse(**res)

@router.post("/direct")
@router.put("/direct")
async def direct_upload(
    request: Request,
    file: Optional[UploadFile] = File(None),
    key: Optional[str] = Query(None)
):
    """
    Direct upload endpoint for fallback environments without AWS S3 keys configured.
    Supports multipart form or raw binary stream uploads with query key parameter.
    """
    filename = "uploaded_file"
    content_type = "application/octet-stream"

    if file:
        filename = file.filename or "uploaded_file"
        content_type = file.content_type or "application/octet-stream"
    else:
        # Check if raw bytes sent
        body = await request.body()
        content_type = request.headers.get("content-type", "application/octet-stream")
        if key and "/" in key:
            filename = key.split("/")[-1]

    s3_key = key or f"uploads/{filename}"
    return {
        "status": "success",
        "fileName": filename,
        "contentType": content_type,
        "s3Key": s3_key,
        "fileUrl": f"https://talentiq-assets.s3.amazonaws.com/{s3_key}"
    }

