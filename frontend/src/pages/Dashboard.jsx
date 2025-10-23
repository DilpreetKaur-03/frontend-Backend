// src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import Confetti from "react-confetti";

export default function Dashboard() {
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("customer") || "null");
    } catch {
      return null;
    }
  }, []);

  const [showConfetti, setShowConfetti] = useState(true);
  const [showToast, setShowToast] = useState(false);

  // Confetti 4s ke liye
  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(t);
  }, []);

  // Just-signed-up toast (frontend signup ke baad yeh flag set karo)
  // localStorage.setItem("justSignedUp", "1")
  useEffect(() => {
    if (localStorage.getItem("justSignedUp") === "1") {
      setShowToast(true);
      const t = setTimeout(() => setShowToast(false), 3000);
      // flag hata do taaki next load par na aaye
      localStorage.removeItem("justSignedUp");
      return () => clearTimeout(t);
    }
  }, []);

  const displayName = user?.name || user?.email || "Guest";

  const initials = useMemo(() => {
    if (!displayName || displayName === "Guest") return "G";
    const parts = String(displayName).trim().split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
  }, [displayName]);

  const handleLogout = () => {
    // apne storage keys ke hisaab se clear karo
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("customer");
    // optional: koi cart keys bhi clear karna ho to
    // localStorage.removeItem("cart");
    window.location.href = "/login"; // ya "/"
  };

  if (!user) {
    return (
      <div style={styles.wrap}>
        <div style={styles.card}>
          <h1 style={styles.title}>Dashboard</h1>
          <p style={styles.muted}>You’re not logged in.</p>
          <div style={styles.row}>
            <a href="/login" style={styles.primaryBtn}>Login</a>
            <a href="/signup" style={styles.ghostBtn}>Create account</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100dvh", background: "linear-gradient(180deg,#f8fafc,#ffffff)" }}>
      {showConfetti && <Confetti />}

      {/* toast */}
      {showToast && (
        <div style={styles.toast}>
          <span>Account created! Welcome, <strong>{displayName}</strong> 🎉</span>
        </div>
      )}

      <div style={styles.wrap}>
        <div style={styles.card}>
          {/* header */}
          <div style={styles.header}>
            <div style={styles.avatar}>{initials}</div>
            <div>
              <div style={styles.welcome}>Welcome back</div>
              <div style={styles.name}>{displayName}</div>
            </div>
          </div>

          {/* actions */}
          <div style={{ height: 8 }} />
          <div style={styles.row}>
            <a href="/products" style={styles.primaryBtn}>Browse Products</a>
            <button onClick={handleLogout} style={styles.dangerBtn}>Logout</button>
          </div>

          {/* info */}
          <div style={{ height: 16 }} />
          <p style={styles.mutedSmall}>
            Tip: You can find your recent orders in <a href="/orders" style={styles.link}>Orders</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

/* --- inline styles (simple, dependency-free) --- */
const styles = {
  wrap: {
    minHeight: "100dvh",
    display: "grid",
    placeItems: "center",
    padding: 24,
  },
  card: {
    width: "min(680px, 92vw)",
    background: "#fff",
    borderRadius: 20,
    padding: 24,
    boxShadow:
      "0 10px 20px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.05)",
    border: "1px solid #eef2f7",
    animation: "fadeIn .3s ease",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  },
  title: {
    fontSize: 28,
    fontWeight: 800,
    margin: 0,
  },
  header: {
    display: "flex",
    gap: 16,
    alignItems: "center",
    marginBottom: 8,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    fontWeight: 700,
    color: "#0f172a",
    background:
      "linear-gradient(135deg, #e9d5ff, #dbeafe)",
    border: "1px solid #e5e7eb",
  },
  welcome: {
    fontSize: 13,
    letterSpacing: 0.4,
    color: "#6b7280",
    textTransform: "uppercase",
  },
  name: {
    fontSize: 22,
    fontWeight: 800,
    color: "#0f172a",
    marginTop: 2,
  },
  row: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
  },
  primaryBtn: {
    padding: "10px 14px",
    borderRadius: 12,
    background: "#111827",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 600,
    border: "1px solid #111827",
  },
  ghostBtn: {
    padding: "10px 14px",
    borderRadius: 12,
    background: "#fff",
    color: "#111827",
    textDecoration: "none",
    fontWeight: 600,
    border: "1px solid #e5e7eb",
  },
  dangerBtn: {
    padding: "10px 14px",
    borderRadius: 12,
    background: "#fee2e2",
    color: "#991b1b",
    fontWeight: 700,
    border: "1px solid #fecaca",
    cursor: "pointer",
  },
  muted: { color: "#6b7280", marginTop: 6 },
  mutedSmall: { color: "#6b7280", margin: 0, fontSize: 13 },
  link: { color: "#111827", fontWeight: 600, textDecoration: "underline" },
  toast: {
    position: "fixed",
    top: 16,
    left: "50%",
    transform: "translateX(-50%)",
    background: "#111827",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: 12,
    boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
    zIndex: 50,
  },
};