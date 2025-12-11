"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="page-shell">
      <div className="page-content">
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "32px",
          }}
        >
          <div className="pill">
            <span>🧭</span>
            <span>Taskflow • powered by Supabase</span>
          </div>
          <nav style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <Link className="button-ghost" href="/todo">
              Dashboard
            </Link>
            <Link className="button-primary" href="/auth">
              Launch App
            </Link>
          </nav>
        </header>

        <main
          className="glass-panel"
          style={{
            padding: "40px",
            borderRadius: "20px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 15% 20%, rgba(139, 92, 246, 0.12), transparent 25%), radial-gradient(circle at 80% 0%, rgba(34, 211, 238, 0.12), transparent 25%)",
              pointerEvents: "none",
            }}
          />
          <div style={{ position: "relative", display: "grid", gap: "24px", gridTemplateColumns: "2fr 1fr" }}>
            <div>
              <h1 style={{ fontSize: "48px", lineHeight: "1.1", margin: 0 }}>
                Build, ship, and track your tasks like a developer.
              </h1>
              <p
                className="muted"
                style={{
                  fontSize: "18px",
                  lineHeight: "1.7",
                  margin: "16px 0 24px",
                  maxWidth: "620px",
                }}
              >
                A sleek workspace with an AI assistant, crafted for people who love clean code
                and modern tooling. Capture ideas, prioritize work, and chat with your copilot —
                all in one place.
              </p>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <Link className="button-primary" href="/auth">
                  Get Started
                </Link>
                <Link className="button-ghost" href="/chat">
                  Try the AI Copilot
                </Link>
              </div>
              <div
                className="code-block"
                style={{
                  marginTop: "28px",
                  fontSize: "14px",
                  display: "grid",
                  gap: "6px",
                }}
              >
                <span style={{ color: "#7dd3fc" }}>const</span> workspace = {"{"}
                <span style={{ color: "#a5b4fc" }}> focus:</span> "deep",{" "}
                <span style={{ color: "#a5b4fc" }}>flow:</span> "uninterrupted",{" "}
                <span style={{ color: "#a5b4fc" }}>assistant:</span> "always-on"
                {"};"}
              </div>
            </div>
            <div
              className="glass-panel"
              style={{
                padding: "20px",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.03)",
                display: "grid",
                gap: "12px",
                alignContent: "start",
              }}
            >
              <div className="pill" style={{ width: "fit-content" }}>
                <span>✨</span> Live preview
              </div>
              <div className="code-block" style={{ fontSize: "13px" }}>
                <div style={{ color: "#a5b4fc" }}>// Today</div>
                <div>• Refine onboarding flow</div>
                <div>• Draft API docs</div>
                <div>• Ship feature flag rollout</div>
              </div>
              <div className="code-block" style={{ fontSize: "13px" }}>
                <div style={{ color: "#a5b4fc" }}>assistant()</div>
                <div>{'=> "Need a summary of tasks?"'}</div>
                <div>{'=> "Want me to set priorities?"'}</div>
              </div>
              <div className="pill" style={{ width: "fit-content" }}>
                <span>🛡</span> Synced securely with Supabase
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
