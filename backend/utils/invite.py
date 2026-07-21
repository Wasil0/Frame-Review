import secrets
import string
import logging
import httpx
import resend
from typing import Optional
from fastapi import HTTPException, status
from beanie import PydanticObjectId
from backend.config.settings import settings
from backend.models.user import User
from backend.models.agency import Agency
from backend.models.project import Project
from backend.utils.encryption import encrypt_field

logger = logging.getLogger("uvicorn.error")

def generate_temp_password(length: int = 14) -> str:
    """
    Generates a secure random 14-character temporary password containing mixed case, digits, and symbols.
    """
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return "".join(secrets.choice(alphabet) for _ in range(length))

async def create_invited_user(
    email: str,
    full_name: str,
    role: str,
    agency_id: PydanticObjectId,
    job_title: Optional[str] = None,
    project_id: Optional[PydanticObjectId] = None,
    project_title: Optional[str] = None
) -> User:
    """
    Creates a user in Supabase Auth via Admin API, inserts a MongoDB user document with must_reset_password=True,
    links client users to project_id if specified, and dispatches an invitation email with credentials.
    """
    clean_email = email.strip()
    clean_name = full_name.strip() if full_name else clean_email.split("@")[0]
    temp_password = generate_temp_password()

    service_key = settings.SUPABASE_SERVICE_ROLE_KEY
    if not service_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="SUPABASE_SERVICE_ROLE_KEY is not configured on the backend server."
        )

    # 1. Supabase Admin API User Creation
    admin_url = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/admin/users"
    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "email": clean_email,
        "password": temp_password,
        "email_confirm": True,
        "user_metadata": {
            "full_name": clean_name
        }
    }

    async with httpx.AsyncClient(timeout=10.0) as client:
        res = await client.post(admin_url, json=payload, headers=headers)
        if res.status_code not in (200, 201):
            err_msg = res.text
            try:
                err_json = res.json()
                err_msg = err_json.get("msg") or err_json.get("message") or err_json.get("error_description") or err_msg
            except Exception:
                pass
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"User invitation failed in Supabase Auth: {err_msg}"
            )
        
        supabase_user = res.json()
        supabase_user_id = supabase_user.get("id")

    if not supabase_user_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve created user ID from Supabase Auth."
        )

    # 2. Insert User document into MongoDB
    user = User(
        id=supabase_user_id,
        email=encrypt_field(clean_email),
        full_name=encrypt_field(clean_name),
        role=role,
        agency_id=agency_id,
        job_title=job_title or role,
        must_reset_password=True
    )
    await user.insert()

    # 3. Link Client to Project if applicable
    if role == "Client" and project_id:
        project = await Project.get(project_id)
        if project:
            if supabase_user_id not in project.client_ids:
                project.client_ids.append(supabase_user_id)
                await project.save()

    # 4. Fetch Agency Name for Email Template
    agency_name = "Agency"
    if agency_id:
        agency = await Agency.get(agency_id)
        if agency:
            agency_name = agency.name

    # 5. Dispatch Invitation Email via Resend
    if settings.RESEND_API_KEY:
        try:
            resend.api_key = settings.RESEND_API_KEY
            if role == "Client":
                proj_name = project_title or "your video project"
                subject = f"Invitation to review {proj_name} on FrameReview"
                text_content = (
                    f"{agency_name} has invited you to review {proj_name} on FrameReview.\n\n"
                    f"Sign in with:\n"
                    f"Email: {clean_email}\n"
                    f"Temporary password: {temp_password}\n\n"
                    f"You will be asked to update your password upon initial sign in."
                )
            else:
                title_str = job_title or role
                subject = f"You've been added to {agency_name} on FrameReview"
                text_content = (
                    f"You've been added to {agency_name} on FrameReview as a {title_str}.\n\n"
                    f"Sign in with:\n"
                    f"Email: {clean_email}\n"
                    f"Temporary password: {temp_password}\n\n"
                    f"You'll be asked to change your password on first login."
                )

            resend.Emails.send({
                "from": "FrameReview <onboarding@resend.dev>",
                "to": [clean_email],
                "subject": subject,
                "text": text_content
            })
            logger.info(f"Successfully dispatched invitation email to {clean_email}")
        except Exception as e:
            logger.error(f"Failed to send invite email to {clean_email}: {e}", exc_info=True)
    else:
        logger.warning(f"RESEND_API_KEY is NOT set. Created user {clean_email} with temp password: {temp_password}")

    return user
