// src/pages/CheckoutShipping.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

/**
 * Checkout - Shipping page
 * - Inline styles only
 * - Reads customer info from localStorage 'checkout_customer'
 * - Reads cart from localStorage 'cart' to compute subtotal
 * - Shipping options: Standard ($5), Express ($15)
 * - Saves chosen shipping to localStorage 'checkout_shipping'
 * - Navigates to /checkout/payment on continue
 */

export default function CheckoutShipping() {
  const navigate = useNavigate();

  // shipping options
  const SHIPPING_OPTIONS = [
    { id: "standard", label: "Standard Shipping", price: 5.0, desc: "3–7 business days" },
    { id: "express", label: "Express Shipping", price: 15.0, desc: "1–3 business days" },
  ];

  const [customer, setCustomer] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [selected, setSelected] = useState("standard");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // load customer info (saved by CustomerInfo page)
    try {
      const raw = localStorage.getItem("checkout_customer");
      if (raw) {
        setCustomer(JSON.parse(raw));
      } else {
        setCustomer(null);
      }
    } catch (e) {
      console.error("customer read error", e);
      setCustomer(null);
    }

    // load cart, normalize
    try {
      const rawCart = localStorage.getItem("cart") || "[]";
      const parsed = JSON.parse(rawCart);
      const normalized = (parsed || []).map((it) => ({
        id: it.id ?? it.product ?? Math.random(),
        title: it.title ?? it.name ?? "Product",
        price: Number(it.price ?? it.amount ?? it.unit_price ?? 0) || 0,
        qty: Math.max(1, Math.floor(Number(it.qty ?? it.quantity ?? 1) || 1)),
      }));
      setCartItems(normalized);
      setSubtotal(normalized.reduce((s, it) => s + it.price * (it.qty || 1), 0));
    } catch (e) {
      console.error("cart read error", e);
      setCartItems([]);
      setSubtotal(0);
    }

    // load previously selected shipping if present
    try {
      const rawShip = localStorage.getItem("checkout_shipping");
      if (rawShip) {
        const parsed = JSON.parse(rawShip);
        if (parsed && parsed.id) setSelected(parsed.id);
      }
    } catch (e) {
      // ignore
    }

    setLoading(false);
  }, []);

  function handleContinue() {
    // persist shipping choice
    const opt = SHIPPING_OPTIONS.find((o) => o.id === selected) || SHIPPING_OPTIONS[0];
    localStorage.setItem(
      "checkout_shipping",
      JSON.stringify({ id: opt.id, label: opt.label, price: opt.price })
    );

    // navigate to payment
    navigate("/checkout/payment");
  }

  function shippingTotal() {
    const opt = SHIPPING_OPTIONS.find((o) => o.id === selected) || SHIPPING_OPTIONS[0];
    return Number(opt.price || 0);
  }

  function formatMoney(n) {
    // show in CAD as you wanted earlier
    return `$${n.toFixed(2)}`;
  }

  // inline styles (kept self-contained)
  const page = { fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, Arial", padding: 28, background: "#f8fafb", minHeight: "78vh" };
  const container = {
    maxWidth: 1100,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1fr 360px",
    gap: 24,
    alignItems: "start",
  };

  // responsive stack for smaller screens
  const mobileMediaQuery = "@media (max-width: 880px)";

  // we'll apply a small responsive hack by duplicating container style for narrow screens inline:
  const containerResponsive = {
    ...container,
    // won't actually be a CSS media query inline: we do a javascript responsive fallback
  };

  // card style
  const card = {
    background: "#fff",
    borderRadius: 12,
    padding: 26,
    boxShadow: "0 8px 30px rgba(16,24,40,0.05)",
    border: "1px solid #f1f5f9",
  };

  const customerRow = { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 14 };
  const sectionTitle = { fontSize: 20, fontWeight: 700, margin: "10px 0 14px", color: "#0b1220" };
  const metaText = { color: "#374151" };

  const shippingOption = {
    border: "1px solid #e6eef6",
    borderRadius: 10,
    padding: 12,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    cursor: "pointer",
    transition: "box-shadow .12s ease, transform .08s ease",
    background: "#fff",
  };

  const shippingOptionSelected = {
    boxShadow: "0 8px 20px rgba(10,61,98,0.08)",
    transform: "translateY(-4px)",
    borderColor: "#dbeafe",
  };

  const radioWrap = { display: "flex", alignItems: "center", gap: 12 };
  const radioLabel = { fontSize: 16, fontWeight: 700, color: "#0b1220" };
  const radioDesc = { fontSize: 13, color: "#6b7280" };

  const btnPrimary = {
    padding: "14px 18px",
    borderRadius: 10,
    border: "none",
    background: "#f59e0b", // warm yellow to stand out
    color: "#000",
    fontWeight: 800,
    fontSize: 16,
    cursor: "pointer",
    width: "100%",
    marginTop: 18,
  };

  const smallLink = { color: "#0b1220", textDecoration: "underline", cursor: "pointer", marginTop: 10 };

  const summaryBox = {
    background: "#fff",
    borderRadius: 12,
    padding: 18,
    border: "1px solid #f1f5f9",
    boxShadow: "0 8px 30px rgba(16,24,40,0.03)",
    position: "sticky",
    top: 28,
  };

  const priceRow = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 };
  const totalRow = { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, borderTop: "1px dashed #f3f4f6", paddingTop: 12 };

  // small responsive handling: if screen is narrow, stack columns
  const [isNarrow, setIsNarrow] = useState(false);
  useEffect(() => {
    function check() {
      setIsNarrow(window.innerWidth < 900);
    }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // choose container depending on width
  const finalContainerStyle = isNarrow
    ? { ...container, gridTemplateColumns: "1fr", paddingBottom: 60 }
    : container;

  if (loading) {
    return <div style={page}><div style={{ maxWidth: 1100, margin: "80px auto", textAlign: "center" }}>Loading…</div></div>;
  }

  return (
    <div style={page}>
      <div style={finalContainerStyle}>
        {/* left column */}
        <div style={card}>
          {/* Customer header */}
          <div style={customerRow}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#0b1220" }}>
                {customer ? `${customer.firstName || ""} ${customer.lastName || ""}` : "Guest"}
              </div>
              <div style={{ ...metaText }}>{customer?.email || ""}</div>
            </div>

            <div style={{ textAlign: "right" }}>
              <Link to="/checkout/info" style={{ color: "#0a6bd6", fontWeight: 700, textDecoration: "none" }}>
                Edit information
              </Link>
            </div>
          </div>

          {/* Shipping address */}
          <div>
            <div style={sectionTitle}>Shipping address</div>
            <div style={{ color: "#374151", lineHeight: 1.6 }}>
              {customer ? (
                <>
                  <div>{customer.address || ""}</div>
                  <div>
                    {customer.city || ""} {customer.province ? customer.province : ""} {customer.postal || ""}
                  </div>
                  <div>{customer.country || ""}</div>
                </>
              ) : (
                <div style={{ color: "#9ca3af" }}>No shipping address found. Go back and enter your shipping details.</div>
              )}
            </div>
          </div>

          {/* Shipping method */}
          <div style={{ marginTop: 22 }}>
            <div style={sectionTitle}>Shipping method</div>

            <div style={{ display: "grid", gap: 12 }}>
              {SHIPPING_OPTIONS.map((opt) => {
                const sel = selected === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setSelected(opt.id)}
                    style={{ ...shippingOption, ...(sel ? shippingOptionSelected : {}) }}
                  >
                    <div style={radioWrap}>
                      <input
                        type="radio"
                        id={`ship-${opt.id}`}
                        name="shipping_method"
                        checked={sel}
                        onChange={() => setSelected(opt.id)}
                        style={{ width: 18, height: 18, cursor: "pointer" }}
                      />
                      <div>
                        <label htmlFor={`ship-${opt.id}`} style={radioLabel}>{opt.label}</label>
                        <div style={radioDesc}>{opt.desc}</div>
                      </div>
                    </div>

                    <div style={{ textAlign: "right", minWidth: 84 }}>
                      <div style={{ fontWeight: 800 }}>{formatMoney(opt.price)}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleContinue}
              style={btnPrimary}
              aria-label="Continue to payment"
            >
              Continue to payment
            </button>

            <div>
              <Link to="/checkout/info" style={smallLink}>Return to information</Link>
            </div>
          </div>
        </div>

        {/* right column summary */}
        <div style={isNarrow ? { gridColumn: "1 / -1" } : {}}>
          <aside style={summaryBox}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Order summary</div>

            <div style={{ maxHeight: 240, overflow: "auto", marginBottom: 12 }}>
              {cartItems.length === 0 ? (
                <div style={{ color: "#9ca3af" }}>Your cart is empty.</div>
              ) : (
                cartItems.map((it, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700, color: "#0b1220" }}>{it.title}</div>
                      <div style={{ color: "#6b7280", fontSize: 13 }}>Qty {it.qty}</div>
                    </div>
                    <div style={{ fontWeight: 700 }}>{formatMoney(it.price * (it.qty || 1))}</div>
                  </div>
                ))
              )}
            </div>

            <div style={priceRow}>
              <div style={{ color: "#6b7280" }}>Subtotal</div>
              <div style={{ fontWeight: 700 }}>{formatMoney(subtotal)}</div>
            </div>

            <div style={priceRow}>
              <div style={{ color: "#6b7280" }}>Shipping</div>
              <div style={{ fontWeight: 700 }}>{formatMoney(shippingTotal())}</div>
            </div>

            <div style={totalRow}>
              <div style={{ color: "#6b7280" }}>Total</div>
              <div style={{ fontWeight: 900, fontSize: 18 }}>{formatMoney(subtotal + shippingTotal())}</div>
            </div>

            <div style={{ color: "#9ca3af", fontSize: 13, marginTop: 12 }}>Taxes and duties calculated at checkout.</div>
          </aside>
        </div>
      </div>
    </div>
  );
}