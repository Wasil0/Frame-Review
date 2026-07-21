from fastapi import APIRouter, Depends, HTTPException, status
from beanie import PydanticObjectId
from pydantic import BaseModel
from backend.models.agency import Agency
from backend.models.user import User
from backend.utils.auth import get_current_user
from backend.utils.serializers import serialize_agency

router = APIRouter(prefix="/agencies", tags=["Agencies"])

class AgencyCreatePayload(BaseModel):
    name: str

class AgencyUpdatePayload(BaseModel):
    name: str

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_agency(payload: AgencyCreatePayload, current_user: User = Depends(get_current_user)):
    """
    Creates a new agency document for the current user and sets their agency_id.
    Used by the onboarding popup for new users.
    """
    agency_name = payload.name.strip()
    if not agency_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Agency name is required."
        )

    agency = Agency(
        name=agency_name,
        owner_id=current_user.id
    )
    await agency.insert()

    # Link user's profile to the newly created agency
    current_user.agency_id = agency.id
    await current_user.save()

    return serialize_agency(agency)

@router.patch("/{agency_id}", status_code=status.HTTP_200_OK)
async def update_agency_name(
    agency_id: str,
    payload: AgencyUpdatePayload,
    current_user: User = Depends(get_current_user)
):
    """
    Updates the agency name. Requires requesting user role == "Owner" and agency_id match.
    """
    try:
        aid = PydanticObjectId(agency_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid agency_id format.")

    if current_user.role != "Owner" or current_user.agency_id != aid:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied. Only the agency Owner can modify agency settings."
        )

    agency = await Agency.get(aid)
    if not agency:
        raise HTTPException(status_code=404, detail="Agency not found.")

    new_name = payload.name.strip()
    if not new_name:
        raise HTTPException(status_code=400, detail="Agency name cannot be empty.")

    agency.name = new_name
    await agency.save()

    return serialize_agency(agency)
