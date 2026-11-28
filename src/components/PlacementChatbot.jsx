import { useState, useRef, useEffect } from "react";
import axios from "axios";

const QUICK_PROMPTS = [
  "7-day DSA & CS revision plan",
  "How to explain my MERN project?",
  "Take my quick mock interview",
  "Cold message template for referral",
];

const PlacementChatbot = ({ backendUrl, token, applications = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi! I'm your AI Placement Mentor. Ask me anything about company-specific interview prep, DSA roadmaps, project pitching, or take a quick mock interview!",
    },
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Summarize tracked applications so the AI can tailor its guidance
  const userContext =
    applications.length > 0
      ? `Applied/Interviewing at: ${applications
          .slice(0, 6)
          .map((a) => `${a.companyName} (${a.role} - ${a.status})`)
          .join(", ")}`
      : "";

  const handleSend = async (customText) => {
    const textToSend = (customText ?? input).trim();
    if (!textToSend || loading) return;

    const updatedMessages = [...messages, { sender: "user", text: textToSend }];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${backendUrl}/api/questions/chat`,
        {
          message: textToSend,
          history: updatedMessages,
          userContext,
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );

      setMessages((prev) => [...prev, { sender: "bot", text: res.data.reply }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Network error occurred. Please try again in a moment!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSend();
  };

  return (
    <>
      {/* Floating Toggle Button (Bottom Right) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="btn btn-primary shadow-lg rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-2"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 1030,
        }}
      >
        <span>{isOpen ? "✖ Close Mentor" : "🤖 AI Prep Mentor"}</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="card shadow-lg border-0 d-flex flex-column"
          style={{
            position: "fixed",
            bottom: "78px",
            right: "24px",
            width: "360px",
            maxWidth: "calc(100vw - 32px)",
            height: "480px",
            zIndex: 1030,
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div className="bg-primary text-white p-3 d-flex justify-content-between align-items-center">
            <div>
              <h6 className="mb-0 fw-bold">🤖 AI Placement Mentor</h6>
              <small style={{ fontSize: "11px", opacity: 0.9 }}>
                Powered by Gemini • Context-Aware
              </small>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline-light"
              onClick={() =>
                setMessages([
                  {
                    sender: "bot",
                    text: "Chat reset! Which company, role, or topic would you like to prepare for today?",
                  },
                ])
              }
            >
              Reset
            </button>
          </div>

          {/* Messages Area */}
          <div
            className="p-3 flex-grow-1 bg-light"
            style={{ overflowY: "auto", fontSize: "14px" }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`d-flex mb-2 ${
                  msg.sender === "user"
                    ? "justify-content-end"
                    : "justify-content-start"
                }`}
              >
                <div
                  className={`p-2 px-3 rounded-3 shadow-sm ${
                    msg.sender === "user"
                      ? "bg-primary text-white"
                      : "bg-white text-dark border"
                  }`}
                  style={{
                    maxWidth: "85%",
                    whiteSpace: "pre-line",
                    lineHeight: "1.45",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="text-muted small fst-italic">
                ⏳ Mentor is typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Starter Chips */}
          {messages.length <= 2 && (
            <div className="px-2 py-1 bg-white border-top d-flex gap-1 flex-wrap">
              {QUICK_PROMPTS.map((q, i) => (
                <button
                  key={i}
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  style={{ fontSize: "11px", padding: "2px 8px" }}
                  onClick={() => handleSend(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input Box */}
          <form
            onSubmit={handleSubmit}
            className="p-2 bg-white border-top d-flex gap-2"
          >
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Ask DSA, HR, or company tips..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="btn btn-primary btn-sm px-3 fw-semibold"
              disabled={loading || !input.trim()}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default PlacementChatbot;
