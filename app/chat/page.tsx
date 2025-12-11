"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ChatMessage from "../components/ChatMessage";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const CHAT_STORAGE_KEY = "chatbot-history";

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Detect dark mode
  useEffect(() => {
    const stored = localStorage.getItem("todo-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDarkMode(stored === "dark" || (!stored && prefersDark));
  }, []);

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

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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

  const handleExportChat = () => {
    const chatData = {
      messages,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-history-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const bgColor = isDarkMode
    ? "linear-gradient(160deg, #05070e 0%, #0a1022 55%, #091020 100%)"
    : "#f7f7fb";
  const textColor = isDarkMode ? "#e5e7eb" : "#0f172a";
  const borderColor = isDarkMode ? "rgba(255,255,255,0.08)" : "#e5e7eb";
  const buttonBg = isDarkMode ? "linear-gradient(135deg, #8b5cf6, #22d3ee)" : "#2563eb";
  const buttonHover = isDarkMode ? "linear-gradient(135deg, #a855f7, #06b6d4)" : "#1d4ed8";
  const inputBg = isDarkMode ? "rgba(255,255,255,0.04)" : "#f1f5f9";

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: bgColor,
        color: textColor,
        fontFamily: "Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: "1rem 2rem",
          borderBottom: `1px solid ${borderColor}`,
          backgroundColor: isDarkMode ? "rgba(17,24,38,0.75)" : "#ffffff",
          borderRadius: "0 0 18px 18px",
          backdropFilter: "blur(12px)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Link
            href="/"
            style={{
              color: textColor,
              textDecoration: "none",
              fontSize: "0.9rem",
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              border: `1px solid ${borderColor}`,
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDarkMode ? "#3d3d3d" : "#e0e0e0";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            ← Home
          </Link>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "600" }}>
            AI Chat Assistant
          </h1>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            onClick={handleExportChat}
            style={{
              padding: "0.5rem 1rem",
              fontSize: "0.9rem",
              backgroundColor: "transparent",
              color: textColor,
              border: `1px solid ${borderColor}`,
              borderRadius: "6px",
              cursor: "pointer",
            }}
            title="Export chat history"
          >
            Export
          </button>
          <button
            type="button"
            onClick={handleClearChat}
            style={{
              padding: "0.5rem 1rem",
              fontSize: "0.9rem",
              backgroundColor: "transparent",
              color: textColor,
              border: `1px solid ${borderColor}`,
              borderRadius: "6px",
              cursor: "pointer",
            }}
            title="Clear chat history"
          >
            Clear
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "2rem",
          maxWidth: "900px",
          width: "100%",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {messages.length === 0 && !loading && (
          <div
            style={{
              textAlign: "center",
              color: isDarkMode ? "#888" : "#666",
              padding: "3rem 1rem",
            }}
          >
            <h2 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>👋 Welcome!</h2>
            <p style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
              I'm your AI assistant. How can I help you today?
            </p>
            <p style={{ fontSize: "0.95rem", color: isDarkMode ? "#666" : "#888" }}>
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
                padding: "1rem 1.5rem",
                borderRadius: "12px",
                color: isDarkMode ? "#888" : "#666",
                fontSize: "0.95rem",
              }}
            >
              <span>Thinking</span>
              <span style={{ animation: "pulse 1.5s ease-in-out infinite" }}>...</span>
            </div>
          </div>
        )}

        {error && (
          <div
            style={{
              backgroundColor: "#f8d7da",
              color: "#721c24",
              padding: "1rem 1.5rem",
              borderRadius: "12px",
              marginBottom: "1rem",
              fontSize: "0.95rem",
            }}
          >
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div
        style={{
          padding: "1.5rem 2rem",
          borderTop: `1px solid ${borderColor}`,
          backgroundColor: isDarkMode ? "#2d2d2d" : "#f5f5f5",
        }}
      >
        <form
          onSubmit={handleSendMessage}
          style={{
            maxWidth: "900px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          {error && (
            <div
              style={{
                backgroundColor: "#f8d7da",
                color: "#721c24",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                fontSize: "0.9rem",
              }}
            >
              {error}
            </div>
          )}
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end" }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Shift+Enter for new line)"
              disabled={loading}
              rows={3}
              style={{
                flex: 1,
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                border: `1px solid ${borderColor}`,
                backgroundColor: inputBg,
                color: textColor,
                fontSize: "0.95rem",
                outline: "none",
                resize: "vertical",
                fontFamily: "inherit",
                minHeight: "60px",
                maxHeight: "150px",
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                padding: "0.75rem 2rem",
                borderRadius: "8px",
                backgroundColor: loading || !input.trim() ? "#ccc" : buttonBg,
                color: "#ffffff",
                border: "none",
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                fontSize: "1rem",
                fontWeight: "600",
                transition: "background-color 0.2s",
                height: "fit-content",
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
              fontSize: "0.8rem",
              color: isDarkMode ? "#888" : "#666",
              textAlign: "center",
            }}
          >
            Press Enter to send, Shift+Enter for new line • Messages are saved automatically
          </div>
        </form>
      </div>
    </div>
  );
}




