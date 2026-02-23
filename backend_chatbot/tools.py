"""
tools.py — LangChain @tool definitions for the billing chatbot.
Each tool is a real LangChain tool using the @tool decorator.
Swap the mock implementations with your real DB/API calls in production.
"""

import random
from datetime import datetime, timedelta
from langchain_core.tools import tool


# ─────────────────────────────────────────────────────────────
# Mock database  (replace with real DB queries in production)
# ─────────────────────────────────────────────────────────────
MOCK_INVOICES = {
    "INV-001": {"id": "INV-001", "amount": 1250.00, "date": "2025-01-15", "status": "paid",   "due": "2025-01-30", "description": "Monthly Cloud Subscription"},
    "INV-002": {"id": "INV-002", "amount": 340.50,  "date": "2025-02-01", "status": "unpaid", "due": "2025-02-15", "description": "API Usage - January"},
    "INV-003": {"id": "INV-003", "amount": 89.99,   "date": "2025-02-10", "status": "overdue","due": "2025-02-20", "description": "Support Plan - Basic"},
}

MOCK_TRANSACTIONS = {
    "TXN-7821": {"id": "TXN-7821", "amount": 1250.00, "status": "success", "method": "Visa •••• 4242", "date": "2025-01-28"},
    "TXN-7930": {"id": "TXN-7930", "amount": 340.50,  "status": "failed",  "method": "Mastercard •••• 8888", "date": "2025-02-12", "error": "Insufficient funds"},
    "TXN-8010": {"id": "TXN-8010", "amount": 89.99,   "status": "pending", "method": "Bank Transfer", "date": "2025-02-18"},
}

MOCK_PAYMENT_METHODS = ["Visa •••• 4242", "Mastercard •••• 8888", "UPI: user@bank", "Net Banking: HDFC"]
MOCK_BALANCE = 2450.75


# ─────────────────────────────────────────────────────────────
# LangChain Tools
# ─────────────────────────────────────────────────────────────

@tool
def get_invoice(invoice_id: str) -> dict:
    """
    Fetch invoice details and a secure download link for a specific invoice.
    Pass 'all' as invoice_id to list all invoices on the account.
    Returns invoice metadata and a signed download URL.
    """
    # --- Production: replace with your billing system query ---
    # from your_db import Invoice
    # invoice = Invoice.objects.get(id=invoice_id, user=current_user)
    # signed_url = s3_client.generate_presigned_url(...)

    if invoice_id.lower() == "all":
        return {
            "invoices": list(MOCK_INVOICES.values()),
            "total": len(MOCK_INVOICES),
        }

    invoice = MOCK_INVOICES.get(invoice_id)
    if not invoice:
        return {"error": f"Invoice '{invoice_id}' not found. Please check the invoice ID."}

    # Simulate a signed S3 URL expiring in 15 minutes
    expiry = (datetime.utcnow() + timedelta(minutes=15)).strftime("%Y%m%dT%H%M%SZ")
    return {
        **invoice,
        "download_url": f"https://billing.example.com/invoices/{invoice_id}/download?expires={expiry}&sig=mock_sig",
        "url_expires_in": "15 minutes",
    }


@tool
def check_payment_status(transaction_id: str) -> dict:
    """
    Check the current status of a payment transaction by its transaction ID.
    Returns status, amount, payment method used, and any error details.
    """
    # --- Production: replace with Stripe/Razorpay/PayU API call ---
    # import stripe
    # charge = stripe.Charge.retrieve(transaction_id)
    # return {"status": charge.status, "amount": charge.amount / 100, ...}

    txn = MOCK_TRANSACTIONS.get(transaction_id)
    if not txn:
        return {"error": f"Transaction '{transaction_id}' not found."}
    return txn


@tool
def get_payment_methods() -> dict:
    """
    List all saved payment methods on the user's account.
    Returns a list of masked payment method names (cards, UPI, bank accounts).
    """
    # --- Production: replace with Stripe customer.list_payment_methods() ---
    # import stripe
    # methods = stripe.PaymentMethod.list(customer=user.stripe_id, type="card")

    return {
        "payment_methods": MOCK_PAYMENT_METHODS,
        "count": len(MOCK_PAYMENT_METHODS),
        "default": MOCK_PAYMENT_METHODS[0],
    }


@tool
def get_account_balance() -> dict:
    """
    Get the user's current account balance, total pending dues, and overdue invoice count.
    """
    # --- Production: query your accounting/billing system ---
    pending = sum(i["amount"] for i in MOCK_INVOICES.values() if i["status"] != "paid")
    overdue = [i for i in MOCK_INVOICES.values() if i["status"] == "overdue"]

    return {
        "available_balance": MOCK_BALANCE,
        "pending_dues": round(pending, 2),
        "overdue_count": len(overdue),
        "overdue_invoices": [i["id"] for i in overdue],
        "currency": "USD",
    }


@tool
def upload_invoice_proof(invoice_id: str) -> dict:
    """
    Generate a secure, time-limited upload URL so the user can submit payment proof
    (receipt, bank screenshot, etc.) for a specific invoice.
    Returns a presigned upload URL with instructions.
    """
    # --- Production: generate a real S3 presigned PUT URL ---
    # upload_url = s3_client.generate_presigned_url(
    #     "put_object",
    #     Params={"Bucket": "payment-proofs", "Key": f"{user_id}/{invoice_id}/{uuid4()}"},
    #     ExpiresIn=900,
    # )

    if invoice_id not in MOCK_INVOICES:
        return {"error": f"Invoice '{invoice_id}' not found."}

    expiry = (datetime.utcnow() + timedelta(minutes=15)).strftime("%Y%m%dT%H%M%SZ")
    return {
        "upload_url": f"https://billing.example.com/upload?invoice={invoice_id}&expires={expiry}&sig=mock_sig",
        "method": "PUT",
        "expires_in": "15 minutes",
        "accepted_formats": ["PDF", "PNG", "JPG", "JPEG"],
        "max_file_size": "10MB",
        "instructions": "Upload your file using an HTTP PUT request to the URL above, or use our web upload form.",
    }


@tool
def create_support_ticket(issue: str, priority: str = "medium") -> dict:
    """
    Create a support ticket for issues that cannot be resolved automatically.
    Priority must be one of: 'low', 'medium', 'high'.
    Use 'high' for payment failures or account access issues; 'low' for general questions.
    Returns a ticket ID and expected resolution time.
    """
    # --- Production: call Freshdesk/Zendesk/Jira API ---
    # import requests
    # resp = requests.post("https://your-domain.freshdesk.com/api/v2/tickets",
    #     auth=(FRESHDESK_API_KEY, "X"),
    #     json={"subject": issue, "priority": {"low":1,"medium":2,"high":3}[priority], ...})

    valid_priorities = {"low", "medium", "high"}
    if priority not in valid_priorities:
        priority = "medium"

    ticket_id = f"TKT-{random.randint(10000, 99999)}"
    eta_map = {"high": "2–4 hours", "medium": "24 hours", "low": "3 business days"}

    return {
        "ticket_id": ticket_id,
        "status": "open",
        "priority": priority,
        "issue_summary": issue,
        "estimated_resolution": eta_map[priority],
        "message": f"Ticket {ticket_id} created. A support agent will contact you within {eta_map[priority]}.",
    }


@tool
def retry_payment(invoice_id: str, payment_method: str = "") -> dict:
    """
    Attempt to retry a failed payment for a specific invoice.
    Optionally specify a different payment_method to use (e.g., 'Visa •••• 4242').
    If no method is specified, the default payment method on file will be used.
    """
    # --- Production: call Stripe/Razorpay to retry the charge ---
    # charge = stripe.PaymentIntent.create(amount=invoice.amount, currency="usd",
    #     payment_method=payment_method_id, customer=user.stripe_id, confirm=True)

    invoice = MOCK_INVOICES.get(invoice_id)
    if not invoice:
        return {"error": f"Invoice '{invoice_id}' not found."}

    if invoice["status"] == "paid":
        return {"error": f"Invoice {invoice_id} is already paid."}

    # Simulate 70% success for demo purposes
    success = random.random() > 0.3
    new_txn_id = f"TXN-{random.randint(8000, 9999)}"

    if success:
        return {
            "transaction_id": new_txn_id,
            "status": "success",
            "amount": invoice["amount"],
            "method_used": payment_method or MOCK_PAYMENT_METHODS[0],
            "message": f"Payment of ${invoice['amount']} for {invoice_id} was successful.",
        }
    else:
        return {
            "transaction_id": new_txn_id,
            "status": "failed",
            "error": "Card declined. Please try a different payment method or contact your bank.",
            "suggestion": "Use 'get_payment_methods' to see other saved methods and retry.",
        }


# ─────────────────────────────────────────────────────────────
# Export all tools as a list for the agent
# ─────────────────────────────────────────────────────────────
ALL_TOOLS = [
    get_invoice,
    check_payment_status,
    get_payment_methods,
    get_account_balance,
    upload_invoice_proof,
    create_support_ticket,
    retry_payment,
]
