// src/pages/Profile.jsx
import React, { useEffect, useMemo, useState } from "react";

const PROVINCES = [
  "Alberta","British Columbia","Manitoba","New Brunswick",
  "Newfoundland and Labrador","Nova Scotia","Ontario",
  "Prince Edward Island","Quebec","Saskatchewan",
  "Northwest Territories","Nunavut","Yukon",
];

const postalRegex = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ ]?\d[ABCEGHJ-NPRSTV-Z]\d$/i;
const phoneRegex  = /^\+?1?[-. (]*\d{3}[-. )]*\d{3}[-. ]*\d{4}$/;
const API_URL = "http://127.0.0.1:8000/api/profile/me/";

export default function Profile() {
  const baseUser = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("customer") || "null"); }
    catch { return null; }
  }, []);
  const baseProfile = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("profile") || "null"); }
    catch { return null; }
  }, []);

  const [form, setForm] = useState({
    first_name: baseUser?.name?.split(" ")[0] || "",
    last_name:  baseUser?.name?.split(" ").slice(1).join(" ") || "",
    email:      baseUser?.email || "",
    phone:      baseProfile?.phone || "",
    address1:   baseProfile?.address1 || "",
    address2:   baseProfile?.address2 || "",
    city:       baseProfile?.city || "",
    province:   baseProfile?.province || "Ontario",
    postalCode: baseProfile?.postalCode || "",
  });

  const [avatarPreview, setAvatarPreview] = useState(baseProfile?.avatarDataUrl || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [toast, setToast] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  // Load current profile from backend (if logged in)
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) { setLoading(false); return; }
    (async () => {
      try {
        const res = await fetch(API_URL, { headers: { Authorization: `Bearer ${token}` }});
        if (!res.ok) { setLoading(false); return; }
        const data = await res.json();
        setForm(prev => ({
          ...prev,
          first_name: data.first_name ?? prev.first_name,
          last_name:  data.last_name  ?? prev.last_name,
          email:      data.email      ?? prev.email,
          phone:      data.phone      ?? prev.phone,
          address1:   data.address1   ?? prev.address1,
          address2:   data.address2   ?? prev.address2,
          city:       data.city       ?? prev.city,
          province:   data.province   ?? prev.province,
          postalCode: data.postal_code ?? prev.postalCode,
        }));
        if (data.avatar) setAvatarPreview(data.avatar);
        localStorage.setItem("profile", JSON.stringify({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
          address1: data.address1,
          address2: data.address2,
          city: data.city,
          province: data.province,
          postalCode: data.postal_code,
          avatarDataUrl: data.avatar || "",
        }));
      } catch {}
      setLoading(false);
    })();
  }, []);

  const onChange = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const onAvatar = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    setAvatarFile(f);
    const r = new FileReader();
    r.onload = () => setAvatarPreview(r.result.toString());
    r.readAsDataURL(f);
  };

  const validate = () => {
    if (!form.first_name) return "Please enter your first name.";
    if (!form.last_name)  return "Please enter your last name.";
    if (!form.email)      return "Please enter your email.";
    if (form.phone && !phoneRegex.test(form.phone)) return "Enter a valid Canadian/US phone number.";
    if (form.postalCode && !postalRegex.test(form.postalCode)) return "Enter postal code in format A1A 1A1.";
    return null;
  };

  const saveLocally = () => {
    const profile = { ...form, avatarDataUrl: avatarPreview, updatedAt: new Date().toISOString() };
    localStorage.setItem("profile", JSON.stringify(profile));
    const display = { ...(baseUser || {}), name: `${form.first_name} ${form.last_name}`.trim(), email: form.email };
    localStorage.setItem("customer", JSON.stringify(display));
  };

  // 🔑 Save ALL fields (+avatar) as multipart/form-data (single PATCH)
  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    const v = validate(); if (v) { setError(v); return; }

    const token = localStorage.getItem("access");
    if (!token) { saveLocally(); setToast("Saved locally (not signed in)."); return; }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("first_name", form.first_name);
      fd.append("last_name", form.last_name);
      fd.append("email", form.email);
      fd.append("phone", form.phone || "");
      fd.append("address1", form.address1 || "");
      fd.append("address2", form.address2 || "");
      fd.append("city", form.city || "");
      fd.append("province", form.province || "");
      fd.append("postal_code", form.postalCode || "");
      if (avatarFile) fd.append("avatar", avatarFile);

      const res = await fetch(API_URL, {
        method: "PATCH",                 // <— important
        headers: { Authorization: `Bearer ${token}` }, // no Content-Type here
        body: fd,
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || "Profile save failed");
      }

      // backend response (optional) -> sync local cache
      saveLocally();
      setToast("Profile saved 🇨🇦");
    } catch (err) {
      console.warn("Profile save error:", err);
      saveLocally();
      setToast("Saved locally (offline).");
    } finally {
      setSaving(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("customer");
    window.location.href = "/login";
  };

  if (!baseUser) {
    return (
      <div style={styles.wrap}>
        <div style={styles.card}>
          <h1 style={styles.title}>Profile</h1>
          <p style={styles.muted}>You need to sign in to view your profile.</p>
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
      {toast && <div style={styles.toast}>{toast}</div>}
      <div style={styles.wrap}>
        <form onSubmit={handleSave} style={styles.card}>
          <div style={{ display: "flex", gap: 18, alignItems: "center", marginBottom: 10 }}>
            <div style={styles.avatarBox}>
              {avatarPreview ? <img alt="avatar" src={avatarPreview} style={styles.avatarImg} /> :
                <div style={styles.avatarFallback}>{(form.first_name[0] || "U").toUpperCase()}</div>}
            </div>
            <div>
              <div style={styles.title}>Profile</div>
              <label style={styles.smallBtn}>
                Upload avatar
                <input type="file" accept="image/*" onChange={onAvatar} style={{ display: "none" }} />
              </label>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 10, color: "#6b7280" }}>Loading…</div>
          ) : (
            <>
              <div style={styles.grid}>
                <div><label style={styles.label}>First name</label>
                  <input style={styles.input} value={form.first_name}
                         onChange={(e) => onChange("first_name", e.target.value)} /></div>
                <div><label style={styles.label}>Last name</label>
                  <input style={styles.input} value={form.last_name}
                         onChange={(e) => onChange("last_name", e.target.value)} /></div>
                <div><label style={styles.label}>Email</label>
                  <input style={styles.input} value={form.email} type="email"
                         onChange={(e) => onChange("email", e.target.value)} /></div>
                <div><label style={styles.label}>Phone (Canada)</label>
                  <input style={styles.input} value={form.phone} placeholder="+1 416 555 0123"
                         onChange={(e) => onChange("phone", e.target.value)} /></div>
                <div className="full"><label style={styles.label}>Address line 1</label>
                  <input style={styles.input} value={form.address1}
                         onChange={(e) => onChange("address1", e.target.value)} /></div>
                <div className="full"><label style={styles.label}>Address line 2 (optional)</label>
                  <input style={styles.input} value={form.address2}
                         onChange={(e) => onChange("address2", e.target.value)} /></div>
                <div><label style={styles.label}>City</label>
                  <input style={styles.input} value={form.city}
                         onChange={(e) => onChange("city", e.target.value)} /></div>
                <div><label style={styles.label}>Province/Territory</label>
                  <select style={styles.input} value={form.province}
                          onChange={(e) => onChange("province", e.target.value)}>
                    {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select></div>
                <div><label style={styles.label}>Postal Code</label>
                  <input style={styles.input} value={form.postalCode} placeholder="A1A 1A1"
                         onChange={(e) => onChange(
                           "postalCode",
                           e.target.value.toUpperCase().replace(/\s+/g, "").replace(/(.{3})/, "$1 ").trim()
                         )} /></div>
              </div>

              {error && <div style={{ color: "#dc2626", marginTop: 6 }}>{error}</div>}

              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button type="submit" disabled={saving} style={styles.primaryBtn}>
                  {saving ? "Saving…" : "Save changes"}
                </button>
                <button type="button" onClick={logout} style={styles.dangerBtn}>Logout</button>
              </div>

              <p style={{ ...styles.muted, marginTop: 10 }}>
                Your information is stored securely. Postal code format: <code>A1A 1A1</code>.
              </p>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

/* styles (unchanged, shortened a bit) */
const styles = {
  wrap: { minHeight: "100dvh", display: "grid", placeItems: "center", padding: 24 },
  card: { width: "min(840px, 94vw)", background: "#fff", borderRadius: 18, padding: 22,
          boxShadow: "0 10px 20px rgba(0,0,0,0.06), 0 2px 6px rgba(0,0,0,0.05)",
          border: "1px solid #eef2f7", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" },
  title: { fontSize: 22, fontWeight: 800, color: "#0f172a" },
  label: { display: "block", fontSize: 13, color: "#6b7280", marginBottom: 6 },
  input: { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #e5e7eb",
           boxSizing: "border-box", fontSize: 15, background: "#fff" },
  grid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 14 },
  avatarBox: { width: 64, height: 64, borderRadius: "50%", overflow: "hidden", border: "1px solid #e5e7eb" },
  avatarImg: { width: "100%", height: "100%", objectFit: "cover" },
  avatarFallback: { width: "100%", height: "100%", display: "grid", placeItems: "center",
                    background: "linear-gradient(135deg,#e9d5ff,#dbeafe)", color: "#0f172a", fontWeight: 800 },
  primaryBtn: { padding: "10px 14px", borderRadius: 12, background: "#111827", color: "#fff",
                fontWeight: 700, border: "1px solid #111827", cursor: "pointer", textDecoration: "none" },
  dangerBtn: { padding: "10px 14px", borderRadius: 12, background: "#fee2e2", color: "#991b1b",
               fontWeight: 800, border: "1px solid #fecaca", cursor: "pointer" },
  muted: { color: "#6b7280" },
  toast: { position: "fixed", top: 16, left: "50%", transform: "translateX(-50%)",
           background: "#111827", color: "#fff", padding: "10px 14px",
           borderRadius: 12, boxShadow: "0 6px 18px rgba(0,0,0,0.15)", zIndex: 50 },
};
