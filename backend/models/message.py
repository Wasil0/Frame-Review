from datetime import datetime, timezone
from typing import Optional, Literal
from beanie import Document, Indexed, PydanticObjectId
from pydantic import Field

class Message(Document):
    video_id: Indexed(PydanticObjectId)
    sender_id: PydanticObjectId
    chat_type: Literal["client_review", "internal"]
    text: str
    video_timestamp: Optional[float] = None
    parent_msg_id: Optional[PydanticObjectId] = None
    is_resolved: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "messages"
