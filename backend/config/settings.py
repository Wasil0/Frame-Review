import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # MongoDB Configuration
    MONGODB_URI: str
    MONGODB_DB_NAME: str

    # Supabase Configuration
    SUPABASE_URL: str = "https://ajwtrgzidgmkfpehyzyp.supabase.co"
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None

    # Resend Email API Key
    RESEND_API_KEY: Optional[str] = None

    # Field Encryption Key (Fernet 32-byte base64 key)
    ENCRYPTION_KEY: str = "7ytNRekFe_ajlN_1ev-ip7QOoVK1Hg2EexrkKaVWZ2Q="

    # AWS S3 / Storage Configuration
    AWS_ACCESS_KEY_ID: str = "mock-aws-access-key-id"
    AWS_SECRET_ACCESS_KEY: str = "mock-aws-secret-access-key"
    AWS_REGION: str = "us-east-1"
    AWS_S3_BUCKET_NAME: str = "framereview-videos"

    # Cloudinary Configuration
    CLOUDINARY_CLOUD_NAME: str = "mock-cloud-name"
    CLOUDINARY_API_KEY: str = "mock-cloudinary-api-key"
    CLOUDINARY_API_SECRET: str = "mock-cloudinary-api-secret"

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
