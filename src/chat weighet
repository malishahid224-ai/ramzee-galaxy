import { useEffect, useRef, useState } from "react";

// Simple keyword-based reply engine so the widget is useful out of the box.
// Swap `getAgentReply` for a real API call (see comment at the bottom) when
// you're ready to connect an actual AI backend.
function getAgentReply(userText) {
  const text = userText.toLowerCase();

  if (text.includes("rent")) {
    return "We have several rental properties available, from cozy apartments to executive penthouses. Want me to filter the listings by budget or location?";
  }
  if (text.includes("buy") || text.includes("sale") || text.includes("sell")) {
    return "Great choice — we have family houses, villas and contemporary homes for sale across Lahore. What's your target area and budget?";
  }
  if (text.includes("price") || text.includes("cost") || text.includes("budget")) {
    return "Our listings range from PKR 85,000/month for rentals up to PKR 12 Crore for premium sale properties. Do you have a specific range in mind?";
  }
  if (text.includes("dha") || text.includes("gulberg") || text.includes("bahria") || text.includes("johar")) {
    return "We have active listings in that area. I can pull up the closest matches — would you like to see them?";
  }
  if (text.includes("contact") || text.includes("agent") || text.includes("call") || text.includes("phone")) {
    return "One of our agents can reach out to you directly. Could you share the best time and contact number for a callback?";
  }
  if (text.includes("hello") || text.includes("hi") || text.includes("hey")) {
    return "Hello! I'm your Real Estate assistant. Ask me about buying, renting, or any property on this page.";
  }
  if (text.includes("thank")) {
    return "You're welcome! Let me know if there's anything else you'd like to know about our properties.";
  }

  return "Thanks for your message! I can help you find properties to buy or rent, share pricing details, or connect you with an agent. What are you looking for?";
}

const initialMessage = {
  id: "welcome",
  sender: "ai",
  text: "Hi there 👋 I'm your Real Estate assistant. How can I help you today?",
};

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([initialMessage]);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isOpen]);

  const sendMessage = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;

    const userMessage = { id: Date.now(), sender: "user", text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setDraft("");
    setIsTyping(true);

    // Simulated latency before the "agent" replies.
    window.setTimeout(() => {
      const reply = {
        id: Date.now() + 1,
        sender: "ai",
        text: getAgentReply(trimmed),
      };
      setMessages((prev) => [...prev, reply]);
      setIsTyping(false);
    }, 700 + Math.random() * 500);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-widget">
      {isOpen && (
        <div className="chat-panel">
          <div className="chat-header">
            <div className="chat-header-info">
              <span className="chat-avatar">🏠</span>
              <div>
                <h4>Real Estate Assistant</h4>
                <p className="chat-status">
                  <span className="status-dot"></span> Online
                </p>
              </div>
            </div>
            <button
              className="chat-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          <div className="chat-messages" ref={scrollRef}>
            {messages.map((message) => (
              <div key={message.id} className={`chat-bubble-row ${message.sender}`}>
                {message.sender === "ai" && <span className="bubble-avatar">🏠</span>}
                <div className={`chat-bubble ${message.sender}`}>{message.text}</div>
              </div>
            ))}

            {isTyping && (
              <div className="chat-bubble-row ai">
                <span className="bubble-avatar">🏠</span>
                <div className="chat-bubble ai typing">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            )}
          </div>

          <div className="chat-input-row">
            <input
              type="text"
              placeholder="Type your message..."
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className="chat-send"
              onClick={sendMessage}
              aria-label="Send message"
            >
              ➤
            </button>
          </div>
        </div>
      )}

      <button
        className="chat-toggle"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? "✕" : "💬"}
      </button>
    </div>
  );
}

export default ChatWidget;

// To connect a real AI backend instead of the canned replies above, replace
// getAgentReply with an async call to your API of choice, e.g.:
//
// async function getAgentReply(userText) {
//   const res = await fetch("/api/chat", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ message: userText }),
//   });
//   const data = await res.json();
//   return data.reply;
// }