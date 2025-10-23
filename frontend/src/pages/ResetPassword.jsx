// src/pages/ResetPassword.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

/**
 Reset page (dev)
 - Reads email & token from query string
 - Validates against localStorage.pw_reset_tokens (dev store)
 - Lets user set a new password (dev-only: does not update real backend)
 - Removes token and redirects to /login
*/

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("");
  const [ok, setOk] = useState(false);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const e = searchParams.get("email") || "";
    const t = searchParams.get("token") || "";
    setEmail(e);
    setToken(t);

    if (!e || !t) {
      setStatus("Missing email or token in link.");
      return;
    }

    let store = {};
    try {
      store = JSON.parse(localStorage.getItem("pw_reset_tokens") || "{}");
    } catch (err) {
      store = {};
    }
    const entry = store[e];
    if (!entry || entry.token !== t) {
      setStatus("Invalid or expired token (dev).");
      return;
    }
    if (entry.expires && Date.now() > entry.expires) {
      setStatus("Token expired (dev).");
      return;
    }
    setOk(true);
    setStatus("Token valid — enter a new password.");
  }, [searchParams]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!ok) return;
    if (!password || password.length < 4) {
      setStatus("Password too short.");
      return;
    }

    // Dev: remove token (simulate password reset)
    try {
      const store = JSON.parse(localStorage.getItem("pw_reset_tokens") || "{}");
      delete store[email];
      localStorage.setItem("pw_reset_tokens", JSON.stringify(store));
    } catch (err) {
      // ignore
    }

    setStatus("Password updated (dev). Redirecting to login...");
    setTimeout(() => navigate("/login"), 900);
  }

  return (
    <div style={{ maxWidth: 720, margin: "48px auto", padding: 20, fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto" }}>
      <h2 style={{ fontSize: 24, marginBottom: 8 }}>Set a new password</h2>
      <div style={{ color: "#6b7280", marginBottom: 14 }}>{status}</div>

      <form onSubmit={handleSubmit}>
        <label style={{ display: "block", marginBottom: 10 }}>
          Email
          <input value={email} readOnly style={{ width: "100%", padding: 10, marginTop: 6, borderRadius: 8, border: "1px solid #e6eef6" }} />
        </label>

        <label style={{ display: "block", marginBottom: 10 }}>
          New password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", padding: 10, marginTop: 6, borderRadius: 8, border: "1px solid #e6eef6" }} />
        </label>

        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={!ok} style={{ padding: "10px 14px", borderRadius: 8, border: "none", background: ok ? "#0a3d62" : "#94a3b8", color: "#fff", fontWeight: 700 }}>
            Set password
          </button>
        </div>
      </form>
    </div>
  );
}