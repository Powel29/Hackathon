"""
agent.py — LangChain agent using Groq (free, fast, supports tool calling natively).
Groq runs Llama 3.3 70B for free with no credit card required.
Get your free key at: https://console.groq.com
"""

import os
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage, BaseMessage
from langchain.agents import AgentExecutor, create_tool_calling_agent

from tools import ALL_TOOLS


# ─────────────────────────────────────────────────────────────
# System prompt
# ─────────────────────────────────────────────────────────────
SYSTEM_PROMPT = """You are BillingBot, an expert support assistant for a bill payment platform.
You help users with:
  - Viewing and downloading invoices
  - Uploading payment proof documents
  - Checking payment and transaction status
  - Retrying failed payments
  - Managing payment methods
  - Account balance and outstanding dues
  - Escalating complex issues via support tickets

Always use the available tools to fetch real data rather than making assumptions.
Be concise, professional, and empathetic. When a payment fails, give the user clear next steps.
Never expose full card numbers - only last 4 digits are acceptable.
If a problem cannot be solved with tools, create a support ticket and reassure the user.

The authenticated user is: {user_name} (Account: {account_id})"""


# ─────────────────────────────────────────────────────────────
# Build the LangChain agent
# ─────────────────────────────────────────────────────────────
def build_agent(groq_api_key: str) -> AgentExecutor:
    """
    Builds a LangChain AgentExecutor using Groq's free API.

    Steps:
      1. ChatGroq             - LLM backed by Groq (Llama 3.3 70B, free)
      2. ChatPromptTemplate   - system prompt + history + scratchpad
      3. create_tool_calling_agent - binds tools to the LLM
      4. AgentExecutor        - runs the think -> tool -> observe loop
    """

    # 1. Groq LLM - llama-3.3-70b-versatile is free and supports tool calling
    llm = ChatGroq(
        model=os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
        groq_api_key=groq_api_key,
        temperature=0,
        max_tokens=1024,
    )

    # 2. Prompt - must include agent_scratchpad for the tool call loop
    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}"),
        MessagesPlaceholder(variable_name="agent_scratchpad"),
    ])

    # 3. Agent - LangChain wires tool schemas into the LLM automatically
    agent = create_tool_calling_agent(
        llm=llm,
        tools=ALL_TOOLS,
        prompt=prompt,
    )

    # 4. Executor - handles the agentic loop (tool call -> observe -> next step)
    executor = AgentExecutor(
        agent=agent,
        tools=ALL_TOOLS,
        verbose=True,
        max_iterations=6,
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
