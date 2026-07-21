from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from backend.models.user import User
from backend.models.project import Project
from backend.utils.auth import get_current_user
from backend.utils.encryption import decrypt_field
from backend.utils.serializers import serialize_project
from backend.utils.invite import create_invited_user

router = APIRouter(prefix="/team", tags=["Team"])

class TeamInvitePayload(BaseModel):
    full_name: str
    email: str
    job_title: str
    access_level: str  # "Manager" or "Editor"

@router.get("", status_code=status.HTTP_200_OK)
async def get_team_members(current_user: User = Depends(get_current_user)):
    """
    Returns all users in the current user's agency with their currently assigned active projects.
    """
    if not current_user.agency_id:
        return []

    agency_users = await User.find(User.agency_id == current_user.agency_id).to_list()
    active_projects = await Project.find(
        Project.agency_id == current_user.agency_id,
        Project.status == "active"
    ).to_list()

    team = []
    for u in agency_users:
        user_projects = [
            serialize_project(p) for p in active_projects
            if p.lead_id == u.id or (p.editor_ids and u.id in p.editor_ids)
        ]
        
        full_name = decrypt_field(u.full_name) or u.email
        email = decrypt_field(u.email) or ""

        team.append({
            "_id": str(u.id),
            "id": str(u.id),
            "full_name": full_name,
            "name": full_name,
            "email": email,
            "role": u.job_title or u.role,
            "access_level": u.role,
            "job_title": u.job_title or u.role,
            "active_projects_count": len(user_projects),
            "assigned_projects": user_projects
        })

    return team

@router.post("/invite", status_code=status.HTTP_201_CREATED)
async def invite_team_member(
    payload: TeamInvitePayload,
    current_user: User = Depends(get_current_user)
):
    """
    Invites a team member by creating a Supabase Auth user, syncing to Mongo, and sending credentials email.
    Requires requesting user to have role == "Owner".
    """
    if current_user.role != "Owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied. Only agency Owners can add or invite team members."
        )

    if not current_user.agency_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must create an agency before inviting team members."
        )

    new_user = await create_invited_user(
        email=payload.email,
        full_name=payload.full_name,
        role=payload.access_level if payload.access_level in ["Manager", "Editor"] else "Editor",
        agency_id=current_user.agency_id,
        job_title=payload.job_title
    )

    clean_email = payload.email.strip()
    clean_name = payload.full_name.strip()

    return {
        "_id": str(new_user.id),
        "id": str(new_user.id),
        "full_name": clean_name,
        "name": clean_name,
        "email": clean_email,
        "role": payload.job_title.strip() or new_user.role,
        "access_level": new_user.role,
        "job_title": payload.job_title.strip(),
        "active_projects_count": 0,
        "assigned_projects": []
    }
