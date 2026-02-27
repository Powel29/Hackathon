import { useState, useRef, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

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
      onProgress(2); // PDF loading started
      source = await pdfToImage(file);
    }

    onProgress(5);
    await loadTesseract();
    if (!window.Tesseract) throw new Error("Tesseract.js failed to load. Please check your internet connection.");

    console.log("Starting Tesseract.recognize...");

    // In v5, Tesseract.recognize handles worker lifecycle automatically
    const { data: { text } } = await window.Tesseract.recognize(source, 'eng', {
      logger: m => {
        console.log("OCR Status:", m.status, m.progress);
        let p = 5;
        if (m.status === "loading tesseract core") p = 5 + (m.progress * 15);
        else if (m.status === "loading language traineddata") p = 20 + (m.progress * 15);
        else if (m.status === "initializing api") p = 35 + (m.progress * 10);
        else if (m.status === "recognizing text") p = 45 + (m.progress * 55);
        else p = m.progress * 100;
        onProgress(Math.round(Math.max(p, 5)));
      },
    });

    if (!text || text.trim().length === 0) {
      throw new Error("No text found in this document. Please ensure it's a clear scan.");
    }

    return text.trim();
  } catch (err) {
    console.error("OCR Final Error:", err);
    throw err;
  }
}

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
    const detail = typeof err.detail === "string" ? err.detail : JSON.stringify(err.detail) || `Server error: ${res.status}`; throw new Error(detail);
  }
  return res.json();
}

function OCRProgress({ fileName, progress }) {
  return (
    <div className="chat-bubble" style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
        background: "linear-gradient(135deg, #553c9a, #b794f4)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
      }}>🔍</div>
      <div style={{
        background: "#1e2635", borderRadius: "18px 18px 18px 4px",
        border: "1px solid #252d3d", padding: "14px 16px", minWidth: 280,
      }}>
        <div style={{ color: "#a0aec0", fontSize: 12, marginBottom: 8, fontFamily: "'DM Mono', monospace" }}>
          Scanning: {fileName}
        </div>
        <div style={{ background: "#252d3d", borderRadius: 6, height: 6, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 6,
            background: "linear-gradient(90deg, #553c9a, #b794f4)",
            width: `${progress}%`, transition: "width 0.3s ease",
          }} />
        </div>
        <div style={{ color: "#b794f4", fontSize: 11, marginTop: 6, fontFamily: "'DM Mono', monospace" }}>
          OCR in progress... {progress}%
        </div>
      </div>
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "human";
  return (
    <div className="chat-bubble" style={{
      display: "flex", flexDirection: isUser ? "row-reverse" : "row",
      gap: 10, alignItems: "flex-start",
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8, flexShrink: 0, marginTop: 2,
        background: isUser ? "#252d3d" : "linear-gradient(135deg, #1a56a0 0%, #4a90d9 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: isUser ? 13 : 16, fontWeight: 700, color: isUser ? "#718096" : "white",
      }}>
        {isUser ? "J" : "💳"}
      </div>
      <div style={{ maxWidth: "75%", display: "flex", flexDirection: "column", gap: 4 }}>
        {isUser && msg.ocrFile && (
          <div style={{
            background: "rgba(154,107,250,0.1)", border: "1px solid rgba(154,107,250,0.25)",
            borderRadius: 8, padding: "4px 10px", fontSize: 11,
            color: "#b794f4", fontFamily: "'DM Mono', monospace", textAlign: "right",
          }}>
            📄 OCR: {msg.ocrFile}
          </div>
        )}
        <div style={{
          background: isUser ? "linear-gradient(135deg, #1a56a0 0%, #2563a8 100%)" : "#1e2635",
          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          padding: "12px 16px", color: "#e2e8f0", fontSize: 14, lineHeight: 1.65,
          border: isUser ? "none" : "1px solid #252d3d",
          boxShadow: isUser ? "0 4px 12px rgba(26,86,160,0.3)" : "none",
          whiteSpace: "pre-wrap", wordBreak: "break-word",
        }}>
          {msg.content}
        </div>
      </div>
    </div>
  );
}

export default function BillingChatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("Thinking...");
  const [error, setError] = useState(null);
  const [ocrProgress, setOcrProgress] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading, ocrProgress]);

  const suggestions = [
    "Show my electricity bills",
    "Show my water bills",
    "Show my gas bills",
    "Show my municipal bills",
    "Check my payment history",
    "Show my service requests",
    "My electricity bill seems wrong",
    "I need a new water connection",
  ];

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/bmp", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      setError("Unsupported file. Please upload PNG, JPG, WEBP, BMP, or PDF.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File too large. Maximum size is 10MB.");
      return;
    }

    setError(null);
    setOcrProgress({ fileName: file.name, progress: 0 });

    try {
      const extractedText = await runOCR(file, pct => {
        setOcrProgress({ fileName: file.name, progress: pct });
      });

      setOcrProgress(null);

      if (!extractedText || extractedText.length < 10) {
        setError("Could not read text from this file. Make sure the image is clear and well-lit.");
        return;
      }

      const trimmedText = extractedText.slice(0, 1000);
      const ocrMessage = `I uploaded a document called "${file.name}". Here is the text extracted via OCR (first 1000 chars):\n\n---\n${trimmedText}\n---\n\nPlease analyze this and help me with any billing information, invoice details, or payment proof it contains.`;
      const previewText = `📄 Uploaded: ${file.name}\n${extractedText.length} characters extracted. Analyzing with AI...`;

      const userMsg = { role: "human", content: previewText, ocrFile: file.name };
      setMessages(prev => [...prev, userMsg]);
      setLoading(true);
      setLoadingLabel("Reading document...");

      const labels = ["Reading invoice...", "Extracting details...", "Processing...", "Almost done..."];
      let li = 0;
      const labelTimer = setInterval(() => {
        setLoadingLabel(labels[Math.min(li++, labels.length - 1)]);
      }, 1800);

      try {
        const updatedHistory = [...messages, userMsg];
        const data = await sendChatMessage({ message: ocrMessage, history: updatedHistory, userToken: null });
        setMessages(prev => [...prev, { role: "assistant", content: data.reply, toolCalls: data.tool_calls || [] }]);
      } catch (err) {
        setError(typeof err.message === "string" ? err.message : JSON.stringify(err.message));
      } finally {
        clearInterval(labelTimer);
        setLoading(false);
        setLoadingLabel("Thinking...");
        inputRef.current?.focus();
      }
    } catch (err) {
      setOcrProgress(null);
      setError("OCR failed: " + err.message);
    }
  }

  async function handleSend(text = input) {
    if (!text.trim() || loading) return;
    setError(null);
    const userMsg = { role: "human", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    setLoadingLabel("Thinking...");

    const labels = ["Calling tool...", "Fetching data...", "Processing...", "Almost done..."];
    let li = 0;
    const labelTimer = setInterval(() => {
      setLoadingLabel(labels[Math.min(li++, labels.length - 1)]);
    }, 1800);

    try {
      const updatedHistory = [...messages, userMsg];
      const data = await sendChatMessage({ message: text, history: updatedHistory, userToken: null });
      setMessages(prev => [...prev, { role: "assistant", content: data.reply, toolCalls: data.tool_calls || [] }]);
    } catch (err) {
      setError(typeof err.message === "string" ? err.message : JSON.stringify(err.message));
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
      minHeight: "100vh", background: "linear-gradient(135deg, #0f1117 0%, #141822 50%, #0f1117 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif", padding: 0,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        html, body, #root { margin: 0; padding: 0; height: 100%; overflow: hidden; }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #2a3040; border-radius: 2px; }
        .chat-bubble { animation: slideIn 0.22s ease-out; }
        @keyframes slideIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .suggestion-chip:hover { background: rgba(99,179,237,0.12) !important; border-color: #63b3ed !important; color: #90cdf4 !important; }
        .send-btn:hover:not(:disabled) { background: #4a90d9 !important; transform: scale(1.05); }
        .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .upload-btn:hover:not(:disabled) { background: rgba(154,107,250,0.2) !important; border-color: #b794f4 !important; }
        .upload-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        textarea:focus { outline: none; border-color: #4a90d9 !important; box-shadow: 0 0 0 3px rgba(74,144,217,0.15); }
        .dot { animation: blink 1.2s ease-in-out infinite; }
        .dot:nth-child(2){animation-delay:.2s} .dot:nth-child(3){animation-delay:.4s}
        @keyframes blink { 0%,80%,100%{opacity:.2} 40%{opacity:1} }
      `}</style>

      <input ref={fileInputRef} type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/bmp,application/pdf"
        style={{ display: "none" }} onChange={handleFileUpload} />

      <div style={{ width: "100%", height: "100vh", background: "#161b27", border: "none", display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Header */}
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #1e2635", background: "#0e1521", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0, background: "linear-gradient(135deg, #1a56a0, #4a90d9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, boxShadow: "0 4px 12px rgba(74,144,217,0.3)" }}>💳</div>
          <div>
            <div style={{ color: "#e2e8f0", fontSize: 15, fontWeight: 600 }}>BillingBot</div>
            <div style={{ color: "#4a90d9", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#48bb78", display: "inline-block" }} />
              LangChain · Groq Llama 3.3 70B · 10 Tools · OCR Enabled
            </div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <div style={{ background: "rgba(154,107,250,0.1)", border: "1px solid rgba(154,107,250,0.25)", borderRadius: 8, padding: "4px 10px", color: "#b794f4", fontSize: 11, fontWeight: 500 }}>
              🔍 OCR Ready
            </div>
            <div style={{ background: "rgba(72,187,120,0.1)", border: "1px solid rgba(72,187,120,0.2)", borderRadius: 8, padding: "4px 10px", color: "#68d391", fontSize: 11, fontWeight: 500 }}>
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
                <div style={{ color: "#4a5568", fontSize: 13, marginBottom: 4 }}>Powered by LangChain + Groq with 10 real database tools</div>
                <div style={{ color: "#6b46c1", fontSize: 12 }}>📎 Upload bills or receipts — OCR reads them automatically</div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", maxWidth: 540 }}>
                {suggestions.map(s => (
                  <button key={s} className="suggestion-chip" onClick={() => handleSend(s)} style={{
                    background: "rgba(74,144,217,0.08)", border: "1px solid rgba(74,144,217,0.2)",
                    borderRadius: 20, padding: "7px 14px", color: "#7fb3e0",
                    fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                  }}>{s}</button>
                ))}
                <button className="suggestion-chip" onClick={() => fileInputRef.current?.click()} style={{
                  background: "rgba(154,107,250,0.08)", border: "1px solid rgba(154,107,250,0.25)",
                  borderRadius: 20, padding: "7px 14px", color: "#b794f4",
                  fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                }}>📎 Upload invoice / receipt</button>
              </div>
            </div>
          )}

          {messages.map((msg, i) => <Message key={i} msg={msg} />)}
          {ocrProgress && <OCRProgress fileName={ocrProgress.fileName} progress={ocrProgress.progress} />}

          {loading && (
            <div className="chat-bubble" style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: "linear-gradient(135deg, #1a56a0, #4a90d9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>💳</div>
              <div style={{ background: "#1e2635", borderRadius: "18px 18px 18px 4px", border: "1px solid #252d3d", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ display: "flex", gap: 4 }}>
                  {[0, 1, 2].map(i => <div key={i} className="dot" style={{ width: 7, height: 7, borderRadius: "50%", background: "#4a5568" }} />)}
                </div>
                <span style={{ color: "#4a5568", fontSize: 12, fontFamily: "'DM Mono', monospace" }}>{loadingLabel}</span>
              </div>
            </div>
          )}

          {error && (
            <div style={{ background: "rgba(245,101,101,0.08)", border: "1px solid rgba(245,101,101,0.2)", borderRadius: 10, padding: "10px 14px", color: "#fc8181", fontSize: 13 }}>
              ⚠️ {typeof error === "string" ? error : JSON.stringify(error)}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div style={{ padding: "14px 20px", borderTop: "1px solid #1e2635", background: "#0e1521" }}>
          {messages.length > 0 && (
            <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
              {suggestions.slice(0, 4).map(s => (
                <button key={s} className="suggestion-chip" onClick={() => handleSend(s)} style={{
                  background: "transparent", border: "1px solid #1e2635", borderRadius: 14,
                  padding: "4px 10px", color: "#4a5568", fontSize: 11, cursor: "pointer",
                  fontFamily: "inherit", transition: "all 0.15s",
                }}>{s}</button>
              ))}
            </div>
          )}
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <button className="upload-btn" onClick={() => fileInputRef.current?.click()}
              disabled={loading || !!ocrProgress}
              title="Upload invoice/receipt (PNG, JPG, PDF)"
              style={{
                width: 44, height: 44, borderRadius: 12, border: "1px solid rgba(154,107,250,0.3)",
                background: "rgba(154,107,250,0.08)", cursor: "pointer", fontSize: 20,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s", flexShrink: 0,
              }}>📎</button>

            <textarea ref={inputRef} value={input}
              onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
              placeholder="Ask about invoices, payments... or upload a document 📎"
              rows={1} style={{
                flex: 1, background: "#161b27", border: "1px solid #1e2635",
                borderRadius: 12, padding: "12px 16px", color: "#e2e8f0",
                fontSize: 14, fontFamily: "inherit", resize: "none", lineHeight: 1.5, transition: "all 0.2s",
              }}
              onInput={e => {
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }} />

            <button className="send-btn" onClick={() => handleSend()}
              disabled={loading || !input.trim()} style={{
                width: 44, height: 44, borderRadius: 12, border: "none",
                background: "#2563a8", cursor: "pointer", fontSize: 18, color: "white",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s", flexShrink: 0,
              }}>↑</button>
          </div>
          <div style={{ textAlign: "center", marginTop: 8, color: "#2d3748", fontSize: 11 }}>
            Secured · LangChain + Groq · Real Database · OCR by Tesseract.js
          </div>
        </div>
      </div>
    </div>
  );
}
