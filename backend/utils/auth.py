from fastapi import Header, HTTPException, status, Depends
from beanie import PydanticObjectId
from backend.models.user import User
from pydantic import BaseModel, ConfigDict

class UserContext(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    user: User
    active_agency_id: PydanticObjectId
    role: str  # owner, manager, editor, client

async def get_agency_id(x_agency_id: str = Header(..., alias="X-Agency-ID")) -> PydanticObjectId:
    """
    Extracts the X-Agency-ID header and validates it as a PydanticObjectId.
    """
    try:
        return PydanticObjectId(x_agency_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid X-Agency-ID header format. Must be a valid 24-character hex string."
        )

async def get_current_user(x_user_email: str = Header(..., alias="X-User-Email")) -> User:
    """
    Looks up the user by email based on the X-User-Email header.
    """
    user = await User.find_one(User.email == x_user_email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or unauthorized."
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated."
        )
    return user

async def get_user_context(
    agency_id: PydanticObjectId = Depends(get_agency_id),
    user: User = Depends(get_current_user)
) -> UserContext:
    """
    Validates that the current user belongs to the requested agency's workspace.
    Returns the UserContext including the user's role for this agency.
    """
    # Find matching workspace for the active agency
    matching_workspace = next(
        (ws for ws in user.workspaces if ws.agency_id == agency_id),
        None
    )
    
    if not matching_workspace:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. User is not a member of this agency's workspace."
        )
        
    return UserContext(
        user=user,
        active_agency_id=agency_id,
        role=matching_workspace.role
    )
