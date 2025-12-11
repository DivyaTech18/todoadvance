"use client";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
  isDarkMode?: boolean;
}

export default function ChatMessage({ 
  role, 
  content, 
  timestamp, 
  isDarkMode = false 
}: ChatMessageProps) {
  const isUser = role === "user";
  const bgColor = isDarkMode 
    ? (isUser ? "#0070f3" : "#2d2d2d") 
    : (isUser ? "#0070f3" : "#f0f0f0");
  const textColor = isDarkMode 
    ? "#ffffff" 
    : (isUser ? "#ffffff" : "#333333");
  const alignment = isUser ? "flex-end" : "flex-start";

  // Format timestamp
  const timeString = timestamp
    ? timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: alignment,
        marginBottom: "1rem",
        width: "100%",
      }}
    >
      <div
        style={{
          maxWidth: "80%",
          display: "flex",
          flexDirection: "column",
          alignItems: alignment,
        }}
      >
        <div
          style={{
            backgroundColor: bgColor,
            color: textColor,
            padding: "0.75rem 1rem",
            borderRadius: "12px",
            fontSize: "0.95rem",
            lineHeight: "1.5",
            wordWrap: "break-word",
            boxShadow: isDarkMode 
              ? "0 2px 4px rgba(0, 0, 0, 0.3)" 
              : "0 2px 4px rgba(0, 0, 0, 0.1)",
            border: isDarkMode && !isUser 
              ? "1px solid #404040" 
              : "none",
          }}
        >
          {content}
        </div>
        {timestamp && (
          <span
            style={{
              fontSize: "0.75rem",
              color: isDarkMode ? "#888" : "#666",
              marginTop: "0.25rem",
              padding: "0 0.5rem",
            }}
          >
            {timeString}
          </span>
        )}
      </div>
    </div>
  );
}




