from datetime import datetime, timezone
from typing import Optional
from beanie import Document, PydanticObjectId
from pydantic import Field

class Agency(Document):
    name: str
    owner_id: str  # Supabase user_id (_id of User document)
    subdomain: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "agencies"
