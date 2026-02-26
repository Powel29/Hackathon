"""
tools.py - LangChain tools connected to Supabase.
Note: All tools have a dummy '_' parameter to avoid a LangChain bug
where tools with no parameters receive None as input, causing a TypeError.
"""

import random
from contextvars import ContextVar
from langchain_core.tools import tool

# Per-request citizen context — set in main.py before every agent call
current_citizen_id: ContextVar[str] = ContextVar("current_citizen_id", default="")
current_account_id: ContextVar[str] = ContextVar("current_account_id", default="")


def _serialize(data):
    if isinstance(data, list):
        return [_serialize(item) for item in data]
    if isinstance(data, dict):
        return {k: _serialize(v) for k, v in data.items()}
    if hasattr(data, 'isoformat'):
        return data.isoformat()
    return data


def _get_citizen_id() -> str:
    cid = current_citizen_id.get()
    if not cid:
        raise ValueError("No citizen ID in context. User may not be authenticated.")
    return cid


# ─────────────────────────────────────────────────────────────
# ELECTRICITY
# ─────────────────────────────────────────────────────────────

@tool
def get_electricity_bills(_: str = "") -> dict:
    """
    Fetch electricity bills for the currently logged-in citizen.
    Returns recent bills including units consumed, charges, due date, and status.
    """
    try:
        from database import get_electricity_bills as db_get
        bills = db_get(_get_citizen_id())
        if not bills:
            return {"message": "No electricity bills found for this account.", "bills": []}
        return {"bills": _serialize(bills), "total": len(bills)}
    except Exception as e:
        return {"error": f"Could not fetch electricity bills: {str(e)}"}


@tool
def get_electricity_account(_: str = "") -> dict:
    """
    Fetch electricity account details for the currently logged-in citizen.
    Returns consumer number, connection type, current month usage, and status.
    """
    try:
        from database import get_electricity_account as db_get
        account = db_get(_get_citizen_id())
        if not account:
            return {"message": "No electricity account found."}
        return _serialize(account)
    except Exception as e:
        return {"error": f"Could not fetch electricity account: {str(e)}"}


# ─────────────────────────────────────────────────────────────
# WATER
# ─────────────────────────────────────────────────────────────

@tool
def get_water_bills(_: str = "") -> dict:
    """
    Fetch water bills for the currently logged-in citizen.
    Returns recent bills including units consumed, water charges,
    sewerage charges, total amount, due date, and payment status.
    """
    try:
        from database import get_water_bills as db_get
        bills = db_get(_get_citizen_id())
        if not bills:
            return {"message": "No water bills found for this account.", "bills": []}
        return {"bills": _serialize(bills), "total": len(bills)}
    except Exception as e:
        return {"error": f"Could not fetch water bills: {str(e)}"}


# ─────────────────────────────────────────────────────────────
# GAS
# ─────────────────────────────────────────────────────────────

@tool
def get_gas_bills(_: str = "") -> dict:
    """
    Fetch gas bills for the currently logged-in citizen.
    Returns recent bills including units consumed, gas charges,
    total amount, due date, and payment status.
    """
    try:
        from database import get_gas_bills as db_get
        bills = db_get(_get_citizen_id())
        if not bills:
            return {"message": "No gas bills found for this account.", "bills": []}
        return {"bills": _serialize(bills), "total": len(bills)}
    except Exception as e:
        return {"error": f"Could not fetch gas bills: {str(e)}"}


# ─────────────────────────────────────────────────────────────
# MUNICIPAL
# ─────────────────────────────────────────────────────────────

@tool
def get_municipal_bills(_: str = "") -> dict:
    """
    Fetch municipal/property tax bills for the currently logged-in citizen.
    Returns property tax, water tax, sewerage tax, garbage tax,
    education cess, total amount, due date, and payment status.
    """
    try:
        from database import get_municipal_bills as db_get
        bills = db_get(_get_citizen_id())
        if not bills:
            return {"message": "No municipal bills found for this account.", "bills": []}
        return {"bills": _serialize(bills), "total": len(bills)}
    except Exception as e:
        return {"error": f"Could not fetch municipal bills: {str(e)}"}


# ─────────────────────────────────────────────────────────────
# PAYMENTS
# ─────────────────────────────────────────────────────────────

@tool
def get_payment_history(_: str = "") -> dict:
    """
    Fetch recent payment history for the currently logged-in citizen.
    Returns payments across all bill types including transaction reference,
    gateway, amount, status, and payment date.
    """
    try:
        from database import get_payments as db_get
        payments = db_get(_get_citizen_id())
        if not payments:
            return {"message": "No payment history found.", "payments": []}
        return {"payments": _serialize(payments), "total": len(payments)}
    except Exception as e:
        return {"error": f"Could not fetch payment history: {str(e)}"}


@tool
def check_payment_by_transaction(transaction_ref: str) -> dict:
    """
    Check the status of a specific payment by its transaction reference number.
    Returns payment status, amount, gateway used, and payment date.
    """
    try:
        from database import get_payment_by_transaction as db_get
        payment = db_get(transaction_ref)
        if not payment:
            return {"error": f"No payment found with transaction reference: {transaction_ref}"}
        return _serialize(payment)
    except Exception as e:
        return {"error": f"Could not fetch payment: {str(e)}"}


# ─────────────────────────────────────────────────────────────
# SERVICE REQUESTS
# ─────────────────────────────────────────────────────────────

@tool
def get_service_requests(_: str = "") -> dict:
    """
    Fetch all service requests raised by the currently logged-in citizen.
    Returns request type, service type, status, and creation date.
    """
    try:
        from database import get_service_requests as db_get
        requests = db_get(_get_citizen_id())
        if not requests:
            return {"message": "No service requests found.", "requests": []}
        return {"requests": _serialize(requests), "total": len(requests)}
    except Exception as e:
        return {"error": f"Could not fetch service requests: {str(e)}"}


@tool
def create_service_request(service_type: str, request_type: str, details: str = "") -> dict:
    """
    Create a new service request for the currently logged-in citizen.
    service_type must be one of: electricity, water, gas, municipal.
    request_type examples: new_connection, disconnection, meter_repair, name_change, bill_dispute.
    details is an optional description of the request.
    """
    try:
        from database import create_service_request as db_create
        req = db_create(
            citizen_id=_get_citizen_id(),
            service_type=service_type,
            request_type=request_type,
            details={"description": details, "source": "chatbot"}
        )
        return {"message": "Service request created successfully.", "request": _serialize(req)}
    except Exception as e:
        return {"error": f"Could not create service request: {str(e)}"}


# ─────────────────────────────────────────────────────────────
# SUPPORT TICKETS
# ─────────────────────────────────────────────────────────────

@tool
def create_support_ticket(issue: str, priority: str = "medium") -> dict:
    """
    Create a support ticket for issues that cannot be resolved automatically.
    Saves to both support_tickets and complaints tables in the database.
    Priority must be one of: low, medium, high.
    Use high for urgent issues like payment failures or service disruptions.
    """
    valid_priorities = {"low", "medium", "high"}
    if priority not in valid_priorities:
        priority = "medium"

    ticket_id = f"TKT-{random.randint(10000, 99999)}"
    eta_map = {"high": "2-4 hours", "medium": "24 hours", "low": "3 business days"}

    try:
        from database import create_ticket
        create_ticket(
            ticket_id=ticket_id,
            user_id=_get_citizen_id(),
            account_id=current_account_id.get() or "unknown",
            issue=issue,
            priority=priority,
        )
        saved = True
    except Exception as e:
        print(f"Warning: Could not save ticket: {e}")
        saved = False

    return {
        "ticket_id": ticket_id,
        "status": "open",
        "priority": priority,
        "issue_summary": issue,
        "estimated_resolution": eta_map[priority],
        "saved_to_database": saved,
        "message": f"Ticket {ticket_id} created{' and saved' if saved else ' (offline)'}. A support agent will contact you within {eta_map[priority]}.",
    }


# ─────────────────────────────────────────────────────────────
# Export
# ─────────────────────────────────────────────────────────────
ALL_TOOLS = [
    get_electricity_bills,
    get_electricity_account,
    get_water_bills,
    get_gas_bills,
    get_municipal_bills,
    get_payment_history,
    check_payment_by_transaction,
    get_service_requests,
    create_service_request,
    create_support_ticket,
]
