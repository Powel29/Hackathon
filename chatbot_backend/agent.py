"""
agent.py — LangChain agent using Groq (free, fast, supports tool calling natively).
Groq runs Llama 3.3 70B for free with no credit card required.
Get your free key at: https://console.groq.com
"""

import os
import httpx
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage, BaseMessage
from langchain.agents import AgentExecutor, create_tool_calling_agent

from tools import ALL_TOOLS


# ─────────────────────────────────────────────────────────────
# System prompt
# ─────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """You are BillingBot, an expert support assistant for a municipal utility billing platform.
You help citizens with:
  - Electricity bills, accounts, and consumption
  - Water bills, accounts, and consumption
  - Gas bills, accounts, and consumption
  - Municipal/property tax bills
  - Payment history and transaction status
  - Service requests (new connection, meter repair, bill dispute, etc.)
  - Raising support tickets for unresolved issues

You have access to a REAL database. Always use tools to fetch live data.
Never make up bill amounts, due dates, or transaction IDs.
Be concise, professional, and empathetic.

# CALLING TOOLS:
- ONLY call tools when the user asks a specific question or requires data (e.g., "show my bills", "status of my ticket").
- Do NOT call any tools for simple greetings (e.g., "hi", "hello", "hey", "good morning"). For greetings, just respond with a polite greeting and ask how you can help.

# IMPORTANT DATA DISPLAY RULES:
- When fetching lists (bills, complaints, transactions, service requests, etc.):
  1. ONLY display the latest 5 items.
  2. For each item, show ONLY the most critical information.
  3. **FORMATTING**: Use a clean, vertical list format with emojis and clear separators. 
     Example:
     📦 **Service Request #123**
     • Type: Gas Booking
     • Status: 🟡 Pending
     • Date: 2024-02-27
     ──────────────────
  4. If there are more than 5 items in total, mention the total count but only list 5, and tell the user: "To view your complete history and full details, please use your Consumer ID ({account_id}) on our main website."

When a bill is overdue, remind the user clearly and offer to raise a service request.
If an issue cannot be resolved with tools, create a support ticket.

The authenticated citizen is: {user_name} (Account: {account_id})"""


# ─────────────────────────────────────────────────────────────
# Build the LangChain agent
# ─────────────────────────────────────────────────────────────
def build_agent(groq_api_key: str) -> AgentExecutor:
    """
    Builds a LangChain AgentExecutor using Groq's free API.
    """

    # Render outbound proxies can struggle with default http settings for Groq
    # A custom httpx client with extended timeouts and forced http/1.1 prevents APIConnectionErrors
    http_client = httpx.Client(
        http2=False,
        timeout=httpx.Timeout(60.0, connect=10.0),
        limits=httpx.Limits(max_keepalive_connections=5, max_connections=10)
    )

    llm = ChatGroq(
        model=os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
        groq_api_key=groq_api_key,
        temperature=0,
        max_tokens=1024,
        max_retries=2,
        http_client=http_client,
    )   

    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ])

    # create_tool_calling_agent is more robust for Groq than create_openai_tools_agent
    agent = create_tool_calling_agent(
        llm=llm,
        tools=ALL_TOOLS,
        prompt=prompt,
    )

    executor = AgentExecutor(
        agent=agent,
        tools=ALL_TOOLS,
        verbose=True,
        max_iterations=10,
        return_intermediate_steps=True,
        handle_parsing_errors=True,
    )   
    return executor


# ─────────────────────────────────────────────────────────────
# Convert stored message dicts -> LangChain message objects
# ─────────────────────────────────────────────────────────────
def deserialize_history(raw_history: list[dict]) -> list[BaseMessage]:
    messages: list[BaseMessage] = []
    for msg in raw_history:
        if msg["role"] == "human":
            messages.append(HumanMessage(content=msg["content"]))
        elif msg["role"] == "assistant":
            messages.append(AIMessage(content=msg["content"]))
    return messages
