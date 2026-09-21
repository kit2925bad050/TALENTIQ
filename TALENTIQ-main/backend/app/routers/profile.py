from fastapi import APIRouter, HTTPException, status, Query
from typing import Optional
import logging
from app.models.schemas import (
    AvatarPresignedUrlRequest, AvatarConfirmRequest, AvatarResponse
)
from app.services.s3_service import generate_avatar_upload_url, delete_s3_object
from app.services.db_service import db

router = APIRouter(prefix="/profile", tags=["Profile & Avatar"])
logger = logging.getLogger(__name__)

ALLOWED_IMAGE_TYPES = {
    "image/jpeg", "image/png", "image/webp", "image/jpg"
}
MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB

@router.post("/avatar/presigned-url")
@router.post("/avatar/presigned_url")
def get_avatar_presigned_url(request: AvatarPresignedUrlRequest):
    """
    Generate an AWS S3 presigned PUT URL for uploading a profile avatar image.
    Enforces format (JPEG, PNG, WEBP) and size (<= 5MB) limits.
    """
    if request.fileType.lower() not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image type. Allowed formats: JPG, JPEG, PNG, WEBP."
        )
    
    if request.fileSize and request.fileSize > MAX_AVATAR_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds the 5 MB maximum limit."
        )

    res = generate_avatar_upload_url(
        employee_id=request.employeeId,
        file_name=request.fileName,
        file_type=request.fileType
    )
    return res

@router.post("/avatar/confirm", response_model=AvatarResponse)
@router.post("/avatar/confirm-upload", response_model=AvatarResponse)
def confirm_avatar_upload(request: AvatarConfirmRequest):

    """
    Confirm and persist the uploaded profile photo in the employee profile.
    """
    if not request.employeeId:
        raise HTTPException(status_code=400, detail="employeeId is required.")
        
    emp = db.update_employee_avatar(
        emp_id=request.employeeId,
        photo_url=request.photoUrl,
        photo_key=request.s3Key
    )
    
    return AvatarResponse(
        employeeId=emp.id,
        profilePhotoUrl=emp.profilePhotoUrl,
        profilePhotoKey=emp.profilePhotoKey,
        message="Profile photo updated successfully."
    )

@router.delete("/avatar/{employee_id}", response_model=AvatarResponse)
def delete_avatar_by_path(employee_id: str):
    """
    Delete the employee's profile photo from AWS S3 and remove it from their profile.
    """
    emp = db.get_employee(employee_id)
    if emp and emp.profilePhotoKey:
        delete_s3_object(emp.profilePhotoKey)
        
    db.remove_employee_avatar(employee_id)
    return AvatarResponse(
        employeeId=employee_id,
        profilePhotoUrl=None,
        profilePhotoKey=None,
        message="Profile photo removed successfully."
    )

@router.delete("/avatar", response_model=AvatarResponse)
def delete_avatar_by_query(employee_id: str = Query(..., description="Employee ID or UID")):
    """
    Delete profile photo via query parameter.
    """
    return delete_avatar_by_path(employee_id)
