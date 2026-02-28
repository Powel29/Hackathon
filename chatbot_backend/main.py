"""
main.py — FastAPI server using LangChain + Groq (free).
"""

import os
import logging
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from agent import build_agent, deserialize_history
from tools import current_citizen_id, current_account_id

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────
# App lifecycle
# ─────────────────────────────────────────────────────────────
agent_executor = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global agent_executor
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        raise RuntimeError("GROQ_API_KEY environment variable is not set.")
    # Initialize Supabase tables on startup
    try:
        from database import init_db
        init_db()
    except Exception as e:
        logger.warning(f"Database init skipped: {e}")

    agent_executor = build_agent(groq_api_key)
    logger.info("LangChain billing agent initialized with Groq (Llama 3.3 70B).")
    yield
    logger.info("Shutting down.")


app = FastAPI(
    title="Billing Chatbot API",
    description="LangChain billing chatbot using Groq free tier",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "https://nextgensevafrontend.vercel.app",
        "https://nextgensevaadmin.vercel.app",
        "https://nextgensevachatbotfrontend.vercel.app",
        os.getenv("FRONTEND_URL"),
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com data:; "
        "img-src 'self' data: https://*.googleapis.com; "
        "connect-src 'self' http://localhost:* https://nextgen-seva-backend.onrender.com https://nextgen-seva-chatbot-backend.onrender.com; "
        "frame-ancestors 'none'; "
        "object-src 'none';"
    )
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


# ─────────────────────────────────────────────────────────────
# Request / Response models
# ─────────────────────────────────────────────────────────────
class ChatMessage(BaseModel):
    role: str = Field(..., pattern="^(human|assistant)$")
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    history: list[ChatMessage] = Field(default=[], max_length=40)
    user_name: str = Field(default="John Doe")
    account_id: str = Field(default="ACC-10042")


class ToolCall(BaseModel):
    tool: str
    input: dict
    output: str


class ChatResponse(BaseModel):
    reply: str
    tool_calls: list[ToolCall] = []


# ─────────────────────────────────────────────────────────────
# Auth dependency (replace with real JWT in production)
# ─────────────────────────────────────────────────────────────
async def verify_token(authorization: Optional[str] = Header(None)):
    # For the hackathon, we return a mock user that matches our demo data
    return {"user_id": "usr_demo", "user_name": "John Doe", "account_id": "111122223333"}


# ─────────────────────────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────────────────────────
@app.post("/api/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    user: dict = Depends(verify_token),
):
    if agent_executor is None:
        raise HTTPException(status_code=503, detail="Agent not initialized")

    logger.info(f"[{user['account_id']}] User: {request.message[:80]}")

    # Set context for tools based on the actual logged-in citizen from frontend
    # In a real system, verify_token would provide the verified ID. 
    # For the hackathon, we use the account_id passed from the secure frontend.
    citizen_id = request.account_id if request.account_id != "DEMO-USER" else "111122223333"
    current_citizen_id.set(citizen_id)
    current_account_id.set(request.account_id)

    try:
        # Keep only the last 10 messages (5 exchanges) to stay within free tier token limits
        history_subset = request.history[-10:]
        chat_history = deserialize_history([m.model_dump() for m in history_subset])

        response = agent_executor.invoke({
            "input": request.message,
            "chat_history": chat_history,
            "user_name": user.get("user_name", request.user_name),
            "account_id": user.get("account_id", request.account_id),
        })

        tool_calls = []
        for action, observation in response.get("intermediate_steps", []):
            tool_calls.append(ToolCall(
                tool=action.tool,
                input=action.tool_input if isinstance(action.tool_input, dict) else {"input": str(action.tool_input)},
                output=str(observation),
            ))
            logger.info(f"  Tool: {action.tool}")

        return ChatResponse(reply=response["output"], tool_calls=tool_calls)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # Check for Rate Limit Error specifically
        err_str = str(e).lower()
        if "rate_limit_exceeded" in err_str or "429" in err_str:
            logger.warning(f"Rate limit hit: {e}")
            raise HTTPException(
                status_code=429, 
                detail="The AI is currently at its free-tier capacity. Please wait about 30-60 seconds and try again."
            )
            
        logger.error(f"Agent error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Something went wrong. Please try again.")


@app.get("/api/health")
async def health():
    return {"status": "ok", "agent_ready": agent_executor is not None}


@app.get("/api/tools")
async def list_tools():
    from tools import ALL_TOOLS
    return {"tools": [{"name": t.name, "description": t.description} for t in ALL_TOOLS]}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
