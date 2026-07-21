from typing import Dict, Any
from backend.models.user import User
from backend.models.agency import Agency
from backend.models.project import Project
from backend.models.invoice import Invoice
from backend.models.notification import Notification
from backend.utils.encryption import decrypt_field

async def serialize_user_with_agency(user: User) -> Dict[str, Any]:
    agency_name = None
    if user.agency_id:
        agency = await Agency.get(user.agency_id)
        if agency:
            agency_name = agency.name

    must_reset = getattr(user, "must_reset_password", False)
    if user.role == "Owner":
        must_reset = False

    return {
        "_id": str(user.id),
        "id": str(user.id),
        "email": decrypt_field(user.email),
        "full_name": decrypt_field(user.full_name) or "",
        "role": user.role,
        "agency_id": str(user.agency_id) if user.agency_id else None,
        "agency_name": agency_name,
        "job_title": user.job_title,
        "must_reset_password": must_reset,
        "created_at": user.created_at.isoformat() if user.created_at else None
    }

def serialize_user(user: User, agency_name: str = None) -> Dict[str, Any]:
    must_reset = getattr(user, "must_reset_password", False)
    if user.role == "Owner":
        must_reset = False

    return {
        "_id": str(user.id),
        "id": str(user.id),
        "email": decrypt_field(user.email),
        "full_name": decrypt_field(user.full_name) or "",
        "role": user.role,
        "agency_id": str(user.agency_id) if user.agency_id else None,
        "agency_name": agency_name,
        "job_title": user.job_title,
        "must_reset_password": must_reset,
        "created_at": user.created_at.isoformat() if user.created_at else None
    }

def serialize_agency(agency: Agency) -> Dict[str, Any]:
    return {
        "_id": str(agency.id),
        "id": str(agency.id),
        "name": agency.name,
        "owner_id": agency.owner_id,
        "subdomain": agency.subdomain,
        "created_at": agency.created_at.isoformat() if agency.created_at else None
    }

def serialize_project(project: Project) -> Dict[str, Any]:
    return {
        "_id": str(project.id),
        "id": str(project.id),
        "agency_id": str(project.agency_id),
        "title": project.title,
        "client_org": project.client_org,
        "client_email": decrypt_field(project.client_email),
        "lead_id": project.lead_id,
        "editor_ids": project.editor_ids or [],
        "client_ids": getattr(project, "client_ids", []),
        "status": project.status,
        "version": project.version,
        "advance_paid": project.advance_paid,
        "milestone_paid": project.milestone_paid,
        "created_at": project.created_at.isoformat() if project.created_at else None
    }

def serialize_invoice(invoice: Invoice) -> Dict[str, Any]:
    raw_amt = decrypt_field(invoice.amount)
    try:
        amount_num = float(raw_amt) if raw_amt is not None else 0.0
    except (ValueError, TypeError):
        amount_num = 0.0

    return {
        "_id": str(invoice.id),
        "id": str(invoice.id),
        "project_id": str(invoice.project_id),
        "agency_id": str(invoice.agency_id),
        "amount": amount_num,
        "status": invoice.status,
        "due_date": invoice.due_date,
        "paid_at": invoice.paid_at.isoformat() if invoice.paid_at else None,
        "created_at": invoice.created_at.isoformat() if invoice.created_at else None
    }

def serialize_notification(n: Notification) -> Dict[str, Any]:
    return {
        "_id": str(n.id),
        "id": str(n.id),
        "recipient_id": n.recipient_id,
        "agency_id": str(n.agency_id),
        "type": n.type,
        "message": n.message,
        "link": n.link,
        "read": n.read,
        "created_at": n.created_at.isoformat() if n.created_at else None
    }
