// src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

/**
 Forgot password page (client-side simulate)
 Enter email -> "send" reset link (generates token stored in localStorage)
 Shows friendly confirmation; for dev/test shows a clickable debug link
 Real implementation: replace token generation & storage with API call
*/

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(""); // "", "sent", "error"
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  function validateEmail(e) {
    if (!e) return "Please enter email";
    const r = /^\S+@\S+\.\S+$/;
    if (!r.test(e)) return "Enter a valid email";
    return null;
  }

  // helper to create token and save to localStorage as dev/mock backend
  function createResetToken(email) {
    const token = Math.random().toString(36).slice(2, 10);
    const expires = Date.now() + 1000 * 60 * 30; // 30 minutes
    const store = JSON.parse(localStorage.getItem("pw_reset_tokens") || "{}");
    store[email] = { token, expires };
    localStorage.setItem("pw_reset_tokens", JSON.stringify(store));
    return token;
  }

  async function handleSend(e) {
    e && e.preventDefault();
    setError("");
    const v = validateEmail(email);
    if (v) {
      setError(v);
      return;
    }

    setSending(true);

    try {
      // simulate network delay
      await new Promise((r) => setTimeout(r, 600));

      // For dev we generate token & store (production: call backend)
      const token = createResetToken(email);

      console.debug("pw_reset_tokens:", localStorage.getItem("pw_reset_tokens"));

      // Successful "send"
      setStatus("sent");

      // ==== KEY: automatically open the reset route for dev testing ====
      // This will navigate to: /reset?email=you%40example.com&token=abcd1234
      navigate(`/reset?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`);
      // =================================================================

      // If you prefer not to auto-navigate, remove the navigate() line above
      // and rely on the "Open dev reset link" button below.
    } catch (err) {
      console.error("send reset error", err);
      setStatus("error");
      setError("Network error, try again.");
    } finally {
      setSending(false);
    }
  }

  // Shortcut for dev: open reset page with token (only if token was created)
  function openDevReset() {
    const store = JSON.parse(localStorage.getItem("pw_reset_tokens") || "{}");
    const entry = store[email];
    if (!entry) {
      setError("No reset token found for this email (send first).");
      return;
    }
    // navigate to reset route with token and email as query params
    navigate(`/reset?email=${encodeURIComponent(email)}&token=${encodeURIComponent(entry.token)}`);
  }

  const page = {
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, Arial",
    minHeight: "74vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    background: "#f7fbff",
  };
  const card = {
    width: "100%",
    maxWidth: 760,
    background: "#fff",
    borderRadius: 12,
    padding: 22,
    boxShadow: "0 12px 36px rgba(10,20,40,0.06)",
    border: "1px solid #eef4f8",
    display: "grid",
    gridTemplateColumns: "1fr 320px",
    gap: 18,
  };
  const left = { paddingRight: 6 };
  const heading = { fontSize: 26, fontWeight: 800, marginBottom: 6, color: "#0b1220" };
  const subtitle = { color: "#6b7280", marginBottom: 14 };
  const input = { width: "100%", padding: "12px 14px", borderRadius: 8, border: "1px solid #e6eef6", fontSize: 15, marginBottom: 12 };
  const btn = { padding: "12px 16px", borderRadius: 10, border: "none", background: "#0a3d62", color: "#fff", fontWeight: 700, cursor: "pointer" };
  const small = { fontSize: 13, color: "#6b7280" };

  return (
    <div style={page}>
      <div style={card}>
        <div style={left}>
          <div style={heading}>Reset your password</div>
          <div style={subtitle}>Enter the email address for your account and we’ll send a password reset link.</div>

          <form onSubmit={handleSend}>
            <input
              style={input}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />

            {error && <div style={{ color: "#ef4444", marginBottom: 10 }}>{error}</div>}

            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" style={btn} disabled={sending}>
                {sending ? "Sending…" : "Send reset link"}
              </button>

              <Link to="/login" style={{ textDecoration: "none", alignSelf: "center" }}>
                <button type="button" style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid #e6eef6", background: "#fff", cursor: "pointer" }}>
                  Back to login
                </button>
              </Link>
            </div>
          </form>

          <div style={{ marginTop: 18 }}>
            <div style={small}>After you submit, check your email for a link to reset your password.</div>

            {/* Note: dev-only instructions */}
            <div style={{ marginTop: 10, fontSize: 13, color: "#475569" }}>
              Dev/testing: after sending you can click the debug link below to open the reset page directly (no real email sent).
            </div>

            <div style={{ marginTop: 10 }}>
              <button onClick={openDevReset} style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #e6eef6", background: "#f3f7fb", cursor: "pointer" }}>
                Open dev reset link
              </button>
            </div>
          </div>
        </div>

        {/* Right column: short explanation (no flowchart shown) */}
        <aside style={{ padding: 12, borderRadius: 8, background: "linear-gradient(180deg,#fbfdff,#ffffff)", border: "1px solid #eef6fb" }}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>What happens next</div>
          <div style={small}>
            • We send a secure, time-limited reset link to your email.
            <br />
            • Click the link in the email to open a page where you can set a new password.
            <br />
            • After you reset your password you will be redirected to the login page.
          </div>
        </aside>
      </div>
    </div>
  );
}