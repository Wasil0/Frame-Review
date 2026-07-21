from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from beanie import PydanticObjectId
from backend.models.user import User
from backend.models.invoice import Invoice
from backend.models.project import Project
from backend.models.agency import Agency
from backend.utils.auth import get_current_user
from backend.utils.serializers import serialize_invoice
from backend.utils.notifications import create_notification

router = APIRouter(prefix="/invoices", tags=["Invoices"])

@router.get("", status_code=status.HTTP_200_OK)
async def list_invoices(current_user: User = Depends(get_current_user)):
    """
    Returns all invoices for the current user's agency.
    """
    if not current_user.agency_id:
        return []

    invoices = await Invoice.find(Invoice.agency_id == current_user.agency_id).to_list()
    return [serialize_invoice(inv) for inv in invoices]

@router.patch("/{invoice_id}/pay", status_code=status.HTTP_200_OK)
async def mark_invoice_paid(
    invoice_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Marks an invoice as paid and notifies the agency Owner and project Lead.
    """
    try:
        iid = PydanticObjectId(invoice_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid invoice_id format.")

    invoice = await Invoice.get(iid)
    if not invoice or invoice.agency_id != current_user.agency_id:
        raise HTTPException(status_code=404, detail="Invoice not found or access denied.")

    invoice.status = "paid"
    invoice.paid_at = datetime.now(timezone.utc)
    await invoice.save()

    # Rule J: Notify Owner (and Lead if different)
    agency = await Agency.get(invoice.agency_id)
    project = await Project.get(invoice.project_id)
    proj_title = project.title if project else "Project"

    recipients = set()
    if agency and agency.owner_id:
        recipients.add(agency.owner_id)
    if project and project.lead_id:
        recipients.add(project.lead_id)

    for recip_id in recipients:
        if recip_id != current_user.id:
            await create_notification(
                recipient_id=recip_id,
                agency_id=invoice.agency_id,
                type="invoice_paid",
                message=f"Milestone invoice for '{proj_title}' has been settled and cleared.",
                link=f"#workspace/{invoice.project_id}"
            )

    return serialize_invoice(invoice)
