from typing import List, Literal
from beanie import Document, Indexed, PydanticObjectId
from pydantic import BaseModel, Field

class ProjectFinancials(BaseModel):
    total_budget: float
    advance_percentage: float
    is_advance_paid: bool = False
    is_final_paid: bool = False

class Project(Document):
    agency_id: Indexed(PydanticObjectId)
    project_name: str
    status: Literal["In Progress", "Internal Review", "Sent to Client", "Completed"]
    manager_id: PydanticObjectId
    assigned_editors: List[PydanticObjectId] = Field(default_factory=list)
    financials: ProjectFinancials

    class Settings:
        name = "projects"
        # We can also configure additional settings if needed
