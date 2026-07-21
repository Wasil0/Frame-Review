import logging
import resend
from fastapi import APIRouter, Depends, HTTPException, status, Query
from beanie import PydanticObjectId
from typing import List, Optional, Literal
from pydantic import BaseModel, Field
from backend.config.settings import settings
from backend.models.project import Project
from backend.models.invoice import Invoice
from backend.models.user import User
from backend.models.agency import Agency
from backend.utils.auth import get_current_user
from backend.utils.encryption import encrypt_field, decrypt_field
from backend.utils.serializers import serialize_project
from backend.utils.invite import create_invited_user
from backend.utils.notifications import create_notification

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/projects", tags=["Projects"])

class ProjectCreatePayload(BaseModel):
    title: str
    client_org: str
    client_email: str
    lead_id: Optional[str] = None
    editor_ids: List[str] = Field(default_factory=list)
    initial_milestone_amount: Optional[float] = 5000.0

class MemberAssignPayload(BaseModel):
    user_id: str

@router.get("", status_code=status.HTTP_200_OK)
async def list_projects(
    status: Optional[Literal["active", "completed"]] = Query(None),
    current_user: User = Depends(get_current_user)
):
    """
    Lists projects for the current user's agency, optionally filtered by status.
    """
    if not current_user.agency_id:
        return []

    query = [Project.agency_id == current_user.agency_id]
    if status:
        query.append(Project.status == status)

    projects = await Project.find(*query).to_list()
    return [serialize_project(p) for p in projects]

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_project(
    payload: ProjectCreatePayload,
    current_user: User = Depends(get_current_user)
):
    """
    Creates a new project for the current agency, generates an initial invoice,
    invites or links the client user, and notifies assigned team leads/editors.
    """
    if not current_user.agency_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must set up an agency before creating projects."
        )

    clean_client_email = payload.client_email.strip()
    encrypted_email = encrypt_field(clean_client_email)

    project = Project(
        agency_id=current_user.agency_id,
        title=payload.title.strip(),
        client_org=payload.client_org.strip(),
        client_email=encrypted_email,
        lead_id=payload.lead_id or current_user.id,
        editor_ids=payload.editor_ids or [],
        client_ids=[],
        status="active",
        version="V1"
    )
    await project.insert()

    # Generate initial invoice if initial_milestone_amount is provided
    amount = payload.initial_milestone_amount
    if amount is not None and amount > 0:
        encrypted_amount = encrypt_field(str(amount))
        invoice = Invoice(
            project_id=project.id,
            agency_id=current_user.agency_id,
            amount=encrypted_amount,
            status="pending"
        )
        await invoice.insert()

    # Check if a client user with this email already exists
    agency_users = await User.find(User.agency_id == current_user.agency_id).to_list()
    existing_client = next(
        (u for u in agency_users if decrypt_field(u.email).lower() == clean_client_email.lower()),
        None
    )

    agency = await Agency.get(current_user.agency_id)
    agency_name = agency.name if agency else "Agency"

    if existing_client:
        # Link existing client to this project
        if existing_client.id not in project.client_ids:
            project.client_ids.append(existing_client.id)
            await project.save()

        # Send lighter notification email
        if settings.RESEND_API_KEY:
            try:
                resend.api_key = settings.RESEND_API_KEY
                resend.Emails.send({
                    "from": "FrameReview <onboarding@resend.dev>",
                    "to": [clean_client_email],
                    "subject": f"Added to new project {project.title} on FrameReview",
                    "text": f"{agency_name} has added you to a new project {project.title} on FrameReview. Sign in to your account to review."
                })
            except Exception as e:
                logger.error(f"Failed to send project addition email to {clean_client_email}: {e}", exc_info=True)
    else:
        # Create new client user account and send full credentials email
        await create_invited_user(
            email=clean_client_email,
            full_name=payload.client_org.strip(),
            role="Client",
            agency_id=current_user.agency_id,
            project_id=project.id,
            project_title=project.title
        )

    # RULE A: Notify assigned Lead and every Editor added to the project at creation (if any)
    notify_recipients = set()
    if project.lead_id:
        notify_recipients.add(project.lead_id)
    for ed_id in (project.editor_ids or []):
        notify_recipients.add(ed_id)

    for recip_id in notify_recipients:
        if recip_id != current_user.id:
            await create_notification(
                recipient_id=recip_id,
                agency_id=current_user.agency_id,
                type="project_created",
                message=f"You have been assigned to new project '{project.title}'",
                link=f"#workspace/{project.id}"
            )

    # TODO: trigger when new version pushed to client: notify Client on that project
    # TODO: trigger when client posts comment/question in Client Review: notify project Lead and Owner
    # TODO: trigger when Lead/Owner creates task from client comment assigned to Editor: notify specific Editor only
    # TODO: trigger when Editor marks task Ready for Review: notify Lead and Owner
    # TODO: trigger when Lead/Owner rejects task: notify Editor who submitted it

    return serialize_project(project)

@router.patch("/{project_id}/assign", status_code=status.HTTP_200_OK)
async def assign_editor_to_project(
    project_id: str,
    payload: MemberAssignPayload,
    current_user: User = Depends(get_current_user)
):
    """
    Adds user_id to project's editor_ids array and sends assignment notification.
    """
    try:
        pid = PydanticObjectId(project_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid project_id format.")

    project = await Project.get(pid)
    if not project or project.agency_id != current_user.agency_id:
        raise HTTPException(status_code=404, detail="Project not found or access denied.")

    if payload.user_id not in project.editor_ids:
        project.editor_ids.append(payload.user_id)
        await project.save()

        if payload.user_id != current_user.id:
            await create_notification(
                recipient_id=payload.user_id,
                agency_id=current_user.agency_id,
                type="project_assigned",
                message=f"You have been assigned to project '{project.title}'",
                link=f"#workspace/{project.id}"
            )

    return serialize_project(project)

@router.patch("/{project_id}/unassign", status_code=status.HTTP_200_OK)
async def unassign_editor_from_project(
    project_id: str,
    payload: MemberAssignPayload,
    current_user: User = Depends(get_current_user)
):
    """
    Removes user_id from project's editor_ids array.
    """
    try:
        pid = PydanticObjectId(project_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid project_id format.")

    project = await Project.get(pid)
    if not project or project.agency_id != current_user.agency_id:
        raise HTTPException(status_code=404, detail="Project not found or access denied.")

    if payload.user_id in project.editor_ids:
        project.editor_ids.remove(payload.user_id)
        await project.save()

    return serialize_project(project)
