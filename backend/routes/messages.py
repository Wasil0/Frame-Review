from fastapi import APIRouter, Depends, HTTPException, status
from beanie import PydanticObjectId
from backend.models.message import Message
from backend.models.video import Video
from backend.models.project import Project
from backend.utils.auth import get_user_context, UserContext
from pydantic import BaseModel
from typing import List, Literal, Optional

router = APIRouter(prefix="/messages", tags=["Messages"])

class MessageCreate(BaseModel):
    video_id: str
    chat_type: Literal["client_review", "internal"]
    text: str
    video_timestamp: Optional[float] = None
    parent_msg_id: Optional[str] = None

class MessageResolve(BaseModel):
    is_resolved: bool

@router.post("", status_code=status.HTTP_201_CREATED, response_model=Message)
async def create_message(payload: MessageCreate, ctx: UserContext = Depends(get_user_context)):
    """
    Creates a new message or video review comment. Prevents clients from posting to internal chat.
    """
    try:
        vid = PydanticObjectId(payload.video_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid video_id format. Must be a valid 24-character hex string."
        )
        
    video = await Video.get(vid)
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found."
        )
        
    project = await Project.get(video.project_id)
    if not project or project.agency_id != ctx.active_agency_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Video does not belong to this tenant."
        )
        
    # Restrict clients from posting internal messages
    if ctx.role == "client" and payload.chat_type == "internal":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied. Clients cannot post internal chat messages."
        )
        
    parent_id = None
    if payload.parent_msg_id:
        try:
            parent_id = PydanticObjectId(payload.parent_msg_id)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid parent_msg_id format."
            )
        parent_msg = await Message.get(parent_id)
        if not parent_msg or parent_msg.video_id != vid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Parent message not found in the scope of this video."
            )
            
    message = Message(
        video_id=vid,
        sender_id=ctx.user.id,
        chat_type=payload.chat_type,
        text=payload.text,
        video_timestamp=payload.video_timestamp,
        parent_msg_id=parent_id
    )
    await message.insert()
    return message

@router.get("/video/{video_id}", response_model=List[Message])
async def list_messages(video_id: str, ctx: UserContext = Depends(get_user_context)):
    """
    Lists all messages/comments for a video.
    Restricts client roles from viewing 'internal' chats.
    """
    try:
        vid = PydanticObjectId(video_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid video_id format. Must be a valid 24-character hex string."
        )
        
    video = await Video.get(vid)
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found."
        )
        
    project = await Project.get(video.project_id)
    if not project or project.agency_id != ctx.active_agency_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied."
        )
        
    if ctx.role == "client":
        # Clients can only see client review messages
        messages = await Message.find(
            Message.video_id == vid,
            Message.chat_type == "client_review"
        ).to_list()
    else:
        # Agency staff can see all messages
        messages = await Message.find(Message.video_id == vid).to_list()
        
    return messages

@router.put("/{message_id}/resolve", response_model=Message)
async def resolve_message(message_id: str, payload: MessageResolve, ctx: UserContext = Depends(get_user_context)):
    """
    Resolves or unresolves a comment. Only agency members (non-clients) can resolve comments.
    """
    try:
        mid = PydanticObjectId(message_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid message_id format. Must be a valid 24-character hex string."
        )
        
    message = await Message.get(mid)
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found."
        )
        
    video = await Video.get(message.video_id)
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated video not found."
        )
        
    project = await Project.get(video.project_id)
    if not project or project.agency_id != ctx.active_agency_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied."
        )
        
    # Check permissions
    if ctx.role == "client":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied. Clients cannot resolve feedback."
        )
        
    message.is_resolved = payload.is_resolved
    await message.save()
    return message
