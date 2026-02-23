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
        "https://yourdomain.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
    return {"user_id": "usr_demo", "user_name": "John Doe", "account_id": "ACC-10042"}


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

    try:
        chat_history = deserialize_history([m.model_dump() for m in request.history])

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
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
