from fastapi import APIRouter, Depends, HTTPException, status
from backend.utils.auth import get_user_context, UserContext
from backend.utils.storage import (
    generate_s3_presigned_upload_url,
    generate_cloudinary_presigned_upload_params,
)
from pydantic import BaseModel

router = APIRouter(prefix="/storage", tags=["Storage"])

class S3PresignRequest(BaseModel):
    object_name: str
    expiration: int = 3600

class CloudinaryPresignRequest(BaseModel):
    public_id: str

@router.post("/presigned-url/s3")
def get_s3_presigned_url(payload: S3PresignRequest, ctx: UserContext = Depends(get_user_context)):
    """
    Generates an AWS S3 presigned URL for direct upload of a file.
    """
    try:
        url = generate_s3_presigned_upload_url(payload.object_name, payload.expiration)
        return {"upload_url": url}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate S3 presigned URL: {str(e)}"
        )

@router.post("/presigned-url/cloudinary")
def get_cloudinary_presigned_params(payload: CloudinaryPresignRequest, ctx: UserContext = Depends(get_user_context)):
    """
    Generates Cloudinary upload signature and parameters for direct client upload.
    """
    try:
        params = generate_cloudinary_presigned_upload_params(payload.public_id)
        return params
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate Cloudinary upload signature: {str(e)}"
        )
