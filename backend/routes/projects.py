from fastapi import APIRouter, Depends, HTTPException, status
from beanie import PydanticObjectId
from backend.models.project import Project, ProjectFinancials
from backend.utils.auth import get_user_context, UserContext
from backend.utils.masking import mask_project, mask_projects
from pydantic import BaseModel, Field
from typing import List, Literal, Optional

router = APIRouter(prefix="/projects", tags=["Projects"])

class ProjectCreate(BaseModel):
    project_name: str
    status: Literal["In Progress", "Internal Review", "Sent to Client", "Completed"] = "In Progress"
    manager_id: str
    assigned_editors: List[str] = Field(default_factory=list)
    financials: ProjectFinancials

class ProjectUpdate(BaseModel):
    project_name: Optional[str] = None
    status: Optional[Literal["In Progress", "Internal Review", "Sent to Client", "Completed"]] = None
    manager_id: Optional[str] = None
    assigned_editors: Optional[List[str]] = None
    financials: Optional[ProjectFinancials] = None

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_project(payload: ProjectCreate, ctx: UserContext = Depends(get_user_context)):
    """
    Creates a new project within the tenant agency context.
    """
    try:
        manager_id = PydanticObjectId(payload.manager_id)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid manager_id format. Must be a valid 24-character hex string."
        )
        
    editor_ids = []
    for ed_id in payload.assigned_editors:
        try:
            editor_ids.append(PydanticObjectId(ed_id))
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid editor ID format: {ed_id}"
            )
            
    project = Project(
        agency_id=ctx.active_agency_id,
        project_name=payload.project_name,
        status=payload.status,
        manager_id=manager_id,
        assigned_editors=editor_ids,
        financials=payload.financials
    )
    await project.insert()
    return mask_project(project, ctx.role)

@router.get("")
async def list_projects(ctx: UserContext = Depends(get_user_context)):
    """
    Lists all projects belonging to the active agency.
    """
    projects = await Project.find(Project.agency_id == ctx.active_agency_id).to_list()
    return mask_projects(projects, ctx.role)

@router.get("/{project_id}")
async def get_project(project_id: str, ctx: UserContext = Depends(get_user_context)):
    """
    Gets details of a single project, verifying it belongs to the tenant.
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
        
    return mask_project(project, ctx.role)

@router.put("/{project_id}")
async def update_project(project_id: str, payload: ProjectUpdate, ctx: UserContext = Depends(get_user_context)):
    """
    Updates project details. Restricts financials updates to non-editor/non-manager roles.
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
        
    if payload.project_name is not None:
        project.project_name = payload.project_name
        
    if payload.status is not None:
        project.status = payload.status
        
    if payload.manager_id is not None:
        try:
            project.manager_id = PydanticObjectId(payload.manager_id)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid manager_id."
            )
            
    if payload.assigned_editors is not None:
        editor_ids = []
        for ed_id in payload.assigned_editors:
            try:
                editor_ids.append(PydanticObjectId(ed_id))
            except Exception:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid editor ID: {ed_id}"
                )
        project.assigned_editors = editor_ids
        
    if payload.financials is not None:
        if ctx.role in ["editor", "manager"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permission denied. Editors and managers cannot modify financials."
            )
        project.financials = payload.financials
        
    await project.save()
    return mask_project(project, ctx.role)
