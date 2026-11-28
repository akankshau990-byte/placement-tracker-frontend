import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const ROOMS = [
  {
    id: "MERN-Stack",
    label: "# MERN-Stack",
    desc: "React, Node, MongoDB & full-stack project help",
  },
  {
    id: "DSA-Grind",
    label: "# DSA-Grind",
    desc: "LeetCode daily problems, patterns & OA prep",
  },
  {
    id: "Off-Campus-Leads",
    label: "# Off-Campus-Leads",
    desc: "Internship openings, referrals & hiring drives",
  },
  {
    id: "Interview-Experiences",
    label: "# Interview-Experiences",
    desc: "Real company interview questions & tips",
  },
];

const CommunityHub = ({ backendUrl }) => {
  const [activeRoom, setActiveRoom] = useState("MERN-Stack");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState({ id: "", name: "" });

  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const token = localStorage.getItem("token");

  // Fetch real logged-in user name & MongoDB _id from backend
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${backendUrl}/api/community-user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user info:", err);
      }
    };
    fetchMe();
  }, [backendUrl, token]);

  // Initialize Socket connection once
  useEffect(() => {
    socketRef.current = io(backendUrl, {
      transports: ["websocket", "polling"],
    });

    socketRef.current.on("receive_message", (newMsg) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === newMsg._id)) return prev;
        return [...prev, newMsg];
      });
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [backendUrl]);

  // Join room & fetch message history whenever activeRoom changes
  useEffect(() => {
    const loadRoom = async () => {
      setLoading(true);
      try {
        socketRef.current?.emit("join_room", activeRoom);
        const res = await axios.get(
          `${backendUrl}/api/community/${activeRoom}`,
        );
        setMessages(res.data || []);
      } catch (error) {
        console.error("Failed to load room messages:", error);
      } finally {
        setLoading(false);
      }
    };
    loadRoom();
  }, [activeRoom, backendUrl]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || !socketRef.current) return;

    socketRef.current.emit("send_message", {
      room: activeRoom,
      token,
      text: text.trim(),
    });
    setText("");
  };

  const currentRoomObj = ROOMS.find((r) => r.id === activeRoom);

  return (
    <div className="card shadow-sm border-0 overflow-hidden">
      <div className="row g-0" style={{ minHeight: "500px" }}>
        {/* Left Sidebar: Domain Channels */}
        <div className="col-md-3 bg-dark text-white p-3">
          <h6 className="fw-bold mb-1">💬 Peer Community</h6>
          <small className="text-secondary d-block mb-3">
            Chatting as:{" "}
            <span className="text-warning fw-semibold">
              {currentUser.name || "Loading..."}
            </span>
          </small>
          <div className="d-flex flex-column gap-2">
            {ROOMS.map((room) => (
              <button
                key={room.id}
                type="button"
                onClick={() => setActiveRoom(room.id)}
                className={`btn text-start btn-sm fw-semibold ${
                  activeRoom === room.id
                    ? "btn-primary"
                    : "btn-outline-light border-0"
                }`}
              >
                {room.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Live Chat Area */}
        <div className="col-md-9 d-flex flex-column bg-light">
          <div className="p-3 bg-white border-bottom">
            <h6 className="mb-0 fw-bold">{currentRoomObj?.label}</h6>
            <small className="text-muted">{currentRoomObj?.desc}</small>
          </div>

          <div
            className="p-3 flex-grow-1"
            style={{ height: "360px", overflowY: "auto" }}
          >
            {loading ? (
              <p className="text-muted text-center mt-4">Loading messages...</p>
            ) : messages.length === 0 ? (
              <p className="text-muted text-center mt-4">
                No messages yet in {currentRoomObj?.label}. Start the
                discussion!
              </p>
            ) : (
              messages.map((msg, i) => {
                const isMe =
                  Boolean(currentUser.id) &&
                  String(msg.senderId) === String(currentUser.id);

                return (
                  <div
                    key={msg._id || i}
                    className={`d-flex flex-column mb-2 ${
                      isMe ? "align-items-end" : "align-items-start"
                    }`}
                  >
                    <small
                      className="text-muted mb-1"
                      style={{ fontSize: "11px" }}
                    >
                      {isMe ? "You" : msg.senderName} •{" "}
                      {msg.createdAt
                        ? new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : ""}
                    </small>
                    <div
                      className={`px-3 py-2 rounded-3 shadow-sm ${
                        isMe
                          ? "bg-primary text-white"
                          : "bg-white border text-dark"
                      }`}
                      style={{ maxWidth: "75%", fontSize: "14px" }}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={handleSend}
            className="p-3 bg-white border-top d-flex gap-2"
          >
            <input
              type="text"
              className="form-control"
              placeholder={`Message ${currentRoomObj?.label}...`}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button
              type="submit"
              className="btn btn-primary px-4 fw-semibold"
              disabled={!text.trim()}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommunityHub;
