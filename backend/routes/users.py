from fastapi import APIRouter, Depends, status
from typing import Optional
from pydantic import BaseModel
from backend.models.user import User
from backend.utils.auth import get_auth_user, get_current_user, AuthUser
from backend.utils.encryption import encrypt_field
from backend.utils.serializers import serialize_user_with_agency

router = APIRouter(prefix="/users", tags=["Users"])

class UserUpdatePayload(BaseModel):
    must_reset_password: Optional[bool] = None

@router.post("/sync", status_code=status.HTTP_200_OK)
async def sync_user(auth_user: AuthUser = Depends(get_auth_user)):
    """
    Called after successful frontend login/signup.
    Upserts a MongoDB users document for the verified Supabase user.
    Self-signup Owner accounts have must_reset_password=False.
    """
    user = await User.get(auth_user.user_id)
    if not user:
        raw_email = auth_user.email or ""
        name = auth_user.user_metadata.get("full_name") or (raw_email.split("@")[0] if raw_email else "User")
        
        user = User(
            id=auth_user.user_id,
            email=encrypt_field(raw_email),
            full_name=encrypt_field(name),
            role="Owner",
            agency_id=None,
            must_reset_password=False
        )
        await user.insert()
        
    return await serialize_user_with_agency(user)

@router.get("/me", status_code=status.HTTP_200_OK)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    """
    Returns the current authenticated user's MongoDB profile with agency_name.
    """
    return await serialize_user_with_agency(current_user)

@router.patch("/me", status_code=status.HTTP_200_OK)
async def update_my_profile(
    payload: UserUpdatePayload,
    current_user: User = Depends(get_current_user)
):
    """
    Updates profile flags such as setting must_reset_password = false after first login password update.
    """
    if payload.must_reset_password is not None:
        current_user.must_reset_password = payload.must_reset_password
        await current_user.save()

    return await serialize_user_with_agency(current_user)
