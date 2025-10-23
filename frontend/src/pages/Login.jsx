// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginWithPassword, getMyProfile } from "../lib/api";

export default function Login() {
  const navigate = useNavigate();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  // ✅ Validation
  function validate() {
    if (!usernameOrEmail.trim() || !password.trim()) {
      return "⚠️ All fields are required!";
    }
    if (usernameOrEmail.includes("@")) {
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(usernameOrEmail)) {
        return "Enter a valid email address";
      }
    }
    if (password.length < 4) {
      return "Password too short (min 4 characters)";
    }
    return null;
  }

  // ✅ Handle login
  async function handleLogin(e) {
    e.preventDefault();
    setErr("");
    const v = validate();
    if (v) {
      setErr(v);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setLoading(true);
    try {
      await loginWithPassword(usernameOrEmail, password);

      // 👤 Optional: Fetch profile for name/email cache
      try {
        const profile = await getMyProfile();
        const name =
          (profile?.first_name || "") + " " + (profile?.last_name || "");
        const customer = {
          name: name.trim() || usernameOrEmail,
          email:
            profile?.email ||
            (usernameOrEmail.includes("@") ? usernameOrEmail : ""),
          username: profile?.user?.username || "",
        };
        localStorage.setItem("customer", JSON.stringify(customer));
      } catch {
        // ignore; no crash if profile not available
      }

      setLoading(false);
      // ✅ Directly redirect to Home (instead of /profile)
      navigate("/");
    } catch (e) {
      setLoading(false);
      setErr(e?.message || "Login failed. Please check your credentials.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }

  // ✅ Handle Enter key (auto submit)
  useEffect(() => {
    const handleEnter = (e) => {
      if (e.key === "Enter" && !loading) {
        document.getElementById("loginForm").requestSubmit();
      }
    };
    window.addEventListener("keydown", handleEnter);
    return () => window.removeEventListener("keydown", handleEnter);
  }, [loading]);

  // -------- Styles --------
  const page = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(180deg,#f7fbff 0%, #ffffff 60%)",
    padding: 20,
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, Arial",
    color: "#0b1220",
  };
  const card = {
    width: "100%",
    maxWidth: 500,
    background: "#fff",
    borderRadius: 14,
    padding: 40,
    boxShadow: "0 20px 50px rgba(10,20,40,0.07)",
    border: "1px solid #eef2f6",
    textAlign: "center",
    transform: "translateY(-80px)",
  };
  const title = {
    fontSize: 36,
    margin: "6px 0 8px",
    fontWeight: 800,
    color: "#0b1220",
  };
  const subtitle = { color: "#475569", marginBottom: 18, fontSize: 15 };
  const field = {
    display: "block",
    width: "100%",
    marginBottom: 12,
    fontSize: 14,
    textAlign: "left",
  };
  const input = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid #e6eef6",
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box",
  };
  const primaryBtn = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "none",
    background: "#0a3d62",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    marginTop: 6,
  };
  const smallLink = {
    color: "#0a6bd6",
    textDecoration: "none",
    fontWeight: 600,
  };
  const shakeAnim = {
    animation: shake ? "shake 0.3s ease" : "none",
  };

  return (
    <>
      {/* ✅ Animation for shake */}
      <style>{`
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          50% { transform: translateX(6px); }
          75% { transform: translateX(-4px); }
          100% { transform: translateX(0); }
        }
      `}</style>

      <div style={page}>
        <div style={{ ...card, ...shakeAnim }}>
          <div style={{ marginBottom: 6, color: "#0a3d62", fontWeight: 800 }}>
            Electronics
          </div>
          <h1 style={title}>Sign in to your account</h1>
          <div style={subtitle}>
            Welcome back — enter your details to access your account.
          </div>

          <form id="loginForm" onSubmit={handleLogin}>
            <label style={field}>
              <div style={{ marginBottom: 6, fontWeight: 700 }}>
                Email or Username
              </div>
              <input
                type="text"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                style={input}
                placeholder="you@example.com or username"
                autoComplete="username"
                disabled={loading}
              />
            </label>

            <label style={field}>
              <div style={{ marginBottom: 6, fontWeight: 700 }}>Password</div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={input}
                placeholder="Enter password"
                autoComplete="current-password"
                disabled={loading}
              />
            </label>

            {err && (
              <div
                style={{
                  color: "#ef4444",
                  background: "#fee2e2",
                  padding: "8px 12px",
                  borderRadius: 8,
                  marginBottom: 10,
                  fontWeight: 600,
                }}
              >
                {err}
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <Link to="/forgot" style={smallLink}>
                Forgot password?
              </Link>
              <div style={{ color: "#94a3b8", fontSize: 13 }}>
                Trusted & secure — Canada operations
              </div>
            </div>

            <button type="submit" style={primaryBtn} disabled={loading}>
              {loading ? "Signing in…" : "Login"}
            </button>

            <div
              style={{
                marginTop: 14,
                textAlign: "center",
                color: "#6b7280",
              }}
            >
              Don’t have an account?{" "}
              <Link to="/signup" style={{ color: "#059669", fontWeight: 700 }}>
                Sign Up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}