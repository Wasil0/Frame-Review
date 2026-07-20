from fastapi import APIRouter, Depends, HTTPException, status
from beanie import PydanticObjectId
from backend.models.agency import Agency
from backend.models.user import User, Workspace
from backend.utils.auth import get_user_context, UserContext
from backend.utils.masking import mask_agency
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/agencies", tags=["Agencies"])

class AgencyCreate(BaseModel):
    company_name: str
    owner_id: str
    stripe_account_id: Optional[str] = None

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_agency(payload: AgencyCreate):
    """
    Creates an agency and associates it with the owner user's workspaces.
    """
    try:
        owner_id = PydanticObjectId(payload.owner_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid owner_id format. Must be a valid 24-character hex string."
        )
        
    owner = await User.get(owner_id)
    if not owner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Owner user not found."
        )
        
    agency = Agency(
        company_name=payload.company_name,
        owner_id=owner_id,
        stripe_account_id=payload.stripe_account_id
    )
    await agency.insert()
    
    # Associate workspace with owner
    owner.workspaces.append(Workspace(agency_id=agency.id, role="owner"))
    await owner.save()
    
    # Owner gets unmasked data
    return mask_agency(agency, "owner")

@router.get("/current")
async def get_current_agency(ctx: UserContext = Depends(get_user_context)):
    """
    Retrieves the current agency based on X-Agency-ID header, applying data masking.
    """
    agency = await Agency.get(ctx.active_agency_id)
    if not agency:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active agency not found."
        )
    return mask_agency(agency, ctx.role)
