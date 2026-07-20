from typing import List, Dict, Any
from beanie import PydanticObjectId
from fastapi.encoders import jsonable_encoder
from backend.models.project import Project
from backend.models.agency import Agency
from backend.models.user import User

def mask_project(project: Project, role: str) -> Dict[str, Any]:
    """
    Serializes a Project and masks its financials if the user is an editor or manager.
    """
    data = jsonable_encoder(project)
    if role in ["editor", "manager"]:
        data["financials"] = None
    return data

def mask_projects(projects: List[Project], role: str) -> List[Dict[str, Any]]:
    """
    Masks a list of Projects.
    """
    return [mask_project(p, role) for p in projects]

def mask_agency(agency: Agency, role: str) -> Dict[str, Any]:
    """
    Serializes an Agency and masks stripe_account_id if the user is an editor or manager.
    """
    data = jsonable_encoder(agency)
    if role in ["editor", "manager"]:
        data["stripe_account_id"] = None
    return data

def mask_user(user: User, role: str, active_agency_id: PydanticObjectId) -> Dict[str, Any]:
    """
    Serializes a User and masks their email if the viewer is an editor or manager
    and the user being viewed is a client under the active agency.
    """
    data = jsonable_encoder(user)
    if role in ["editor", "manager"]:
        # Find if this user is a client in the specified agency
        is_client = any(
            ws["agency_id"] == str(active_agency_id) and ws["role"] == "client"
            for ws in data.get("workspaces", [])
        )
        if is_client:
            data["email"] = "[MASKED]"
    return data

def mask_users(users: List[User], role: str, active_agency_id: PydanticObjectId) -> List[Dict[str, Any]]:
    """
    Masks a list of Users.
    """
    return [mask_user(u, role, active_agency_id) for u in users]
