"use client";

import Link from "next/link";

export default function AuthPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5",
        fontFamily: "Arial, sans-serif",
        padding: "2rem",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "8px",
          padding: "3rem",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          maxWidth: "400px",
          width: "100%",
        }}
      >
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            marginBottom: "2rem",
            color: "#333",
            textAlign: "center",
          }}
        >
          Welcome
        </h1>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <Link
            href="/todo"
            style={{
              display: "inline-block",
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              fontWeight: "600",
              color: "#fff",
              backgroundColor: "#0070f3",
              borderRadius: "8px",
              textDecoration: "none",
              textAlign: "center",
              transition: "background-color 0.2s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#0051cc")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#0070f3")
            }
          >
            Login
          </Link>
          <Link
            href="/todo"
            style={{
              display: "inline-block",
              padding: "0.75rem 1.5rem",
              fontSize: "1rem",
              fontWeight: "600",
              color: "#0070f3",
              backgroundColor: "transparent",
              border: "2px solid #0070f3",
              borderRadius: "8px",
              textDecoration: "none",
              textAlign: "center",
              transition: "background-color 0.2s, color 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#0070f3";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#0070f3";
            }}
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}

