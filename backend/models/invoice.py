from datetime import datetime, timezone
from typing import Optional, Literal
from beanie import Document, Indexed, PydanticObjectId
from pydantic import Field

class Invoice(Document):
    project_id: Indexed(PydanticObjectId)
    agency_id: Indexed(PydanticObjectId)
    amount: str  # Encrypted string in MongoDB representing financial data
    status: Literal["pending", "paid"] = "pending"
    due_date: Optional[str] = None
    paid_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "invoices"
