import { useState, useRef, useEffect } from "react";
import { useKioskStore } from "../../store/useKioskStore";
import { tokenStrategy } from "../../core/security/storagePolicy";

// Use port 8000 for chatbot backend, 5001 for main backend
const API_BASE = import.meta.env.VITE_CHATBOT_API_URL || "http://localhost:8000";

// Load Tesseract.js from CDN on demand
let tesseractLoaded = false;
async function loadTesseract() {
    if (tesseractLoaded || window.Tesseract) { tesseractLoaded = true; return; }
    await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
    tesseractLoaded = true;
}

// Load PDF.js from CDN on demand
let pdfjsLoaded = false;
async function loadPdfJs() {
    if (pdfjsLoaded || window.pdfjsLib) { pdfjsLoaded = true; return; }
    await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    pdfjsLoaded = true;
}

async function pdfToImage(file) {
    await loadPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(1); // Render first page
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    await page.render({ canvasContext: context, viewport: viewport }).promise;
    return canvas.toDataURL('image/png');
}

async function runOCR(file, onProgress) {
    try {
        let source = file;
        if (file.type === "application/pdf") {
            onProgress(2);
            source = await pdfToImage(file);
        }

        onProgress(5);
        await loadTesseract();
        if (!window.Tesseract) throw new Error("Tesseract.js failed to load.");

        const { data: { text } } = await window.Tesseract.recognize(source, 'eng', {
            logger: m => {
                let p = 5;
                if (m.status === "loading tesseract core") p = 5 + (m.progress * 15);
                else if (m.status === "loading language traineddata") p = 20 + (m.progress * 15);
                else if (m.status === "initializing api") p = 35 + (m.progress * 10);
                else if (m.status === "recognizing text") p = 45 + (m.progress * 55);
                else p = m.progress * 100;
                onProgress(Math.round(Math.max(p, 5)));
            },
        });

        if (!text || text.trim().length === 0) throw new Error("No text detected.");
        return text.trim();
    } catch (err) {
        console.error("OCR Error:", err);
        throw err;
    }
}

async function sendChatMessage({ message, history, user_name, account_id, token }) {
    const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
            message,
            history: history.map(m => ({ role: m.role, content: m.content })),
            user_name,
            account_id
        }),
    });
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    return res.json();
}

function OCRProgress({ fileName, progress }) {
    return (
        <div className="chatbot-bubble-row" style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 16 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: "linear-gradient(135deg, #553c9a, #b794f4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🔍</div>
            <div style={{ background: "#1e2635", borderRadius: "18px 18px 18px 4px", border: "1px solid #252d3d", padding: "14px 16px", flex: 1 }}>
                <div style={{ color: "#a0aec0", fontSize: 12, marginBottom: 8 }}>Scanning: {fileName}</div>
                <div style={{ background: "#252d3d", borderRadius: 6, height: 6, overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 6, background: "linear-gradient(90deg, #553c9a, #b794f4)", width: `${progress}%`, transition: "width 0.3s ease" }} />
                </div>
                <div style={{ color: "#b794f4", fontSize: 11, marginTop: 6 }}>OCR in progress... {progress}%</div>
            </div>
        </div>
    );
}

function ToolCallBadge({ toolCall }) {
    const [open, setOpen] = useState(false);
    const icons = {
        get_electricity_bills: "⚡", get_water_bills: "💧",
        get_gas_bills: "🔥", get_municipal_bills: "🏠",
        get_payment_history: "📜", create_service_request: "🎫",
        get_complaints: "📁", get_connection_applications: "📡",
        get_active_alerts: "⚠️", create_support_ticket: "🎟️"
    };

    return (
        <div
            onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
            style={{
                background: open ? "rgba(45, 55, 75, 0.5)" : "rgba(66, 153, 225, 0.08)",
                border: `1px solid ${open ? "rgba(255,255,255,0.1)" : "rgba(66, 153, 225, 0.15)"}`,
                borderRadius: "10px", padding: "8px 12px", marginBottom: "8px",
                cursor: "pointer", transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                userSelect: "none",
                boxShadow: open ? "0 4px 12px rgba(0,0,0,0.2)" : "none"
            }}
            onMouseEnter={(e) => { if (!open) e.currentTarget.style.background = 'rgba(66, 153, 225, 0.12)'; }}
            onMouseLeave={(e) => { if (!open) e.currentTarget.style.background = 'rgba(66, 153, 225, 0.08)'; }}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "12px", color: open ? "#fff" : "#90cdf4" }}>
                    <span style={{ fontSize: "14px" }}>{icons[toolCall.tool] || "🔧"}</span>
                    <span style={{ fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>{toolCall.tool}</span>
                </div>
                <span style={{ fontSize: "10px", opacity: 0.5, color: "#fff" }}>{open ? "▲" : "▼"}</span>
            </div>

            {open && (
                <div style={{ marginTop: "12px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px" }} className="message-fade-in">
                    <div style={{ fontSize: "10px", color: "#64748b", marginBottom: "6px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Arguments</div>
                    <pre style={{
                        fontSize: "11px", color: "#e2e8f0", background: "rgba(0,0,0,0.25)",
                        padding: "10px", borderRadius: "8px", whiteSpace: "pre-wrap", wordBreak: "break-all",
                        fontFamily: "'JetBrains Mono', monospace", border: "1px solid rgba(255,255,255,0.03)"
                    }}>
                        {JSON.stringify(toolCall.input, null, 2)}
                    </pre>
                    <div style={{ fontSize: "10px", color: "#64748b", margin: "12px 0 6px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Response</div>
                    <pre style={{
                        fontSize: "11px", color: "#48bb78", background: "rgba(0,0,0,0.25)",
                        padding: "10px", borderRadius: "8px", whiteSpace: "pre-wrap", wordBreak: "break-all",
                        fontFamily: "'JetBrains Mono', monospace", border: "1px solid rgba(255,255,255,0.03)"
                    }}>
                        {toolCall.output?.slice(0, 500)}{toolCall.output?.length > 500 ? "..." : ""}
                    </pre>
                </div>
            )}
        </div>
    );
}

function Message({ msg }) {
    const isUser = msg.role === "human";
    return (
        <div className="chatbot-bubble-row message-fade-in" style={{
            display: "flex",
            flexDirection: isUser ? "row-reverse" : "row",
            gap: 12,
            alignItems: "flex-start",
            marginBottom: 20
        }}>
            <div style={{
                width: 32,
                height: 32,
                borderRadius: "10px",
                flexShrink: 0,
                background: isUser ? "#2d3748" : "linear-gradient(135deg, #1a56a0, #4a90d9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                color: "white",
                boxShadow: isUser ? "none" : "0 4px 8px rgba(26, 86, 160, 0.2)"
            }}>
                {isUser ? "👤" : "🤖"}
            </div>
            <div style={{ maxWidth: "85%", display: "flex", flexDirection: "column", gap: 6 }}>
                {!isUser && msg.toolCalls?.length > 0 && (
                    <div style={{ marginBottom: 4 }}>
                        {msg.toolCalls.map((tc, i) => <ToolCallBadge key={i} toolCall={tc} />)}
                    </div>
                )}
                <div style={{
                    background: isUser ? "linear-gradient(135deg, #2563a8, #1e4d8a)" : "rgba(30, 38, 53, 0.6)",
                    borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    padding: "12px 18px",
                    color: isUser ? "#fff" : "#e2e8f0",
                    fontSize: "14px",
                    lineHeight: "1.6",
                    border: isUser ? "none" : "1px solid rgba(255,255,255,0.05)",
                    whiteSpace: "pre-wrap",
                    boxShadow: isUser ? "0 4px 12px rgba(37, 99, 168, 0.2)" : "0 2px 8px rgba(0,0,0,0.1)",
                    backdropFilter: isUser ? "none" : "blur(8px)"
                }}>
                    {msg.content}
                </div>
            </div>
        </div>
    );
}

export default function BillingChatbot() {
    const { user } = useKioskStore();
    const token = tokenStrategy.getToken();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingLabel, setLoadingLabel] = useState("Thinking...");
    const [error, setError] = useState(null);
    const [ocrProgress, setOcrProgress] = useState(null);
    const bottomRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading, ocrProgress]);

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = "";
        setError(null);
        setOcrProgress({ fileName: file.name, progress: 0 });
        try {
            const text = await runOCR(file, p => setOcrProgress({ fileName: file.name, progress: p }));
            setOcrProgress(null);
            const userMsg = { role: "human", content: `Uploaded ${file.name}.` };
            setMessages(prev => [...prev, userMsg]);
            setLoading(true);
            const data = await sendChatMessage({
                message: `I uploaded "${file.name}". OCR result:\n${text.slice(0, 1000)}`,
                history: [...messages, userMsg],
                user_name: user?.name || "Citizen",
                account_id: user?.consumerId || user?.aadharNumber || "DEMO-USER",
                token: token
            });
            setMessages(prev => [...prev, { role: "assistant", content: data.reply, toolCalls: data.tool_calls || [] }]);
        } catch (err) {
            setOcrProgress(null);
            setError(err.message);
        } finally { setLoading(false); }
    };

    const handleSend = async (text = input) => {
        if (!text.trim() || loading) return;
        setInput("");
        const userMsg = { role: "human", content: text };
        setMessages(prev => [...prev, userMsg]);
        setLoading(true);
        setLoadingLabel("Thinking...");
        try {
            const data = await sendChatMessage({
                message: text,
                history: [...messages, userMsg],
                user_name: user?.name || "Citizen",
                account_id: user?.consumerId || user?.aadharNumber || "DEMO-USER",
                token: token
            });
            setMessages(prev => [...prev, { role: "assistant", content: data.reply, toolCalls: data.tool_calls || [] }]);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    return (
        <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#0e1521", color: "#e2e8f0", fontFamily: "'Inter', 'Segoe UI', sans-serif", overflow: "hidden" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
                
                .chatbot-scroll::-webkit-scrollbar { width: 5px; }
                .chatbot-scroll::-webkit-scrollbar-track { background: transparent; }
                .chatbot-scroll::-webkit-scrollbar-thumb { background: #2a3040; border-radius: 10px; }
                .chatbot-scroll::-webkit-scrollbar-thumb:hover { background: #3a4155; }

                .dot-anim { animation: blink 1.2s infinite; }
                @keyframes blink { 0%,100%{opacity:.2} 50%{opacity:1} }
                
                .capability-card {
                    background: rgba(30, 38, 53, 0.4);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(8px);
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .capability-card:hover {
                    background: rgba(45, 55, 75, 0.7);
                    border-color: #4a90d9;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                }
                .capability-card:active {
                    transform: translateY(0);
                }

                .chat-input {
                    transition: border-color 0.2s, box-shadow 0.2s;
                }
                .chat-input:focus {
                    border-color: #4a90d9 !important;
                    box-shadow: 0 0 0 2px rgba(74, 144, 217, 0.2);
                    outline: none;
                }
                
                .action-btn {
                    transition: all 0.2s;
                }
                .action-btn:hover:not(:disabled) {
                    filter: brightness(1.2);
                    transform: scale(1.05);
                }
                .action-btn:active:not(:disabled) {
                    transform: scale(0.95);
                }
                
                .message-fade-in {
                    animation: fadeIn 0.3s ease-out;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            {/* Header */}
            <div style={{
                padding: "16px 20px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                gap: 14,
                background: "rgba(14, 21, 33, 0.8)",
                backdropFilter: "blur(12px)",
                zIndex: 10,
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
            }}>
                <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #1a56a0, #4a90d9)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    boxShadow: "0 0 15px rgba(74, 144, 217, 0.3)"
                }}>💳</div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", letterSpacing: "-0.01em" }}>Billing Assistant</div>
                    <div style={{ fontSize: 11, color: "#4a90d9", display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#48bb78", boxShadow: "0 0 8px #48bb78" }} />
                        <span style={{ opacity: 0.9 }}>AI Agent · 10 Tools · OCR Ready</span>
                    </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                    <div className="dot-anim" style={{ height: 8, width: 8, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
                </div>
            </div>

            {/* Body */}
            <div className="chatbot-scroll" style={{ flex: 1, overflowY: "auto", padding: "24px 20px", scrollBehavior: "smooth" }}>
                {messages.length === 0 && (
                    <div style={{ maxWidth: 600, margin: "0 auto", padding: "40px 0" }}>
                        <div style={{ textAlign: "center", marginBottom: 40 }}>
                            <div style={{ fontSize: 48, marginBottom: 16 }}>✨</div>
                            <h2 style={{ fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 8, letterSpacing: "-0.02em" }}>
                                Hello, {user?.name?.split(' ')[0] || "there"}!
                            </h2>
                            <p style={{ fontSize: 14, color: "#94a3b8", maxWidth: 320, margin: "0 auto", lineHeight: 1.5 }}>
                                I can help you manage bills, track requests, and scan receipts using AI.
                            </p>
                        </div>

                        <div style={{ marginBottom: 32 }}>
                            <div style={{
                                fontSize: 11,
                                fontWeight: 600,
                                color: "#4a90d9",
                                textTransform: "uppercase",
                                letterSpacing: "0.1em",
                                marginBottom: 16,
                                display: "flex",
                                alignItems: "center",
                                gap: 8
                            }}>
                                <span style={{ width: 12, height: 1, background: "#4a90d9" }} />
                                What can I do?
                            </div>

                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(2, 1fr)",
                                gap: "12px"
                            }}>
                                {[
                                    { t: "Electricity", i: "⚡", p: "Show my electricity bills" },
                                    { t: "Water", i: "💧", p: "What are my water bills?" },
                                    { t: "Gas", i: "🔥", p: "Check my gas bill status" },
                                    { t: "Property", i: "🏠", p: "Show my municipal tax bills" },
                                    { t: "History", i: "📜", p: "Show my payment history" },
                                    { t: "Requests", i: "🎫", p: "List my service requests" },
                                    { t: "Complaints", i: "📁", p: "Track my complaints" },
                                    { t: "Connection", i: "📡", p: "Check connection status" },
                                    { t: "Alerts", i: "⚠️", p: "Are there any service alerts?" },
                                    { t: "Support", i: "🎟️", p: "Show my support tickets" }
                                ].map((cap, i) => (
                                    <div key={i}
                                        onClick={() => { setInput(cap.p); document.getElementById('chat-input-area')?.focus(); }}
                                        className="capability-card"
                                        style={{
                                            padding: "14px 16px",
                                            borderRadius: "14px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "12px",
                                            fontSize: "13px",
                                            color: "#f1f5f9",
                                            cursor: "pointer",
                                            fontWeight: 500
                                        }}
                                    >
                                        <span style={{ fontSize: "18px", opacity: 0.9 }}>{cap.i}</span>
                                        <span>{cap.t}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{
                            marginTop: 32,
                            color: "#90cdf4",
                            fontSize: "13px",
                            background: "rgba(74, 144, 217, 0.08)",
                            padding: "14px 18px",
                            borderRadius: "16px",
                            border: "1px dashed rgba(74, 144, 217, 0.2)",
                            display: "flex",
                            alignItems: "center",
                            gap: 12
                        }}>
                            <span style={{ fontSize: 18 }}>💡</span>
                            <span>Try: <strong>"Show my latest bills"</strong> or <strong>upload a receipt</strong> 📎</span>
                        </div>
                    </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {messages.map((m, i) => <Message key={i} msg={m} />)}
                    {ocrProgress && <OCRProgress fileName={ocrProgress.fileName} progress={ocrProgress.progress} />}
                    {loading && (
                        <div className="message-fade-in" style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 16 }}>
                            <div style={{ width: 30, height: 30, borderRadius: 8, background: "#1a56a0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🤖</div>
                            <div style={{ background: "#1e2635", borderRadius: "18px 18px 18px 4px", border: "1px solid #252d3d", padding: "12px 16px", color: "#94a3b8", fontSize: "12px" }}>
                                <span className="dot-anim">Thinking...</span>
                            </div>
                        </div>
                    )}
                </div>
                <div ref={bottomRef} style={{ height: 1 }} />
            </div>

            {/* Footer / Input */}
            <div style={{
                padding: "20px",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(14, 21, 33, 0.9)",
                backdropFilter: "blur(12px)"
            }}>
                {error && (
                    <div style={{
                        color: "#ef4444",
                        fontSize: "12px",
                        background: "rgba(239, 68, 68, 0.1)",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        marginBottom: "12px",
                        border: "1px solid rgba(239, 68, 68, 0.2)",
                        display: "flex",
                        alignItems: "center",
                        gap: 8
                    }}>
                        <span>⚠️</span> {error}
                    </div>
                )}

                <div style={{
                    display: "flex",
                    gap: 10,
                    background: "#161b27",
                    padding: "6px",
                    borderRadius: "16px",
                    border: "1px solid #252d3d",
                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.2)"
                }}>
                    <button
                        onClick={() => fileInputRef.current.click()}
                        className="action-btn"
                        title="Upload file"
                        style={{
                            width: 42,
                            height: 42,
                            borderRadius: "12px",
                            border: "none",
                            background: "rgba(255,255,255,0.03)",
                            color: "#94a3b8",
                            cursor: "pointer",
                            fontSize: "18px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    >
                        📎
                    </button>

                    <input ref={fileInputRef} type="file" hidden onChange={handleFileUpload} />

                    <input
                        id="chat-input-area"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        placeholder="Ask me anything or upload a bill..."
                        className="chat-input"
                        style={{
                            flex: 1,
                            background: "transparent",
                            border: "none",
                            padding: "0 8px",
                            color: "#fff",
                            fontSize: "14px",
                            fontWeight: 400
                        }}
                    />

                    <button
                        onClick={() => handleSend()}
                        disabled={!input.trim() || loading}
                        className="action-btn"
                        style={{
                            width: 42,
                            height: 42,
                            borderRadius: "12px",
                            border: "none",
                            background: input.trim() ? "#1a56a0" : "rgba(255,255,255,0.05)",
                            color: "white",
                            cursor: input.trim() ? "pointer" : "default",
                            fontSize: "18px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: input.trim() ? "0 4px 12px rgba(26, 86, 160, 0.3)" : "none"
                        }}
                    >
                        ↑
                    </button>
                </div>

                <div style={{ textAlign: "center", marginTop: 12, fontSize: "10px", color: "#475569", letterSpacing: "0.02em" }}>
                    Secured Connection · Built with Llama 3.3
                </div>
            </div>
        </div>
    );
}
