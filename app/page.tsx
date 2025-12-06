"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <main
        style={{
          textAlign: "center",
          padding: "2rem",
          maxWidth: "600px",
          width: "100%",
        }}
      >
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: "bold",
            marginBottom: "1rem",
            color: "#333",
          }}
        >
          Welcome to Your Personal Task Manager
        </h1>
        <p
          style={{
            fontSize: "1.2rem",
            color: "#666",
            marginBottom: "2rem",
            lineHeight: "1.6",
          }}
        >
          Organize your tasks and stay productive with our simple and intuitive
          task management system.
        </p>
        <Link
          href="/auth"
          style={{
            display: "inline-block",
            padding: "0.75rem 2rem",
            fontSize: "1.1rem",
            fontWeight: "600",
            color: "#fff",
            backgroundColor: "#0070f3",
            borderRadius: "8px",
            textDecoration: "none",
            transition: "background-color 0.2s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#0051cc")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#0070f3")}
        >
          Get Started
        </Link>
      </main>
    </div>
  );
}
