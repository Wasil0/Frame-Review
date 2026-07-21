from datetime import datetime, timezone
from typing import Optional
from beanie import Document, PydanticObjectId
from pydantic import Field

class User(Document):
    id: str = Field(alias="_id")
    email: str  # Encrypted string in MongoDB
    full_name: Optional[str] = None  # Encrypted string in MongoDB
    role: str = "Owner"  # Choices: "Owner" | "Manager" | "Editor" | "Client"
    agency_id: Optional[PydanticObjectId] = None
    job_title: Optional[str] = None
    must_reset_password: bool = Field(default=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "users"
