from fastapi import APIRouter, Depends, status
from backend.models.user import User
from backend.models.project import Project
from backend.models.invoice import Invoice
from backend.utils.auth import get_current_user
from backend.utils.encryption import decrypt_field

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary", status_code=status.HTTP_200_OK)
async def get_dashboard_summary(current_user: User = Depends(get_current_user)):
    """
    Returns aggregated dashboard counts and financials scoped to the current user's agency_id.
    If agency_id is null, returns zeroed stats safely.
    """
    if not current_user.agency_id:
        return {
            "total_active_projects": 0,
            "user_assigned_projects": 0,
            "pending_revenue": 0.0,
            "month_revenue": 0.0
        }

    # Fetch active projects for agency
    active_projects = await Project.find(
        Project.agency_id == current_user.agency_id,
        Project.status == "active"
    ).to_list()

    total_active_projects = len(active_projects)

    # Count projects assigned to current user (as lead or editor)
    user_assigned_projects = sum(
        1 for p in active_projects
        if p.lead_id == current_user.id or (p.editor_ids and current_user.id in p.editor_ids)
    )

    # Fetch invoices for agency
    invoices = await Invoice.find(Invoice.agency_id == current_user.agency_id).to_list()

    pending_revenue = 0.0
    month_revenue = 0.0

    for inv in invoices:
        raw_amt = decrypt_field(inv.amount)
        try:
            val = float(raw_amt) if raw_amt is not None else 0.0
        except (ValueError, TypeError):
            val = 0.0

        if inv.status == "pending":
            pending_revenue += val
        elif inv.status == "paid":
            month_revenue += val

    return {
        "total_active_projects": total_active_projects,
        "user_assigned_projects": user_assigned_projects,
        "pending_revenue": round(pending_revenue, 2),
        "month_revenue": round(month_revenue, 2)
    }
