import { useState, useRef, useEffect } from "react";

// ── Config ────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ── API client ────────────────────────────────────────────────
async function sendChatMessage({ message, history, userToken }) {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(userToken ? { Authorization: `Bearer ${userToken}` } : {}),
    },
    body: JSON.stringify({
      message,
      history: history.map(m => ({ role: m.role, content: m.content })),
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Server error: ${res.status}`);
  }

  return res.json(); // { reply: string, tool_calls: ToolCall[] }
}

// ── Sub-components ────────────────────────────────────────────
function ToolCallBadge({ toolCall }) {
  const [open, setOpen] = useState(false);
  const icons = {
    get_invoice: "🧾",
    check_payment_status: "🔍",
    get_payment_methods: "💳",
    get_account_balance: "💰",
    upload_invoice_proof: "📤",
    create_support_ticket: "🎫",
    retry_payment: "🔄",
  };

  return (
    <div
      onClick={() => setOpen(o => !o)}
      style={{
        background: "rgba(74,144,217,0.08)",
        border: "1px solid rgba(74,144,217,0.2)",
        borderRadius: 8,
        padding: "5px 10px",
        marginBottom: 4,
        cursor: "pointer",
        fontSize: 12,
        color: "#7fb3e0",
        fontFamily: "'DM Mono', monospace",
      }}
    >
      <span style={{ marginRight: 6 }}>{icons[toolCall.tool] || "🔧"}</span>
      {toolCall.tool}
      <span style={{ float: "right", opacity: 0.6 }}>{open ? "▲" : "▼"}</span>
      {open && (
        <pre style={{
          marginTop: 6, fontSize: 11, color: "#a0aec0",
          whiteSpace: "pre-wrap", wordBreak: "break-all",
          background: "rgba(0,0,0,0.2)", borderRadius: 4, padding: 6,
        }}>
          IN:  {JSON.stringify(toolCall.input, null, 2)}
          {"\n"}
          OUT: {toolCall.output.slice(0, 300)}{toolCall.output.length > 300 ? "…" : ""}
        </pre>
      )}
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "human";
  return (
    <div className="chat-bubble" style={{
      display: "flex",
      flexDirection: isUser ? "row-reverse" : "row",
      gap: 10,
      alignItems: "flex-start",
    }}>
      {/* Avatar */}
      <div style={{
        width: 30, height: 30, borderRadius: 8, flexShrink: 0, marginTop: 2,
        background: isUser ? "#252d3d" : "linear-gradient(135deg, #1a56a0 0%, #4a90d9 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: isUser ? 13 : 16, fontWeight: 700, color: isUser ? "#718096" : "white",
      }}>
        {isUser ? "J" : "💳"}
      </div>

      <div style={{ maxWidth: "75%", display: "flex", flexDirection: "column", gap: 4 }}>
        {/* Tool calls (collapsed by default, expandable) */}
        {!isUser && msg.toolCalls?.length > 0 && (
          <div style={{ marginBottom: 4 }}>
            {msg.toolCalls.map((tc, i) => <ToolCallBadge key={i} toolCall={tc} />)}
          </div>
        )}

        {/* Message bubble */}
        <div style={{
          background: isUser
            ? "linear-gradient(135deg, #1a56a0 0%, #2563a8 100%)"
            : "#1e2635",
          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          padding: "12px 16px",
          color: "#e2e8f0",
          fontSize: 14,
          lineHeight: 1.65,
          border: isUser ? "none" : "1px solid #252d3d",
          boxShadow: isUser ? "0 4px 12px rgba(26,86,160,0.3)" : "none",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}>
          {msg.content}
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────
export default function BillingChatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("Thinking...");
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const suggestions = [
    "Show all my invoices",
    "Download invoice INV-002",
    "Check transaction TXN-7930",
    "What payment methods do I have?",
    "Upload proof for INV-003",
    "What's my account balance?",
    "Retry payment for INV-002",
    "My payment keeps failing",
  ];

  async function handleSend(text = input) {
    if (!text.trim() || loading) return;
    setError(null);
    const userMsg = { role: "human", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setLoadingLabel("Thinking...");

    // Simulate tool activity label rotation
    const labels = ["Calling tool...", "Fetching data...", "Processing...", "Almost done..."];
    let li = 0;
    const labelTimer = setInterval(() => {
      setLoadingLabel(labels[Math.min(li++, labels.length - 1)]);
    }, 1800);

    try {
      const data = await sendChatMessage({
        message: text,
        history: messages,
        userToken: null, // replace with real JWT
      });

      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.reply,
        toolCalls: data.tool_calls || [],
      }]);
    } catch (err) {
      setError(err.message);
    } finally {
      clearInterval(labelTimer);
      setLoading(false);
      setLoadingLabel("Thinking...");
      inputRef.current?.focus();
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f1117 0%, #141822 50%, #0f1117 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      padding: 20,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #2a3040; border-radius: 2px; }
        .chat-bubble { animation: slideIn 0.22s ease-out; }
        @keyframes slideIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .suggestion-chip:hover { background: rgba(99,179,237,0.12) !important; border-color: #63b3ed !important; color: #90cdf4 !important; }
        .send-btn:hover:not(:disabled) { background: #4a90d9 !important; transform: scale(1.05); }
        .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        textarea:focus { outline: none; border-color: #4a90d9 !important; box-shadow: 0 0 0 3px rgba(74,144,217,0.15); }
        .dot { animation: blink 1.2s ease-in-out infinite; }
        .dot:nth-child(2){animation-delay:.2s} .dot:nth-child(3){animation-delay:.4s}
        @keyframes blink { 0%,80%,100%{opacity:.2} 40%{opacity:1} }
      `}</style>

      <div style={{
        width: "100%", maxWidth: 740, height: "90vh", maxHeight: 820,
        background: "#161b27", borderRadius: 20,
        border: "1px solid #1e2635", display: "flex", flexDirection: "column",
        overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
      }}>

        {/* Header */}
        <div style={{
          padding: "18px 24px", borderBottom: "1px solid #1e2635",
          background: "#0e1521", display: "flex", alignItems: "center", gap: 14,
        }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
            background: "linear-gradient(135deg, #1a56a0, #4a90d9)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, boxShadow: "0 4px 12px rgba(74,144,217,0.3)",
          }}>💳</div>
          <div>
            <div style={{ color: "#e2e8f0", fontSize: 15, fontWeight: 600 }}>BillingBot</div>
            <div style={{ color: "#4a90d9", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#48bb78", display: "inline-block" }} />
              LangChain · Groq Llama 3.3 70B · 7 Tools Active
            </div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <div style={{
              background: "rgba(72,187,120,0.1)", border: "1px solid rgba(72,187,120,0.2)",
              borderRadius: 8, padding: "4px 10px", color: "#68d391", fontSize: 11, fontWeight: 500,
            }}>
              Live Backend
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>

          {messages.length === 0 && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>💳</div>
                <div style={{ color: "#e2e8f0", fontSize: 18, fontWeight: 600, marginBottom: 6 }}>How can I help you today?</div>
                <div style={{ color: "#4a5568", fontSize: 13 }}>Powered by LangChain + Claude with 7 real tools</div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: 520 }}>
                {suggestions.map(s => (
                  <button key={s} className="suggestion-chip" onClick={() => handleSend(s)} style={{
                    background: "rgba(74,144,217,0.08)", border: "1px solid rgba(74,144,217,0.2)",
                    borderRadius: 20, padding: "7px 14px", color: "#7fb3e0",
                    fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
                    transition: "all 0.15s",
                  }}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => <Message key={i} msg={msg} />)}

          {loading && (
            <div className="chat-bubble" style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                background: "linear-gradient(135deg, #1a56a0, #4a90d9)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
              }}>💳</div>
              <div style={{
                background: "#1e2635", borderRadius: "18px 18px 18px 4px",
                border: "1px solid #252d3d", padding: "12px 16px",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <div style={{ display: "flex", gap: 4 }}>
                  {[0,1,2].map(i => <div key={i} className="dot" style={{ width:7, height:7, borderRadius:"50%", background:"#4a5568" }} />)}
                </div>
                <span style={{ color: "#4a5568", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>{loadingLabel}</span>
              </div>
            </div>
          )}

          {error && (
            <div style={{
              background: "rgba(245,101,101,0.08)", border: "1px solid rgba(245,101,101,0.2)",
              borderRadius: 10, padding: "10px 14px", color: "#fc8181", fontSize: 13,
            }}>
              ⚠️ {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: "14px 20px", borderTop: "1px solid #1e2635", background: "#0e1521" }}>
          {messages.length > 0 && (
            <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
              {suggestions.slice(0, 4).map(s => (
                <button key={s} className="suggestion-chip" onClick={() => handleSend(s)} style={{
                  background: "transparent", border: "1px solid #1e2635",
                  borderRadius: 14, padding: "4px 10px", color: "#4a5568",
                  fontSize: 11, cursor: "pointer", fontFamily: "inherit",
                  transition: "all 0.15s",
                }}>{s}</button>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about invoices, payments, or account..."
              rows={1}
              style={{
                flex: 1, background: "#161b27", border: "1px solid #1e2635",
                borderRadius: 12, padding: "12px 16px", color: "#e2e8f0",
                fontSize: 14, fontFamily: "inherit", resize: "none", lineHeight: 1.5,
                transition: "all 0.2s",
              }}
              onInput={e => {
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
            />
            <button
              className="send-btn"
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              style={{
                width: 44, height: 44, borderRadius: 12, border: "none",
                background: "#2563a8", cursor: "pointer", fontSize: 18, color: "white",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s", flexShrink: 0,
              }}
            >↑</button>
          </div>
          <div style={{ textAlign: "center", marginTop: 8, color: "#2d3748", fontSize: 11 }}>
            Secured · LangChain + Groq (Free) · Tool calls visible above each response
          </div>
        </div>
      </div>
    </div>
  );
}
