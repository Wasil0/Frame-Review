from fastapi import APIRouter, Depends, HTTPException, status
from beanie import PydanticObjectId
from backend.models.notification import Notification
from backend.models.project import Project
from backend.utils.auth import get_user_context, UserContext
from pydantic import BaseModel
from typing import List

router = APIRouter(prefix="/notifications", tags=["Notifications"])

class NotificationCreate(BaseModel):
    recipient_id: str
    title: str
    message: str
    project_id: str

class NotificationMarkRead(BaseModel):
    is_read: bool

@router.post("", status_code=status.HTTP_201_CREATED, response_model=Notification)
async def create_notification(payload: NotificationCreate, ctx: UserContext = Depends(get_user_context)):
    """
    Creates a notification. Validates that the associated project belongs to the tenant.
    """
    try:
        rid = PydanticObjectId(payload.recipient_id)
        pid = PydanticObjectId(payload.project_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid recipient_id or project_id format."
        )
        
    project = await Project.get(pid)
    if not project or project.agency_id != ctx.active_agency_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or access denied."
        )
        
    notification = Notification(
        recipient_id=rid,
        title=payload.title,
        message=payload.message,
        project_id=pid
    )
    await notification.insert()
    return notification

@router.get("", response_model=List[Notification])
async def list_notifications(ctx: UserContext = Depends(get_user_context)):
    """
    Retrieves notifications for the current user under the active agency's projects.
    """
    notifications = await Notification.find(
        Notification.recipient_id == ctx.user.id
    ).to_list()
    
    # Filter to make sure they belong to the current agency
    project_ids = list({n.project_id for n in notifications})
    valid_projects = await Project.find({
        "_id": {"$in": project_ids},
        "agency_id": ctx.active_agency_id
    }).to_list()
    valid_project_ids = {p.id for p in valid_projects}
    
    return [n for n in notifications if n.project_id in valid_project_ids]

@router.put("/{notification_id}/read", response_model=Notification)
async def mark_notification_read(
    notification_id: str,
    payload: NotificationMarkRead,
    ctx: UserContext = Depends(get_user_context)
):
    """
    Marks a notification as read or unread.
    """
    try:
        nid = PydanticObjectId(notification_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid notification_id format."
        )
        
    notification = await Notification.get(nid)
    if not notification or notification.recipient_id != ctx.user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found."
        )
        
    notification.is_read = payload.is_read
    await notification.save()
    return notification
