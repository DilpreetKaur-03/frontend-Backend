// src/pages/CustomerInfo.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

/**
 * CustomerInfo page (merged + enhanced)
 * - Inline styles only (no external CSS)
 * - Saves form to localStorage under "checkout_customer"
 * - Country dropdown (Canada / USA / Other)
 * - Province/state: dynamic select for Canada/USA, free input for Other
 * - Postal code validation:
 *     - Canada: A1A 1A1
 *     - USA: 5-digit ZIP
 *     - Other: required but no strict format
 * - Language toggle (English / Français) — UI only
 * - On successful validation navigates to /checkout/shipping
 * - "Return to cart" goes to /cart
 * - Shows hero/product image on the right (falls back if missing)
 *
 * Important: I kept all your original fields, labels and behavior intact
 * and only merged/enhanced as requested.
 */

export default function CustomerInfo() {
  const navigate = useNavigate();

  const initial = {
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    address2: "",
    city: "",
    province: "",
    postal: "",
    country: "Canada",
  };

  // Canadian provinces (full list)
  const provinces = [
    { code: "BC", name: "British Columbia" },
    { code: "ON", name: "Ontario" },
    { code: "QC", name: "Quebec" },
    { code: "AB", name: "Alberta" },
    { code: "MB", name: "Manitoba" },
    { code: "NB", name: "New Brunswick" },
    { code: "NL", name: "Newfoundland and Labrador" },
    { code: "NS", name: "Nova Scotia" },
    { code: "PE", name: "Prince Edward Island" },
    { code: "SK", name: "Saskatchewan" },
    { code: "NT", name: "Northwest Territories" },
    { code: "NU", name: "Nunavut" },
    { code: "YT", name: "Yukon" },
  ];

  // Short US states list (common ones) — expandable if needed
  const usStates = [
    { code: "CA", name: "California" },
    { code: "NY", name: "New York" },
    { code: "TX", name: "Texas" },
    { code: "FL", name: "Florida" },
    { code: "ON", name: "Ontario (example placeholder)" }, // placeholder if you want mixing
    // add more as needed
  ];

  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [lang, setLang] = useState("en"); // language toggle UI only

  // load saved if exists
  useEffect(() => {
    try {
      const raw = localStorage.getItem("checkout_customer");
      if (raw) {
        const parsed = JSON.parse(raw);
        setForm((f) => ({ ...f, ...parsed }));
      }
    } catch (e) {
      // ignore parsing errors
    }
  }, []);

  function updateField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    // clear error for that field
    setErrors((er) => {
      const copy = { ...er };
      delete copy[key];
      return copy;
    });
  }

  // Regexes for postal/zip
  const caPostalRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/; // A1A 1A1
  const usZipRegex = /^\d{5}$/; // 5-digit ZIP

  function validate() {
    const e = {};
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Valid email required";
    if (!form.firstName) e.firstName = "First name required";
    if (!form.lastName) e.lastName = "Last name required";
    if (!form.address) e.address = "Address required";
    if (!form.city) e.city = "City required";
    if (!form.country) e.country = "Country required";

    // postal validation based on country
    if (!form.postal) {
      e.postal = "Postal / ZIP required";
    } else if (form.country && form.country.toLowerCase().includes("canada")) {
      if (!caPostalRegex.test(form.postal.trim())) {
        e.postal = "Enter Canadian postal code in format A1A 1A1";
      }
    } else if (form.country && form.country.toLowerCase().includes("united") || form.country && form.country.toLowerCase().includes("usa")) {
      // crude check for US
      if (!usZipRegex.test(String(form.postal).trim())) {
        e.postal = "Enter 5-digit ZIP (e.g. 90210)";
      }
    }

    // If country is Canada ensure province chosen
    if (form.country && form.country.toLowerCase().includes("canada") && !form.province) {
      e.province = "Province required for Canada";
    }

    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const eobj = validate();
    setErrors(eobj);
    if (Object.keys(eobj).length > 0) {
      // focus first invalid (optional)
      const first = Object.keys(eobj)[0];
      const el = document.querySelector(`[name="${first}"]`);
      if (el) el.focus();
      return;
    }

    // save to localStorage
    try {
      localStorage.setItem("checkout_customer", JSON.stringify(form));
      setSaved(true);
    } catch (err) {
      console.error("save error", err);
    }

    // navigate to shipping step
    navigate("/checkout/shipping");
  }

  // inline styles (kept same style pattern as original)
  const pageStyle = { fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,Arial", padding: 28, background: "#f8fafb", minHeight: "78vh" };
  const containerStyle = { maxWidth: 1100, margin: "0 auto", display: "flex", gap: 24, alignItems: "flex-start" };

  const cardStyle = {
    background: "#fff",
    borderRadius: 12,
    padding: 28,
    boxShadow: "0 8px 30px rgba(16,24,40,0.05)",
    border: "1px solid #f1f5f9",
    flex: 1,
    position: "relative",
  };

  const langToggleWrap = { position: "absolute", top: 18, right: 18, display: "flex", gap: 8, alignItems: "center" };
  const langBtn = (active) => ({
    padding: "6px 10px",
    borderRadius: 8,
    border: active ? "1px solid #0a6bd6" : "1px solid #e6e6e6",
    background: active ? "#0a6bd6" : "#fff",
    color: active ? "#fff" : "#0b1220",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 13,
  });

  const rightImageWrap = {
    width: 360,
    borderRadius: 12,
    overflow: "hidden",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#eaf3fb",
    padding: 18,
  };

  const heroImgStyle = { width: "100%", height: "auto", objectFit: "cover", borderRadius: 12 };

  const labelStyle = { display: "block", marginBottom: 6, color: "#0f172a", fontWeight: 600 };
  const inputBase = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 8,
    border: "1px solid #e6e6e6",
    fontSize: 16,
    boxSizing: "border-box",
  };
  const errorStyle = { color: "#ef4444", marginTop: 6, fontSize: 13 };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={cardStyle}>
          {/* Language toggle (UI only) */}
          <div style={langToggleWrap}>
            <button type="button" onClick={() => setLang("en")} style={langBtn(lang === "en")}>
              EN
            </button>
            <button type="button" onClick={() => setLang("fr")} style={langBtn(lang === "fr")}>
              FR
            </button>
          </div>

          <h1 style={{ fontSize: 34, margin: "4px 0 18px", color: "#0b1220", fontWeight: 700 }}>Customer information</h1>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle} htmlFor="email">Email address</label>
              <input
                name="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="you@example.com"
                style={{ ...inputBase }}
                type="email"
              />
              {errors.email && <div style={errorStyle}>{errors.email}</div>}
            </div>

            {/* Shipping address heading */}
            <div style={{ marginTop: 8, marginBottom: 10 }}>
              <h3 style={{ margin: "6px 0 12px", fontSize: 20, color: "#0b1220" }}>Shipping address</h3>
            </div>

            {/* name row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>First name</label>
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  placeholder="First name"
                  style={inputBase}
                />
                {errors.firstName && <div style={errorStyle}>{errors.firstName}</div>}
              </div>

              <div>
                <label style={labelStyle}>Last name</label>
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  placeholder="Last name"
                  style={inputBase}
                />
                {errors.lastName && <div style={errorStyle}>{errors.lastName}</div>}
              </div>
            </div>

            {/* address lines */}
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Address</label>
              <input
                name="address"
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="Street address, P.O. box, company name, c/o"
                style={inputBase}
              />
              {errors.address && <div style={errorStyle}>{errors.address}</div>}
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Apartment, suite, etc. (optional)</label>
              <input
                name="address2"
                value={form.address2}
                onChange={(e) => updateField("address2", e.target.value)}
                placeholder="Apartment, suite, unit, building, floor, etc."
                style={inputBase}
              />
            </div>

            {/* city / province */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>City</label>
                <input
                  name="city"
                  value={form.city}
                  onChange={(e) => updateField("city", e.target.value)}
                  placeholder="City"
                  style={inputBase}
                />
                {errors.city && <div style={errorStyle}>{errors.city}</div>}
              </div>

              <div>
                <label style={labelStyle}>Province / State</label>

                {/* dynamic province/state input */}
                {form.country && form.country.toLowerCase().includes("canada") ? (
                  <select
                    name="province"
                    value={form.province}
                    onChange={(e) => updateField("province", e.target.value)}
                    style={{ ...inputBase, height: 44 }}
                  >
                    <option value="">Select province</option>
                    {provinces.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                ) : form.country && (form.country.toLowerCase().includes("usa") || form.country.toLowerCase().includes("united")) ? (
                  <select
                    name="province"
                    value={form.province}
                    onChange={(e) => updateField("province", e.target.value)}
                    style={{ ...inputBase, height: 44 }}
                  >
                    <option value="">Select state</option>
                    {usStates.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    name="province"
                    value={form.province}
                    onChange={(e) => updateField("province", e.target.value)}
                    placeholder="Province or state"
                    style={inputBase}
                  />
                )}

                {errors.province && <div style={errorStyle}>{errors.province}</div>}
              </div>
            </div>

            {/* country / postal */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
              <div>
                <label style={labelStyle}>Country / Region</label>

                {/* country dropdown with Other option */}
                <select
                  name="country"
                  value={form.country || ""}
                  onChange={(e) => updateField("country", e.target.value)}
                  style={{ ...inputBase, height: 44 }}
                >
                  <option value="">Select country</option>
                  <option value="Canada">Canada</option>
                  <option value="United States">United States</option>
                  <option value="Other">Other</option>
                </select>

                {errors.country && <div style={errorStyle}>{errors.country}</div>}
              </div>

              <div>
                <label style={labelStyle}>Postal / ZIP</label>
                <input
                  name="postal"
                  value={form.postal}
                  onChange={(e) => updateField("postal", e.target.value)}
                  placeholder={form.country && form.country.toLowerCase().includes("canada") ? "A1A 1A1" : form.country && form.country.toLowerCase().includes("united") || form.country && form.country.toLowerCase().includes("usa") ? "90210" : "Postal or ZIP code"}
                  style={inputBase}
                />
                {errors.postal && <div style={errorStyle}>{errors.postal}</div>}
              </div>
            </div>

            {/* buttons */}
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 6 }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: "14px 18px",
                  borderRadius: 10,
                  border: "none",
                  background: "#0a6bd6",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: "pointer",
                }}
              >
                Continue to shipping
              </button>

              <Link to="/cart" style={{ textDecoration: "none" }}>
                <button
                  type="button"
                  style={{
                    padding: "12px 16px",
                    borderRadius: 10,
                    border: "1px solid #e6e6e6",
                    background: "#fff",
                    color: "#0b1220",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Return to cart
                </button>
              </Link>
            </div>

            {saved && (
              <div style={{ marginTop: 12, color: "#064e3b", fontWeight: 700 }}>
                Info saved — continuing to shipping...
              </div>
            )}
          </form>
        </div>

        {/* Right side image (mock/hero) */}
        <div style={rightImageWrap}>
          <img
            src="/hero-device.png"
            alt="Shipping hero"
            style={heroImgStyle}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/laptop.png";
            }}
          />
        </div>
      </div>
    </div>
  );
}