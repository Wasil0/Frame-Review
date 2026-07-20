from fastapi import APIRouter, Depends, HTTPException, status
from beanie import PydanticObjectId
from backend.models.user import User, Workspace
from backend.utils.auth import get_user_context, UserContext
from backend.utils.masking import mask_user, mask_users
from pydantic import BaseModel, EmailStr
from typing import List, Optional

router = APIRouter(prefix="/users", tags=["Users"])

class UserCreate(BaseModel):
    email: EmailStr
    name: str

class WorkspaceAdd(BaseModel):
    user_id: str
    role: str  # owner, manager, editor, client

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_user(payload: UserCreate):
    """
    Registers a new user in the system.
    """
    existing = await User.find_one(User.email == payload.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )
    user = User(email=payload.email, name=payload.name)
    await user.insert()
    return user

@router.post("/workspaces", status_code=status.HTTP_200_OK)
async def add_workspace(payload: WorkspaceAdd, ctx: UserContext = Depends(get_user_context)):
    """
    Adds or updates a workspace role for a user. Only owners and managers can assign roles.
    """
    # Authorization check
    if ctx.role not in ["owner", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied. Only owners and managers can manage workspace roles."
        )
        
    try:
        target_user_id = PydanticObjectId(payload.user_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user_id format. Must be a valid 24-character hex string."
        )
        
    target_user = await User.get(target_user_id)
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target user not found."
        )
        
    # Check if role is valid
    if payload.role not in ["owner", "manager", "editor", "client"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role option. Must be owner, manager, editor, or client."
        )
        
    # Update or add workspace
    existing_ws = next((ws for ws in target_user.workspaces if ws.agency_id == ctx.active_agency_id), None)
    if existing_ws:
        existing_ws.role = payload.role
    else:
        target_user.workspaces.append(Workspace(agency_id=ctx.active_agency_id, role=payload.role))
        
    await target_user.save()
    return mask_user(target_user, ctx.role, ctx.active_agency_id)

@router.get("")
async def list_agency_users(ctx: UserContext = Depends(get_user_context)):
    """
    Lists all users belonging to the active agency's workspace.
    Masks client user emails if the active user is an editor or manager.
    """
    users = await User.find({"workspaces.agency_id": ctx.active_agency_id}).to_list()
    return mask_users(users, ctx.role, ctx.active_agency_id)
