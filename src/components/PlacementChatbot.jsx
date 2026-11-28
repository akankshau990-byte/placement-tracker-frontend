import { useState, useRef, useEffect } from "react";
import axios from "axios";

const QUICK_PROMPTS = [
  "7-day DSA & CS revision plan",
  "How to explain my MERN project?",
  "Take my quick mock interview",
  "Cold message template for referral",
];

// Cleanly formats **bold** text returned by Gemini
const FormattedMessage = ({ text }) => {
  const parts = String(text).split(/(\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((part, index) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={index}>{part.slice(2, -2)}</strong>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
};

const PlacementChatbot = ({ backendUrl, token, applications = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
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
  }, [messages, isOpen, isExpanded]);

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
        className="btn btn-primary shadow-lg rounded-pill px-4 py-2 fw-semibold d-flex align-items-center gap-2"
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 1030,
        }}
      >
        <span>{isOpen ? "✖ Close Mentor" : "🤖 AI Prep Mentor"}</span>
      </button>

      {/* Spacious Resizable Chat Window */}
      {isOpen && (
        <div
          className="card shadow-lg border-0 d-flex flex-column"
          style={{
            position: "fixed",
            bottom: "78px",
            right: "24px",
            width: isExpanded ? "760px" : "460px",
            maxWidth: "calc(100vw - 32px)",
            height: isExpanded ? "calc(100vh - 110px)" : "600px",
            maxHeight: "calc(100vh - 100px)",
            zIndex: 1030,
            borderRadius: "16px",
            overflow: "hidden",
            transition: "all 0.25s ease",
          }}
        >
          {/* Header */}
          <div className="bg-primary text-white p-3 d-flex justify-content-between align-items-center">
            <div>
              <h6 className="mb-0 fw-bold">🤖 AI Placement Mentor</h6>
              <small style={{ fontSize: "12px", opacity: 0.9 }}>
                Powered by Gemini • Context-Aware
              </small>
            </div>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-light"
                onClick={() => setIsExpanded((prev) => !prev)}
                title={isExpanded ? "Shrink Window" : "Expand Window"}
              >
                {isExpanded ? "🗗 Compact" : "⛶ Expand"}
              </button>
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
          </div>

          {/* Messages Area */}
          <div
            className="p-3 flex-grow-1 bg-light"
            style={{ overflowY: "auto", fontSize: "14.5px" }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`d-flex mb-3 ${
                  msg.sender === "user"
                    ? "justify-content-end"
                    : "justify-content-start"
                }`}
              >
                <div
                  className={`p-3 rounded-3 shadow-sm ${
                    msg.sender === "user"
                      ? "bg-primary text-white"
                      : "bg-white text-dark border"
                  }`}
                  style={{
                    maxWidth: "88%",
                    whiteSpace: "pre-line",
                    lineHeight: "1.55",
                  }}
                >
                  <FormattedMessage text={msg.text} />
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
            <div className="px-3 py-2 bg-white border-top d-flex gap-2 flex-wrap">
              {QUICK_PROMPTS.map((q, i) => (
                <button
                  key={i}
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  style={{ fontSize: "12px", padding: "4px 10px" }}
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
            className="p-3 bg-white border-top d-flex gap-2"
          >
            <input
              type="text"
              className="form-control"
              placeholder="Ask DSA, HR, or company tips..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="btn btn-primary px-4 fw-semibold"
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
