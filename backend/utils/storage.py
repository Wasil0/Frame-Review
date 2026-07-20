import time
import boto3
from botocore.config import Config
import cloudinary.utils
from backend.config.settings import settings

def generate_s3_presigned_upload_url(object_name: str, expiration: int = 3600) -> str:
    """
    Generates a presigned URL to upload a file directly to AWS S3.
    """
    s3_client = boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION,
        config=Config(signature_version="s3v4")
    )
    
    # Generate the presigned URL for a PUT request
    url = s3_client.generate_presigned_url(
        ClientMethod="put_object",
        Params={
            "Bucket": settings.AWS_S3_BUCKET_NAME,
            "Key": object_name
        },
        ExpiresIn=expiration
    )
    return url

def generate_cloudinary_presigned_upload_params(public_id: str) -> dict:
    """
    Generates credentials and signature for direct client-side uploading to Cloudinary.
    """
    timestamp = int(time.time())
    params = {
        "timestamp": timestamp,
        "public_id": public_id
    }
    
    # Sign the parameters using Cloudinary's utility
    signature = cloudinary.utils.api_sign_request(
        params_to_sign=params,
        api_secret=settings.CLOUDINARY_API_SECRET
    )
    
    upload_url = f"https://api.cloudinary.com/v1_1/{settings.CLOUDINARY_CLOUD_NAME}/video/upload"
    
    return {
        "upload_url": upload_url,
        "public_id": public_id,
        "timestamp": timestamp,
        "signature": signature,
        "api_key": settings.CLOUDINARY_API_KEY
    }
