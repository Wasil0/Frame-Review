from datetime import datetime, timezone
from typing import Optional
from beanie import Document, Indexed, PydanticObjectId
from pydantic import Field

class Notification(Document):
    recipient_id: Indexed(str)  # Supabase user_id string
    agency_id: Indexed(PydanticObjectId)
    type: str
    message: str
    link: Optional[str] = None
    read: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "notifications"
