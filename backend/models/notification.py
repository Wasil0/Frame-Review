from datetime import datetime, timezone
from beanie import Document, Indexed, PydanticObjectId
from pydantic import Field

class Notification(Document):
    recipient_id: Indexed(PydanticObjectId)
    title: str
    message: str
    project_id: PydanticObjectId
    is_read: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "notifications"
