"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!email || !password) {
      setMessage({ type: "error", text: "Please fill in all fields" });
      setLoading(false);
      return;
    }

    if (!email.includes("@")) {
      setMessage({ type: "error", text: "Please enter a valid email address" });
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      setLoading(false);
      return;
    }

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          setMessage({ type: "error", text: error.message });
        } else {
          setMessage({ type: "success", text: "Account created! Please log in." });
          setEmail("");
          setPassword("");
          setTimeout(() => {
            setMode("login");
            setMessage(null);
          }, 2000);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setMessage({ type: "error", text: error.message });
        } else {
          router.push("/todo");
        }
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "An unexpected error occurred" });
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    setMessage(null);
    setEmail("");
    setPassword("");
  };

  return (
    <div className="page-shell">
      <div className="page-content" style={{ maxWidth: "520px", width: "100%" }}>
        <div
          className="glass-panel"
          style={{
            padding: "32px",
            borderRadius: "20px",
            border: "1px solid rgba(255,255,255,0.08)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 30% 10%, rgba(139, 92, 246, 0.12), transparent 30%), radial-gradient(circle at 80% 20%, rgba(34, 211, 238, 0.12), transparent 30%)",
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative" }}>
            <div className="pill" style={{ marginBottom: "12px", width: "fit-content" }}>
              <span>🔐</span> Secure workspace access
            </div>
            <h1 style={{ fontSize: "30px", margin: "0 0 6px" }}>
              {mode === "login" ? "Welcome back" : "Create your space"}
            </h1>
            <p className="muted" style={{ margin: "0 0 20px" }}>
              {mode === "login"
                ? "Sign in to your task cockpit and pick up where you left off."
                : "Sign up to start tracking tasks with a clean, code-first vibe."}
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label
                  htmlFor="email"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    color: "var(--foreground)",
                    fontWeight: 600,
                  }}
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@workspace.dev"
                  disabled={loading}
                  required
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.05)",
                    color: "var(--foreground)",
                    outline: "none",
                    fontSize: "15px",
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    color: "var(--foreground)",
                    fontWeight: 600,
                  }}
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  required
                  minLength={6}
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(255,255,255,0.05)",
                    color: "var(--foreground)",
                    outline: "none",
                    fontSize: "15px",
                  }}
                />
              </div>

              {message && (
                <div
                  className="glass-panel"
                  style={{
                    padding: "12px 14px",
                    borderRadius: "12px",
                    borderColor: message.type === "success" ? "rgba(16, 185, 129, 0.4)" : "rgba(239,68,68,0.4)",
                    color: message.type === "success" ? "#bbf7d0" : "#fecdd3",
                  }}
                >
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="button-primary"
                style={{ width: "100%", padding: "14px", fontSize: "15px" }}
              >
                {loading ? "Processing..." : mode === "login" ? "Sign in" : "Create account"}
              </button>

              <div style={{ textAlign: "center", fontSize: "14px", color: "var(--muted)" }}>
                {mode === "login" ? "New here?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={toggleMode}
                  disabled={loading}
                  className="button-ghost"
                  style={{ padding: "8px 12px", fontSize: "13px" }}
                >
                  {mode === "login" ? "Create account" : "Back to login"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

