// src/pages/Signup.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

/*
  ✅ Signup Component (with justSignedUp + redirect)
  - Sends data to backend (includes password2)
  - Falls back to localStorage if backend fails
  - Sets localStorage.justSignedUp = "1" on success
  - Redirects to /dashboard
*/

export default function Signup() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  function validate() {
    if (!firstName) return "Enter your first name";
    if (!lastName) return "Enter your last name";
    if (!email) return "Enter your email";
    const r = /^\S+@\S+\.\S+$/;
    if (!r.test(email)) return "Enter a valid email";
    if (!pw || pw.length < 4) return "Password must be at least 4 characters";
    if (pw !== pw2) return "Passwords do not match";
    return null;
  }

  async function handleSignup(e) {
    e.preventDefault();
    setErr("");
    const v = validate();
    if (v) {
      setErr(v);
      return;
    }

    setLoading(true);
    const backendUrl = "http://127.0.0.1:8000/api/users/";
    const computedUsername =
      username || (firstName + (lastName ? lastName[0] : "")).toLowerCase();

    const payload = {
      username: computedUsername,
      email,
      password: pw,
      password2: pw2, // backend expects this
      first_name: firstName,
      last_name: lastName,
    };

    try {
      const res = await fetch(backendUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (res.ok) {
        // ✅ backend success
        const created = {
          id: data?.id ?? data?.pk ?? `backend-${Date.now()}`,
          name: `${data?.first_name ?? firstName} ${data?.last_name ?? lastName}`.trim(),
          email: data?.email ?? email,
          username: data?.username ?? computedUsername,
        };

        try {
          localStorage.setItem("customer", JSON.stringify(created));
        } catch (lerr) {
          console.warn("Could not save customer to localStorage:", lerr);
        }

        setLoading(false);

        // ⭐ NEW: show welcome toast on Dashboard
        localStorage.setItem("justSignedUp", "1");

        // redirect
        setTimeout(() => navigate("/dashboard"), 400);
        return;
      } else {
        // ❌ backend validation/error
        setLoading(false);
        if (data && typeof data === "object") {
          try {
            const human = Object.entries(data)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
              .join(" • ");
            setErr(human);
          } catch {
            setErr(JSON.stringify(data));
          }
        } else {
          setErr(data ? JSON.stringify(data) : `Signup failed: ${res.status}`);
        }
        console.warn("Signup backend returned", res.status, data);
        return;
      }
    } catch (networkErr) {
      // 🕸 offline / server down → fallback to local
      console.warn("Signup network error:", networkErr);
      const fallback = {
        id: `local-${Date.now()}`,
        name: `${firstName} ${lastName}`.trim(),
        email,
        username: computedUsername,
      };

      try {
        localStorage.setItem("customer", JSON.stringify(fallback));
        setLoading(false);

        // ⭐ NEW: show welcome toast on Dashboard
        localStorage.setItem("justSignedUp", "1");

        // redirect
        setTimeout(() => navigate("/dashboard"), 400);
        return;
      } catch (errSave) {
        setLoading(false);
        setErr("Failed to save user locally. Try again.");
        console.error(errSave);
        return;
      }
    }
  }

  // ---- Styles ----
  const container = {
    minHeight: "80vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, Arial",
    background: "#f6f8fb",
  };

  const card = {
    width: "100%",
    maxWidth: 520,
    background: "#fff",
    borderRadius: 14,
    padding: 34,
    boxShadow: "0 20px 50px rgba(10,20,40,0.07)",
    border: "1px solid #eef2f6",
    textAlign: "left",
    transform: "translateY(-30px)",
  };

  const heading = { fontSize: 24, marginBottom: 8, fontWeight: 800, color: "#0b1220" };
  const hint = { color: "#6b7280", marginBottom: 14 };

  const input = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 8,
    border: "1px solid #eef2f6",
    marginBottom: 10,
    boxSizing: "border-box",
    fontSize: 15,
  };

  const btn = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "none",
    background: "#059669",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  };

  return (
    <div style={container}>
      <div style={card}>
        <h2 style={heading}>Create your account</h2>
        <div style={hint}>Sign up to manage orders, track shipments and more.</div>

        <form onSubmit={handleSignup}>
          <input
            style={input}
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />

          <input
            style={input}
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />

          <input
            style={input}
            placeholder="Username (optional)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            style={input}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            style={input}
            placeholder="Password"
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />

          <input
            style={input}
            placeholder="Confirm password"
            type="password"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
          />

          {err && <div style={{ color: "#ef4444", marginBottom: 10 }}>{err}</div>}

          <button type="submit" style={btn} disabled={loading}>
            {loading ? "Creating…" : "Sign Up"}
          </button>
        </form>

        <div style={{ marginTop: 12, color: "#6b7280", textAlign: "center" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#0a6bd6", fontWeight: 700 }}>
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}