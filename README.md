# Billing Chatbot — LangChain + Claude

A production-ready bill payment chatbot using **real LangChain** (`langchain`, `langchain-anthropic`)
with a FastAPI backend and React frontend.

## Architecture

```
React Frontend (Vite/Next.js)
        │  POST /api/chat  (JSON)
        ▼
FastAPI Backend  (main.py)
        │
        ▼
LangChain AgentExecutor
  ├── ChatAnthropic (Claude claude-sonnet-4-20250514)
  ├── create_tool_calling_agent
  └── Tools (@tool decorated functions)
        ├── get_invoice
        ├── check_payment_status
        ├── get_payment_methods
        ├── get_account_balance
        ├── upload_invoice_proof
        ├── create_support_ticket
        └── retry_payment
```

## Quick Start

### 1. Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Set your API key
cp .env.example .env
# Edit .env and set ANTHROPIC_API_KEY=sk-ant-...

# Run the server
python main.py
# → http://localhost:8000
# → Docs at http://localhost:8000/docs
```

### 2. Frontend

```bash
cd frontend

# Install (using Vite + React)
npm create vite@latest . -- --template react
npm install

# Set backend URL
echo "VITE_API_URL=http://localhost:8000" > .env.local

# Copy the chatbot component
cp src/BillingChatbot.jsx src/App.jsx  # or import it in your app

# Run
npm run dev
# → http://localhost:3000
```

## Connecting Real Data

Each tool in `backend/tools.py` has comments showing exactly where to replace mock data
with real API calls. Example for `get_invoice`:

```python
@tool
def get_invoice(invoice_id: str) -> dict:
    """Fetch invoice details and a secure download link."""
    # Replace mock lookup with:
    invoice = db.session.query(Invoice).filter_by(id=invoice_id, user_id=current_user_id).first()
    signed_url = s3.generate_presigned_url("get_object", Params={"Bucket": "invoices", "Key": invoice.s3_key}, ExpiresIn=900)
    return {"id": invoice.id, "amount": float(invoice.amount), "download_url": signed_url}
```

## Key LangChain Concepts Used

| Concept | File | Purpose |
|---|---|---|
| `@tool` decorator | `tools.py` | Defines tools with type-safe inputs |
| `ChatAnthropic` | `agent.py` | LLM backed by Claude |
| `ChatPromptTemplate` | `agent.py` | System prompt + history + scratchpad |
| `MessagesPlaceholder` | `agent.py` | Slots for chat history and tool scratchpad |
| `create_tool_calling_agent` | `agent.py` | Binds tools to the LLM |
| `AgentExecutor` | `agent.py` | Runs the think → tool → observe loop |

## Verify Tools are Registered

```
GET http://localhost:8000/api/tools
```

Returns all 7 tools with their names and descriptions.

## Production Checklist

- [ ] Replace `verify_token()` in `main.py` with real JWT validation
- [ ] Scope all tool DB queries to `current_user_id` (prevent data leakage)
- [ ] Replace all mock data in `tools.py` with real API calls
- [ ] Add rate limiting (e.g., `slowapi` + Redis)
- [ ] Set `CORS` origins to your real domain only
- [ ] Enable LangSmith tracing: set `LANGCHAIN_TRACING_V2=true` in `.env`
- [ ] Add `LANGCHAIN_API_KEY` to `.env` for LangSmith dashboard
- [ ] Deploy backend on Railway / Render / AWS ECS
- [ ] Deploy frontend on Vercel / Netlify
