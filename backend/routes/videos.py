from fastapi import APIRouter, Depends, HTTPException, status
from beanie import PydanticObjectId
from backend.models.video import Video
from backend.models.project import Project
from backend.utils.auth import get_user_context, UserContext
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/videos", tags=["Videos"])

class VideoCreate(BaseModel):
    project_id: str
    version_tag: str
    s3_video_url: str

class VideoApprove(BaseModel):
    is_approved_by_manager: bool

@router.post("", status_code=status.HTTP_201_CREATED, response_model=Video)
async def create_video(payload: VideoCreate, ctx: UserContext = Depends(get_user_context)):
    """
    Creates a new video entry for a project. Validates that the project belongs to the tenant.
    """
    try:
        pid = PydanticObjectId(payload.project_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid project_id format. Must be a valid 24-character hex string."
        )
        
    project = await Project.get(pid)
    if not project or project.agency_id != ctx.active_agency_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or access denied."
        )
        
    video = Video(
        project_id=pid,
        version_tag=payload.version_tag,
        s3_video_url=payload.s3_video_url
    )
    await video.insert()
    return video

@router.get("/project/{project_id}", response_model=List[Video])
async def list_videos(project_id: str, ctx: UserContext = Depends(get_user_context)):
    """
    Lists all videos under a specific project, validating tenant scoping.
    """
    try:
        pid = PydanticObjectId(project_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid project_id format. Must be a valid 24-character hex string."
        )
        
    project = await Project.get(pid)
    if not project or project.agency_id != ctx.active_agency_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or access denied."
        )
        
    videos = await Video.find(Video.project_id == pid).to_list()
    return videos

@router.get("/{video_id}", response_model=Video)
async def get_video(video_id: str, ctx: UserContext = Depends(get_user_context)):
    """
    Retrieves details of a single video, ensuring it belongs to the tenant.
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
            detail="Access denied. Video does not belong to this tenant."
        )
        
    return video

@router.put("/{video_id}/approve", response_model=Video)
async def approve_video(video_id: str, payload: VideoApprove, ctx: UserContext = Depends(get_user_context)):
    """
    Updates the approval status of a video. Only owners or managers can approve videos.
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
        
    # Check if the user is owner or manager (or specific project manager)
    if ctx.role not in ["owner", "manager"] and ctx.user.id != project.manager_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied. Only managers or owners can approve videos."
        )
        
    video.is_approved_by_manager = payload.is_approved_by_manager
    await video.save()
    return video
