from datetime import datetime, timezone
from beanie import Document, Indexed, PydanticObjectId
from pydantic import Field

class Video(Document):
    project_id: Indexed(PydanticObjectId)
    version_tag: str  # e.g., V1, V2
    s3_video_url: str
    is_approved_by_manager: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "videos"
