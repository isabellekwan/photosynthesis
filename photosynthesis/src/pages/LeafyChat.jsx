import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./LeafyHome.css";
import "./LeafyChat.css";
import background from "../assets/chat/bg.png";
import leafy from "../assets/chat/leafy.svg";
import plus from "../assets/chat/plus.svg";

/**
 * SECURITY NOTE: In a real app, move these to a .env file!
 * For Vite: VITE_GEMINI_KEY=your_key_here
 * Access via: import.meta.env.VITE_GEMINI_KEY
 */
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_KEY || "YOUR_API_KEY_HERE";
const GEMINI_MODEL = "gemini-3-flash-preview"; 

const API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const SYSTEM_PROMPT = `
You are Leafy, a friendly and helpful plant assistant 🌱

Your role is to give practical, safe gardening advice in a casual, easy-to-understand way.

STYLE RULES:
- Use plain text only. Do not use markdown, bold, italics, or symbols like **, __, #, or backticks.
- Keep responses short and clear. Avoid long paragraphs.
- Write in a friendly, conversational tone.
- Use simple language (no jargon or overly technical terms).
- You may use at most one emoji per response.

RESPONSE GUIDELINES:
- Focus on the most likely cause or solution first.
- Give actionable advice the user can follow immediately.
- Use short steps or line breaks when helpful (no bullet symbols).
- Do not over-explain or list too many possibilities.
- Always finish your response completely. Do not cut off mid-sentence.

SAFETY:
- Give safe, general gardening advice.
- Avoid suggesting anything harmful or risky.

CONVERSATION:
- End every response with one short, natural follow-up question.
- Keep a warm, slightly playful personality, like a supportive plant buddy.

OUTPUT FORMAT:
- Plain text only
- No markdown or special formatting
`;

const buildGeminiRequest = (chatMessages) => {
  return {
    contents: [
      // Injecting the system prompt as the first message
      { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
      ...chatMessages.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      })),
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1500,
    },
  };
};

async function generateGeminiReply(chatMessages, signal) {
  const res = await fetch(
    `${API_ENDPOINT}?key=${encodeURIComponent(GEMINI_API_KEY)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildGeminiRequest(chatMessages)),
      signal,
    }
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData?.error?.message || res.statusText;
    throw new Error(`Gemini Error (${res.status}): ${message}`);
  }

  const data = await res.json();
  const reply =
    data?.candidates?.[0]?.content?.parts
      ?.map((p) => p?.text || "")
      .join("")
      .trim() || "";

  if (!reply) throw new Error("Empty response from the model.");
  return reply;
}

const initialMessages = [
  {
    id: "m1",
    role: "model",
    text: "Hi there, I'm Leafy! How can I help your garden grow today? :)",
  },
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
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending, scrollToBottom]);

  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const trimmed = composerText.trim();
      if (!trimmed || isSending) return;

      setComposerText("");
      setError(null);

      const userMsg = {
        id: crypto.randomUUID(),
        role: "user",
        text: trimmed,
      };

      const modelId = crypto.randomUUID();
      const modelMsg = {
        id: modelId,
        role: "model",
        text: "",
        pending: true,
      };

      const contextForApi = [...messages, userMsg];
      setMessages([...contextForApi, modelMsg]);
      setIsSending(true);

      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      try {
        const reply = await generateGeminiReply(contextForApi, ac.signal);

        setMessages((prev) =>
          prev.map((m) =>
            m.id === modelId ? { ...m, text: reply, pending: false } : m
          )
        );
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
          setMessages((prev) =>
            prev.map((m) =>
              m.id === modelId
                ? {
                    ...m,
                    text: "Sorry, I hit a snag in the soil. Try again?",
                    pending: false,
                  }
                : m
            )
          );
        }
      } finally {
        setIsSending(false);
      }
    },
    [composerText, isSending, messages]
  );

  const canSend = useMemo(
    () => composerText.trim().length > 0 && !isSending,
    [composerText, isSending]
  );

  return (
    <div className="leafy-shell">
      <div className="phone leafy-v2-phone leafy-chatv2-phone">
        <div
          className="leafy-chatv2"
          style={{ backgroundImage: `url(${background})` }}
        >
          <div className="leafy-chatv2__wash" />

          <Link to="/" className="leafy-chatv2__back">
            ‹
          </Link>

          <h2 className="leafy-chatv2__title">
            Plant Care Expert
          </h2>

          <div className="leafy-chatv2__chat" ref={chatScrollRef}>
            {messages.map((m) => (
              <div
                key={m.id}
                className={`leafy-chatv2__row ${
                  m.role === "user"
                    ? "leafy-chatv2__row--user"
                    : "leafy-chatv2__row--model"
                }`}
              >
                {m.role === "model" && (
                  <div className="leafy-chatv2__avatar">
                    <img src={leafy} alt="Leafy" />
                  </div>
                )}

                <div
                  className={`leafy-chatv2__bubble ${
                    m.role === "user"
                      ? "leafy-chatv2__bubble--user"
                      : "leafy-chatv2__bubble--model"
                  }`}
                >
                  {m.pending ? "Leafy is thinking..." : m.text}
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="leafy-chatv2__error">
              <div>
                {error}
                <button onClick={() => setError(null)}>Dismiss</button>
              </div>
            </div>
          )}

          <form className="leafy-chatv2__composer" onSubmit={onSubmit}>
          <button
            type="submit"
            className="leafy-chatv2__plus"
            disabled={!canSend}
          >
            <img src={plus} alt="Send" className="leafy-chatv2__plus-icon" />
          </button>

            <input
              className="leafy-chatv2__input"
              value={composerText}
              onChange={(e) => setComposerText(e.target.value)}
              placeholder="How can I help your garden?"
              disabled={isSending}
            />
          </form>
        </div>
      </div>
    </div>
  );
}

export default LeafyChat;