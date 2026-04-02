import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./LeafyHome.css";
import "./LeafyChat.css";

const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE";
const GEMINI_MODEL = "gemini-1.5-flash";

const API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Figma design assets (expire after ~7 days)
const imgLeavesBg =
  "https://www.figma.com/api/mcp/asset/d6bd388d-4b24-4216-bb6e-102815a4eacf";
const imgLeafy21 =
  "https://www.figma.com/api/mcp/asset/14f8a9a8-887f-4e7c-b0c8-3ff7eeae38dd";
const imgVector2 =
  "https://www.figma.com/api/mcp/asset/fae0860e-296a-456d-9d2c-816a9e7c61c5";
const imgVector3 =
  "https://www.figma.com/api/mcp/asset/016ca34e-4320-439c-988c-53563eea5baa";
const imgEllipse13 =
  "https://www.figma.com/api/mcp/asset/758ff906-9f6d-408c-90af-c82862c33353";
const imgTypcnPlus =
  "https://www.figma.com/api/mcp/asset/5c00a751-1f78-4f37-8f31-60fa243ebd38";

const SYSTEM_PROMPT = `You are Leafy, a friendly plant assistant. Give practical, safe gardening advice. Keep answers concise, step-by-step when helpful, and ask a short follow-up question at the end.`;

const buildGeminiRequest = (chatMessages) => {
  // Gemini expects "contents" with role "user" or "model".
  const contents = chatMessages.map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.text }],
  }));

  return {
    contents: [
      { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
      ...contents,
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 512,
    },
  };
};

async function generateGeminiReply(chatMessages, signal) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY.includes("YOUR_")) {
    throw new Error(
      "Gemini API key is not set. Paste your key into GEMINI_API_KEY in src/pages/LeafyChat.jsx.",
    );
  }

  const res = await fetch(`${API_ENDPOINT}?key=${encodeURIComponent(GEMINI_API_KEY)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(buildGeminiRequest(chatMessages)),
    signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Gemini request failed (${res.status}). ${text}`);
  }

  const data = await res.json();
  const reply =
    data?.candidates?.[0]?.content?.parts
      ?.map((p) => p?.text || "")
      .join("")
      .trim() || "";

  if (!reply) throw new Error("Gemini returned an empty response.");
  return reply;
}

const initialMessages = [
  {
    id: "m1",
    role: "model",
    text: "Hi there, I’m Leafy! How can I help you today? :)",
  }
];

function LeafyChat() {
  const [messages, setMessages] = useState(initialMessages);
  const [composerText, setComposerText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);

  const chatScrollRef = useRef(null);
  const abortRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    const el = chatScrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, isSending, scrollToBottom]);

  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const trimmed = composerText.trim();
      if (!trimmed || isSending) return;

      setError(null);
      setComposerText("");

      const userMsg = {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        role: "user",
        text: trimmed,
      };

      const modelId = crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + 1);
      const modelMsg = { id: modelId, role: "model", text: "", pending: true };

      const nextMessages = [...messages, userMsg, modelMsg];
      setMessages(nextMessages);
      setIsSending(true);

      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      try {
        const reply = await generateGeminiReply([...messages, userMsg], ac.signal);
        setMessages((prev) =>
          prev.map((m) => (m.id === modelId ? { ...m, text: reply, pending: false } : m)),
        );
      } catch (err) {
        if (err?.name !== "AbortError") {
          setError(err?.message || "Something went wrong talking to Gemini.");
          setMessages((prev) =>
            prev.map((m) =>
              m.id === modelId
                ? { ...m, text: "Sorry — I couldn’t reach Leafy right now. Please try again.", pending: false }
                : m,
            ),
          );
        }
      } finally {
        setIsSending(false);
      }
    },
    [composerText, isSending, messages],
  );

  const canSend = useMemo(() => composerText.trim().length > 0 && !isSending, [composerText, isSending]);

  return (
    <div className="leafy-shell">
      <div className="phone leafy-v2-phone leafy-chatv2-phone" aria-label="Leafy chat">
        <div className="leafy-chatv2" style={{ backgroundImage: undefined }}>
          <div className="leafy-chatv2__leaves" aria-hidden>
            <img className="leafy-chatv2__leaves-img" alt="" src={imgLeavesBg} />
          </div>

          <div className="leafy-chatv2__wash" aria-hidden />

          <Link to="/" className="leafy-chatv2__back" aria-label="Back">
            ‹
          </Link>

          <h2 className="leafy-chatv2__title">Yellowing Tomato Leaves</h2>

          <div className="leafy-chatv2__chat" ref={chatScrollRef} aria-label="Chat messages">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`leafy-chatv2__row ${m.role === "user" ? "leafy-chatv2__row--user" : "leafy-chatv2__row--model"}`}
              >
                {m.role === "model" ? (
                  <div className="leafy-chatv2__avatar" aria-hidden>
                    <img
                      className="leafy-chatv2__avatar-img leafy-chatv2__avatar-img--leafy"
                      alt=""
                      src={imgLeafy21}
                    />
                    <img
                      className="leafy-chatv2__avatar-img leafy-chatv2__avatar-img--v2"
                      alt=""
                      src={imgVector2}
                    />
                    <img
                      className="leafy-chatv2__avatar-img leafy-chatv2__avatar-img--v3"
                      alt=""
                      src={imgVector3}
                    />
                  </div>
                ) : null}

                <div
                  className={`leafy-chatv2__bubble ${m.role === "user" ? "leafy-chatv2__bubble--user" : "leafy-chatv2__bubble--model"}`}
                >
                  {m.pending ? "Thinking…" : m.text}
                </div>
              </div>
            ))}
          </div>

          {error ? (
            <div className="leafy-chatv2__error" role="alert">
              <div className="leafy-chatv2__error-inner">
                <div>{error}</div>
                <button type="button" onClick={() => setError(null)}>
                  Dismiss
                </button>
              </div>
            </div>
          ) : null}

          <form className="leafy-chatv2__composer" onSubmit={onSubmit} aria-label="Chat input">
            <button
              type="submit"
              className="leafy-chatv2__plus"
              aria-label="Send message"
              disabled={!canSend}
            >
              <img className="leafy-chatv2__plus-bg" alt="" src={imgEllipse13} />
              <img className="leafy-chatv2__plus-icon" alt="" src={imgTypcnPlus} />
            </button>

            <input
              className="leafy-chatv2__input"
              value={composerText}
              onChange={(e) => setComposerText(e.target.value)}
              placeholder="Ask me anything!"
              inputMode="text"
              autoComplete="off"
              disabled={isSending}
            />
          </form>
        </div>
      </div>
    </div>
  );
}

export default LeafyChat;

