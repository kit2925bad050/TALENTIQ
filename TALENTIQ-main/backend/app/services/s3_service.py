import logging
import uuid
from typing import Dict, Any, Optional
from app.config import settings

logger = logging.getLogger(__name__)

s3_client = None
if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY and settings.AWS_S3_BUCKET:
    try:
        import boto3
        from botocore.client import Config
        s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION,
            config=Config(signature_version='s3v4'),
            endpoint_url=f"https://s3.{settings.AWS_REGION}.amazonaws.com"
        )
        logger.info(f"Connected to AWS S3 bucket: {settings.AWS_S3_BUCKET} ({settings.AWS_REGION})")
    except Exception as e:
        logger.warning(f"Failed to initialize S3 client: {e}")

def generate_presigned_upload_url(
    file_name: str,
    file_type: str,
    category: str = "certificate",
    employee_id: Optional[str] = None,
    document_id: Optional[str] = None
) -> Dict[str, str]:
    """
    Generate presigned upload URL for AWS S3.
    Constructs path: employees/{uid}/documents/{documentId}/{filename}
    """
    import re
    clean_name = re.sub(r'[^a-zA-Z0-9._-]', '_', file_name)
    doc_id = document_id or f"doc-{uuid.uuid4().hex[:8]}"
    
    if employee_id:
        unique_key = f"employees/{employee_id}/documents/{doc_id}/{clean_name}"
    else:
        ext = file_name.split(".")[-1] if "." in file_name else "pdf"
        unique_key = f"uploads/{category}/{uuid.uuid4().hex[:12]}.{ext}"
    
    if s3_client and settings.AWS_S3_BUCKET:
        try:
            presigned_url = s3_client.generate_presigned_url(
                'put_object',
                Params={
                    'Bucket': settings.AWS_S3_BUCKET,
                    'Key': unique_key,
                    'ContentType': file_type
                },
                ExpiresIn=3600
            )
            file_url = f"https://{settings.AWS_S3_BUCKET}.s3.{settings.AWS_REGION}.amazonaws.com/{unique_key}"
            return {
                "uploadUrl": presigned_url,
                "fileUrl": file_url,
                "s3Key": unique_key,
                "documentId": doc_id
            }
        except Exception as e:
            logger.error(f"Failed generating S3 presigned URL: {e}")

    # Seamless development/local direct path
    return {
        "uploadUrl": f"/api/upload/direct?key={unique_key}",
        "fileUrl": f"https://talentiq-assets.s3.amazonaws.com/{unique_key}",
        "s3Key": unique_key,
        "documentId": doc_id
    }

def get_s3_object_bytes(s3_key: str) -> Optional[bytes]:
    """Download object bytes directly from S3 bucket."""
    if not s3_client or not settings.AWS_S3_BUCKET:
        return None
    try:
        response = s3_client.get_object(Bucket=settings.AWS_S3_BUCKET, Key=s3_key)
        return response['Body'].read()
    except Exception as e:
        logger.error(f"Failed fetching S3 object '{s3_key}': {e}")
        return None

def upload_file_to_s3(file_bytes: bytes, key: str, content_type: str = "text/html") -> bool:
    """Upload byte content directly to AWS S3 bucket."""
    if not s3_client or not settings.AWS_S3_BUCKET:
        return False
    try:
        s3_client.put_object(
            Bucket=settings.AWS_S3_BUCKET,
            Key=key,
            Body=file_bytes,
            ContentType=content_type
        )
        return True
    except Exception as e:
        logger.error(f"Failed direct S3 put '{key}': {e}")
        return False

def get_s3_file_url(s3_key: str) -> str:
    """Get public or direct URL for an S3 object."""
    if settings.AWS_S3_BUCKET and settings.AWS_REGION:
        return f"https://{settings.AWS_S3_BUCKET}.s3.{settings.AWS_REGION}.amazonaws.com/{s3_key}"
    return f"https://talentiq-assets.s3.amazonaws.com/{s3_key}"

def generate_avatar_upload_url(
    employee_id: str,
    file_name: str,
    file_type: str
) -> Dict[str, str]:
    """
    Generate presigned upload URL for employee profile avatar.
    Path: employees/{uid}/profile/avatar/{unique_filename}
    """
    import re
    clean_name = re.sub(r'[^a-zA-Z0-9._-]', '_', file_name)
    unique_suffix = uuid.uuid4().hex[:8]
    unique_key = f"employees/{employee_id}/profile/avatar/{unique_suffix}_{clean_name}"
    
    if s3_client and settings.AWS_S3_BUCKET:
        try:
            presigned_url = s3_client.generate_presigned_url(
                'put_object',
                Params={
                    'Bucket': settings.AWS_S3_BUCKET,
                    'Key': unique_key,
                    'ContentType': file_type
                },
                ExpiresIn=3600
            )
            file_url = f"https://{settings.AWS_S3_BUCKET}.s3.{settings.AWS_REGION}.amazonaws.com/{unique_key}"
            return {
                "uploadUrl": presigned_url,
                "fileUrl": file_url,
                "s3Key": unique_key
            }
        except Exception as e:
            logger.error(f"Failed generating S3 avatar presigned URL: {e}")

    return {
        "uploadUrl": f"/api/upload/direct?key={unique_key}",
        "fileUrl": f"https://talentiq-assets.s3.amazonaws.com/{unique_key}",
        "s3Key": unique_key
    }

def delete_s3_object(s3_key: str) -> bool:
    """Delete an object from AWS S3."""
    if not s3_client or not settings.AWS_S3_BUCKET:
        return True
    try:
        s3_client.delete_object(
            Bucket=settings.AWS_S3_BUCKET,
            Key=s3_key
        )
        logger.info(f"Successfully deleted S3 object: {s3_key}")
        return True
    except Exception as e:
        logger.error(f"Failed to delete S3 object '{s3_key}': {e}")
        return False


