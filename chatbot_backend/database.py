"""
database.py - Supabase PostgreSQL connection for the billing chatbot.
Connects to your existing municipal utility billing database.
Covers: electricity_bills, water_bills, gas_bills, municipal_bills,
        payments, service_requests, electricity_accounts,
        support_tickets, complaints, ocr_uploads, chat_sessions
"""

import os
import uuid
import psycopg2
import psycopg2.extras
from dotenv import load_dotenv

load_dotenv()


# ─────────────────────────────────────────────────────────────
# Connection
# ─────────────────────────────────────────────────────────────
def get_connection():
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL is not set in your .env file.")
    conn = psycopg2.connect(database_url, sslmode="require")
    return conn


# ─────────────────────────────────────────────────────────────
# Init — only creates tables that don't already exist
# ─────────────────────────────────────────────────────────────
def init_db():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS support_tickets (
            id          TEXT PRIMARY KEY,
            user_id     TEXT NOT NULL,
            account_id  TEXT NOT NULL,
            issue       TEXT NOT NULL,
            priority    TEXT NOT NULL DEFAULT 'medium',
            status      TEXT NOT NULL DEFAULT 'open',
            created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS chat_sessions (
            id          TEXT PRIMARY KEY,
            user_id     TEXT NOT NULL,
            messages    JSONB NOT NULL DEFAULT '[]',
            created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS ocr_uploads (
            id              SERIAL PRIMARY KEY,
            user_id         TEXT NOT NULL,
            file_name       TEXT NOT NULL,
            chars_extracted INT,
            uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    """)

    conn.commit()
    cur.close()
    conn.close()
    print("Database tables ready.")


# ─────────────────────────────────────────────────────────────
# ELECTRICITY
# ─────────────────────────────────────────────────────────────
def get_electricity_bills(citizen_id: str) -> list:
    """
    Gets electricity bills for a citizen by joining
    electricity_accounts -> electricity_bills.
    """
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT
            eb."billId", eb."billNumber", eb."billingPeriod",
            eb."billingStartDate", eb."billingEndDate",
            eb."unitsConsumed", eb."previousReading", eb."currentReading",
            eb."energyCharges", eb."fixedCharges", eb."demandCharges",
            eb."taxAmount", eb."totalAmount", eb."dueDate",
            eb.status, eb."createdAt",
            ea."consumerNumber", ea."connectionType"
        FROM electricity_bills eb
        JOIN electricity_accounts ea ON eb."accountId" = ea."accountId"
        WHERE ea."citizenId" = %s
        ORDER BY eb."createdAt" DESC
        LIMIT 10;
    """, (citizen_id,))
    bills = [dict(row) for row in cur.fetchall()]
    cur.close()
    conn.close()
    return bills


def get_electricity_account(citizen_id: str) -> dict:
    """Gets electricity account details for a citizen."""
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT * FROM electricity_accounts
        WHERE "citizenId" = %s LIMIT 1;
    """, (citizen_id,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    return dict(row) if row else {}


# ─────────────────────────────────────────────────────────────
# WATER
# ─────────────────────────────────────────────────────────────
def get_water_bills(citizen_id: str) -> list:
    """Gets water bills for a citizen."""
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT
            wb."billId", wb."billNumber", wb."billingPeriod",
            wb."billingStartDate", wb."billingEndDate",
            wb."unitsConsumed", wb."previousReading", wb."currentReading",
            wb."waterCharges", wb."sewerageCharges", wb."fixedCharges",
            wb."taxAmount", wb."totalAmount", wb."dueDate",
            wb.status, wb."createdAt",
            wa."consumerNumber", wa."connectionType", wa."meterNumber"
        FROM water_bills wb
        JOIN water_accounts wa ON wb."accountId" = wa."accountId"
        WHERE wa."citizenId" = %s
        ORDER BY wb."createdAt" DESC
        LIMIT 10;
    """, (citizen_id,))
    bills = [dict(row) for row in cur.fetchall()]
    cur.close()
    conn.close()
    return bills


# ─────────────────────────────────────────────────────────────
# GAS
# ─────────────────────────────────────────────────────────────
def get_gas_bills(citizen_id: str) -> list:
    """Gets gas bills for a citizen."""
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT
            gb."billId", gb."billNumber", gb."billingPeriod",
            gb."billingStartDate", gb."billingEndDate",
            gb."unitsConsumed", gb."previousReading", gb."currentReading",
            gb."gasCharges", gb."fixedCharges", gb."taxAmount",
            gb."totalAmount", gb."dueDate", gb.status, gb."createdAt",
            ga."consumerNumber", ga."connectionType", ga."gasType"
        FROM gas_bills gb
        JOIN gas_accounts ga ON gb."accountId" = ga."accountId"
        WHERE ga."citizenId" = %s
        ORDER BY gb."createdAt" DESC
        LIMIT 10;
    """, (citizen_id,))
    bills = [dict(row) for row in cur.fetchall()]
    cur.close()
    conn.close()
    return bills


# ─────────────────────────────────────────────────────────────
# MUNICIPAL
# ─────────────────────────────────────────────────────────────
def get_municipal_bills(citizen_id: str) -> list:
    """Gets municipal bills for a citizen."""
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT
            mb."billId", mb."billNumber", mb."billingPeriod",
            mb."financialYear", mb."propertyTax", mb."waterTax",
            mb."sewerageTax", mb."garbageTax", mb."educationCess",
            mb."otherCharges", mb."totalAmount", mb."dueDate",
            mb.status, mb."createdAt",
            ma."propertyTaxNumber", ma."propertyType", ma."propertyArea"
        FROM municipal_bills mb
        JOIN municipal_accounts ma ON mb."accountId" = ma."accountId"
        WHERE ma."citizenId" = %s
        ORDER BY mb."createdAt" DESC
        LIMIT 10;
    """, (citizen_id,))
    bills = [dict(row) for row in cur.fetchall()]
    cur.close()
    conn.close()
    return bills


# ─────────────────────────────────────────────────────────────
# PAYMENTS
# ─────────────────────────────────────────────────────────────
def get_payments(citizen_id: str) -> list:
    """Gets recent payments for a citizen across all bill types."""
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT
            p."paymentId", p."transactionRef", p.gateway,
            p.amount, p.status, p."paidAt", p."billType",
            p."electricityBillId", p."gasBillId",
            p."municipalBillId", p."waterBillId"
        FROM payments p
        JOIN bills b ON p."billId" = b."billId"
        JOIN electricity_accounts ea ON b."accountId" = ea."accountId"
        WHERE ea."citizenId" = %s
        ORDER BY p."paidAt" DESC
        LIMIT 10;
    """, (citizen_id,))
    payments = [dict(row) for row in cur.fetchall()]
    cur.close()
    conn.close()
    return payments


def get_payment_by_transaction(transaction_ref: str) -> dict:
    """Gets a specific payment by transaction reference."""
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT * FROM payments
        WHERE "transactionRef" = %s LIMIT 1;
    """, (transaction_ref,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    return dict(row) if row else {}


# ─────────────────────────────────────────────────────────────
# SERVICE REQUESTS
# ─────────────────────────────────────────────────────────────
def get_service_requests(citizen_id: str) -> list:
    """Gets all service requests for a citizen."""
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT
            "requestId", "serviceType", "requestType",
            status, details, "createdAt", "updatedAt"
        FROM service_requests
        WHERE "citizenId" = %s
        ORDER BY "createdAt" DESC
        LIMIT 10;
    """, (citizen_id,))
    requests = [dict(row) for row in cur.fetchall()]
    cur.close()
    conn.close()
    return requests


def create_service_request(citizen_id: str, service_type: str, request_type: str, details: dict) -> dict:
    """Creates a new service request."""
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    import json
    cur.execute("""
        INSERT INTO service_requests
            ("citizenId", "serviceType", "requestType", status, details, "createdAt", "updatedAt")
        VALUES (%s, %s, %s, 'pending', %s, NOW(), NOW())
        RETURNING *;
    """, (citizen_id, service_type, request_type, json.dumps(details)))
    req = dict(cur.fetchone())
    conn.commit()
    cur.close()
    conn.close()
    return req


# ─────────────────────────────────────────────────────────────
# CITIZEN
# ─────────────────────────────────────────────────────────────
def get_citizen(citizen_id: str) -> dict:
    """Gets citizen profile by aadharNumber or citizenId."""
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT "aadharNumber", "fullName", "mobileNumber", email,
               address, "isActive", "isVerified", "createdAt"
        FROM citizens
        WHERE "aadharNumber" = %s LIMIT 1;
    """, (citizen_id,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    return dict(row) if row else {}


# ─────────────────────────────────────────────────────────────
# SUPPORT TICKETS
# ─────────────────────────────────────────────────────────────
def save_to_support_tickets(ticket_id, user_id, account_id, issue, priority):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        INSERT INTO support_tickets
            (id, user_id, account_id, issue, priority, status, created_at, updated_at)
        VALUES (%s, %s, %s, %s, %s, 'open', NOW(), NOW())
        RETURNING *;
    """, (ticket_id, user_id, account_id, issue, priority))
    ticket = dict(cur.fetchone())
    conn.commit()
    cur.close()
    conn.close()
    return ticket


def save_to_complaints(user_id, issue, priority, ticket_id):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    complaint_uuid = str(uuid.uuid4())
    complaint_number = f"CMP-{ticket_id[-5:]}"
    cur.execute("""
        INSERT INTO complaints
            ("complaintId", "complaintNumber", "citizenId", "serviceType",
             description, status, priority, "complaintType", title,
             "createdAt", "updatedAt")
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        RETURNING *;
    """, (
        complaint_uuid, complaint_number, user_id,
        'billing', issue, 'open', priority,
        'chatbot', f"Chatbot Ticket: {issue[:80]}",
    ))
    complaint = dict(cur.fetchone())
    conn.commit()
    cur.close()
    conn.close()
    return complaint


def create_ticket(ticket_id, user_id, account_id, issue, priority):
    """Saves to BOTH support_tickets and complaints."""
    result = {}
    try:
        result["support_ticket"] = save_to_support_tickets(ticket_id, user_id, account_id, issue, priority)
        print(f"Saved to support_tickets: {ticket_id}")
    except Exception as e:
        print(f"support_tickets insert failed: {e}")
        result["support_ticket_error"] = str(e)
    try:
        result["complaint"] = save_to_complaints(user_id, issue, priority, ticket_id)
        print(f"Saved to complaints")
    except Exception as e:
        print(f"complaints insert failed: {e}")
        result["complaint_error"] = str(e)
    return result


def get_tickets(user_id):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT * FROM support_tickets
        WHERE user_id = %s ORDER BY created_at DESC;
    """, (user_id,))
    tickets = [dict(row) for row in cur.fetchall()]
    cur.close()
    conn.close()
    return tickets


# ─────────────────────────────────────────────────────────────
# OCR UPLOADS
# ─────────────────────────────────────────────────────────────
def log_ocr_upload(user_id, file_name, chars_extracted):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO ocr_uploads (user_id, file_name, chars_extracted)
        VALUES (%s, %s, %s);
    """, (user_id, file_name, chars_extracted))
    conn.commit()
    cur.close()
    conn.close()


# ─────────────────────────────────────────────────────────────
# Test
# ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("Testing Supabase connection...")
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("SELECT version();")
        print(f"Connected! {cur.fetchone()[0][:50]}")
        cur.close()
        conn.close()
        init_db()
        print("All done!")
    except Exception as e:
        print(f"Connection failed: {e}")
        print("\nCheck:")
        print("  1. DATABASE_URL in .env has no spaces around the = sign")
        print("  2. Use the pooler URL from Supabase Connect button")
        print("  3. Your Supabase project is active and not paused")
