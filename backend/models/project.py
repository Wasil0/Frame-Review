from datetime import datetime, timezone
from typing import List, Literal, Optional
from beanie import Document, Indexed, PydanticObjectId
from pydantic import Field

class Project(Document):
    agency_id: Indexed(PydanticObjectId)
    title: str
    client_org: str
    client_email: str  # Encrypted string in MongoDB
    lead_id: Optional[str] = None  # Supabase user_id string
    editor_ids: List[str] = Field(default_factory=list)  # List of Supabase user_id strings
    client_ids: List[str] = Field(default_factory=list)  # List of Supabase user_id strings (Client role)
    status: Literal["active", "completed"] = "active"
    version: str = "V1"
    advance_paid: bool = False
    milestone_paid: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "projects"
