from typing import List
from beanie import Document, Indexed, PydanticObjectId
from pydantic import BaseModel, Field

class Workspace(BaseModel):
    agency_id: PydanticObjectId
    role: str  # Choices: owner, manager, editor, client

class User(Document):
    email: Indexed(str, unique=True)
    name: str
    is_active: bool = True
    workspaces: List[Workspace] = Field(default_factory=list)

    class Settings:
        name = "users"
