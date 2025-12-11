"use client";

import { useState, useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const CHAT_STORAGE_KEY = "chatbot-history";

export default function Chatbot({ isDarkMode = false }: { isDarkMode?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load chat history from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(CHAT_STORAGE_KEY);
        if (stored) {
          const parsedMessages = JSON.parse(stored).map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }));
          setMessages(parsedMessages);
        }
      } catch (error) {
        console.error("Error loading chat history:", error);
      }
    }
  }, []);

  // Save chat history to localStorage
  useEffect(() => {
    if (messages.length > 0 && typeof window !== "undefined") {
      try {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
      } catch (error) {
        console.error("Error saving chat history:", error);
      }
    }
  }, [messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      // Build chat history for API
      const chatHistory = [...messages, userMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          chatHistory,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
      console.error("Chat error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    if (confirm("Are you sure you want to clear the chat history?")) {
      setMessages([]);
      if (typeof window !== "undefined") {
        localStorage.removeItem(CHAT_STORAGE_KEY);
      }
    }
  };

  const bgColor = isDarkMode ? "rgba(17, 24, 38, 0.92)" : "#ffffff";
  const textColor = isDarkMode ? "#e5e7eb" : "#0f172a";
  const borderColor = isDarkMode ? "rgba(255,255,255,0.08)" : "#e5e7eb";
  const buttonBg = isDarkMode ? "linear-gradient(135deg, #8b5cf6, #22d3ee)" : "#2563eb";
  const buttonHover = isDarkMode ? "linear-gradient(135deg, #a855f7, #06b6d4)" : "#1d4ed8";
  const inputBg = isDarkMode ? "rgba(255,255,255,0.04)" : "#f8fafc";

  return (
    <>
      {/* Floating Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          backgroundColor: buttonBg,
          color: "#ffffff",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
          zIndex: 999,
          transition: "transform 0.2s, background-color 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.1)";
          e.currentTarget.style.backgroundColor = buttonHover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.backgroundColor = buttonBg;
        }}
      >
        {isOpen ? "✕" : "💬"}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "100px",
            right: "24px",
            width: "380px",
            maxWidth: "calc(100vw - 48px)",
            height: "600px",
            maxHeight: "calc(100vh - 140px)",
            backgroundColor: bgColor,
            borderRadius: "16px",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
            display: "flex",
            flexDirection: "column",
            zIndex: 998,
            border: `1px solid ${borderColor}`,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "1rem 1.5rem",
              borderBottom: `1px solid ${borderColor}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: isDarkMode ? "#2d2d2d" : "#f5f5f5",
              borderRadius: "16px 16px 0 0",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "1.1rem",
                fontWeight: "600",
                color: textColor,
              }}
            >
              AI Assistant
            </h3>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="button"
                onClick={handleClearChat}
                style={{
                  padding: "0.25rem 0.5rem",
                  fontSize: "0.8rem",
                  backgroundColor: "transparent",
                  color: textColor,
                  border: `1px solid ${borderColor}`,
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
                title="Clear chat"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  padding: "0.25rem 0.5rem",
                  fontSize: "1.2rem",
                  backgroundColor: "transparent",
                  color: textColor,
                  border: "none",
                  cursor: "pointer",
                  borderRadius: "4px",
                }}
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {messages.length === 0 && !loading && (
              <div
                style={{
                  textAlign: "center",
                  color: isDarkMode ? "#888" : "#666",
                  padding: "2rem 1rem",
                  fontSize: "0.9rem",
                }}
              >
                <p style={{ margin: 0 }}>
                  👋 Hi! I'm your AI assistant. How can I help you today?
                </p>
                <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.85rem" }}>
                  I can help with task management, productivity tips, and general questions.
                </p>
              </div>
            )}

            {messages.map((msg, index) => (
              <ChatMessage
                key={index}
                role={msg.role}
                content={msg.content}
                timestamp={msg.timestamp}
                isDarkMode={isDarkMode}
              />
            ))}

            {loading && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    backgroundColor: isDarkMode ? "#2d2d2d" : "#f0f0f0",
                    padding: "0.75rem 1rem",
                    borderRadius: "12px",
                    color: isDarkMode ? "#888" : "#666",
                    fontSize: "0.9rem",
                  }}
                >
                  <span>Thinking...</span>
                  <span style={{ animation: "pulse 1.5s ease-in-out infinite" }}>...</span>
                </div>
              </div>
            )}

            {error && (
              <div
                style={{
                  backgroundColor: "#f8d7da",
                  color: "#721c24",
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  marginBottom: "1rem",
                  fontSize: "0.9rem",
                }}
              >
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSendMessage}
            style={{
              padding: "1rem",
              borderTop: `1px solid ${borderColor}`,
              backgroundColor: isDarkMode ? "#2d2d2d" : "#f5f5f5",
              borderRadius: "0 0 16px 16px",
            }}
          >
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  border: `1px solid ${borderColor}`,
                  backgroundColor: inputBg,
                  color: textColor,
                  fontSize: "0.95rem",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                style={{
                  padding: "0.75rem 1.5rem",
                  borderRadius: "8px",
                  backgroundColor: loading || !input.trim() ? "#ccc" : buttonBg,
                  color: "#ffffff",
                  border: "none",
                  cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                  fontSize: "0.95rem",
                  fontWeight: "600",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!loading && input.trim()) {
                    e.currentTarget.style.backgroundColor = buttonHover;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && input.trim()) {
                    e.currentTarget.style.backgroundColor = buttonBg;
                  }
                }}
              >
                Send
              </button>
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: isDarkMode ? "#888" : "#666",
                marginTop: "0.5rem",
                textAlign: "center",
              }}
            >
              Press Enter to send, Shift+Enter for new line
            </div>
          </form>
        </div>
      )}
    </>
  );
}




