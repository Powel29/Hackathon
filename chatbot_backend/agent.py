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

    llm = ChatGroq(
        model=os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
        groq_api_key=groq_api_key,
        temperature=0,
        max_tokens=1024,
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
