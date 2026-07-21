import logging
from typing import Optional
from beanie import PydanticObjectId
from backend.models.notification import Notification

logger = logging.getLogger(__name__)

async def create_notification(
    recipient_id: str,
    agency_id: PydanticObjectId,
    type: str,
    message: str,
    link: Optional[str] = None
) -> Optional[Notification]:
    """
    Creates a notification document in MongoDB for recipient_id.
    """
    if not recipient_id or not agency_id:
        return None

    try:
        notif = Notification(
            recipient_id=str(recipient_id),
            agency_id=agency_id,
            type=type,
            message=message,
            link=link,
            read=False
        )
        await notif.insert()
        return notif
    except Exception as e:
        logger.warning(f"Failed to create notification for {recipient_id}: {e}")
        return None
