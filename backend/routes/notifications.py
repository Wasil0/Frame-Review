from fastapi import APIRouter, Depends, HTTPException, status
from beanie import PydanticObjectId
from backend.models.notification import Notification
from backend.models.user import User
from backend.utils.auth import get_current_user
from backend.utils.serializers import serialize_notification

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", status_code=status.HTTP_200_OK)
async def get_my_notifications(current_user: User = Depends(get_current_user)):
    """
    Returns notifications for the current authenticated user ordered by newest first.
    """
    notifs = await Notification.find(
        Notification.recipient_id == current_user.id
    ).sort("-created_at").to_list()

    return [serialize_notification(n) for n in notifs]

@router.patch("/read-all", status_code=status.HTTP_200_OK)
async def mark_all_notifications_read(current_user: User = Depends(get_current_user)):
    """
    Marks all notifications for current_user as read.
    """
    unread_notifs = await Notification.find(
        Notification.recipient_id == current_user.id,
        Notification.read == False
    ).to_list()

    for n in unread_notifs:
        n.read = True
        await n.save()

    return {"success": True, "count": len(unread_notifs)}

@router.patch("/{notification_id}/read", status_code=status.HTTP_200_OK)
async def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Marks a single notification as read.
    """
    try:
        nid = PydanticObjectId(notification_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid notification_id format.")

    notif = await Notification.get(nid)
    if not notif or notif.recipient_id != current_user.id:
        raise HTTPException(status_code=404, detail="Notification not found or access denied.")

    notif.read = True
    await notif.save()

    return serialize_notification(notif)
