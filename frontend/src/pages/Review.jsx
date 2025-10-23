// src/pages/CheckoutReview.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

/**
 * Checkout Review & Place Order
 * - Inline styles only
 * - Reads: checkout_customer, checkout_shipping, checkout_payment, cart
 * - Calculates tax (example Canadian logic HST/GST depending on province)
 * - Sends order to backend via fetch POST /api/orders/
 *
 * NOTE: This merges the frontend UI you had with a placeOrder() that POSTS to backend.
 */

export default function CheckoutReview() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [shipping, setShipping] = useState(null);
  const [payment, setPayment] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    try {
      const rawCustomer = localStorage.getItem("checkout_customer");
      setCustomer(rawCustomer ? JSON.parse(rawCustomer) : null);
    } catch (err) {
      setCustomer(null);
    }

    try {
      const rawShipping = localStorage.getItem("checkout_shipping");
      setShipping(rawShipping ? JSON.parse(rawShipping) : null);
    } catch (err) {
      setShipping(null);
    }

    try {
      const rawPayment = localStorage.getItem("checkout_payment");
      setPayment(rawPayment ? JSON.parse(rawPayment) : null);
    } catch (err) {
      setPayment(null);
    }

    try {
      const rawCart = localStorage.getItem("cart") || "[]";
      const arr = JSON.parse(rawCart);
      // normalize cart like other pages and ensure image fallback to /laptop.png
      const normalized = (arr || []).map((it) => ({
        id: it.id ?? it.product ?? Math.random(),
        title: it.title ?? it.name ?? "Product",
        price: Number(it.price ?? it.amount ?? it.unit_price ?? 0) || 0,
        qty: Math.max(1, Math.floor(Number(it.qty ?? it.quantity ?? 1) || 1)),
        image: it.image ?? it.thumbnail ?? "/laptop.png",
      }));
      setItems(normalized);
    } catch (err) {
      setItems([]);
    }

    setLoading(false);
  }, []);

  // money format helper (CAD-like)
  function fm(n) {
    return `$${Number(n || 0).toFixed(2)}`;
  }

  // subtotal
  const subtotal = items.reduce((s, it) => s + it.price * (it.qty || 1), 0);

  // shipping price helper (if shipping object includes price)
  function shippingPrice() {
    const p = shipping && (Number(shipping.price) || 0);
    return p || 0;
  }

  // tax calculation example — canadian HST/GST/PST mapping (simple)
  const provinceTaxRates = {
    ON: 0.13,
    NB: 0.15,
    NL: 0.15,
    NS: 0.15,
    PE: 0.15,
    BC: 0.12,
    MB: 0.12,
    SK: 0.11,
    AB: 0.05,
    NT: 0.05,
    NU: 0.05,
    YT: 0.05,
    QC: 0.14975,
  };

  function getTaxRate() {
    const prov =
      (payment && payment.billing && payment.billing.province) ||
      (customer && customer.province) ||
      (shipping && shipping.province) ||
      "";
    const code = String(prov || "").toUpperCase();
    return provinceTaxRates[code] ?? 0.05;
  }

  const taxRate = getTaxRate();
  const taxAmount = +(subtotal * taxRate) || 0;
  const total = subtotal + shippingPrice() + taxAmount;

  function maskedPaymentDisplay() {
    if (!payment || !payment.method) return "—";
    if (payment.method === "cod" || payment.method === "cash" || payment.method === "cash_on_delivery") {
      return "Cash on Delivery (pay at delivery)";
    }
    if (payment.cardMask) return payment.cardMask;
    if (payment.method === "card") return "Credit / Debit card";
    return payment.method;
  }

  // small helper to ensure image src is always a string and fallback works
  function safeImageSrc(it) {
    try {
      if (!it || !it.image) return "/laptop.png";
      return it.image;
    } catch (e) {
      return "/laptop.png";
    }
  }

  // ---------- REPLACED placeOrder: now POSTs flat payload to backend ----------
  async function placeOrder() {
    setPlacing(true);

    // Build flattened payload expected by backend model fields
    // try to map from nested customer/shipping that UI uses
    const customerFullName =
      (customer?.firstName || customer?.first_name || "") +
      (customer?.lastName || customer?.last_name ? " " : "") +
      (customer?.lastName || customer?.last_name || "");

    const payload = {
      // minimal order metadata
      id: `ORD-${Date.now()}`,
      created_at: new Date().toISOString(),

      // customer flattened fields (backend model fields names)
      customer_name: customerFullName.trim() || (customer?.name || ""),
      customer_email: customer?.email || customer?.emailAddress || customer?.email_address || null,

      // shipping flattened fields: prefer shipping object (from shipping step), fallback to customer
      shipping_address: shipping?.address || customer?.address || customer?.street || "",
      shipping_city: shipping?.city || customer?.city || "",
      shipping_province: shipping?.province || customer?.province || "",
      shipping_postal: shipping?.postal || customer?.postal || customer?.postal_code || "",
      shipping_country: shipping?.country || customer?.country || "",

      // shipping cost & totals
      shipping_cost: Number(shippingPrice() || 0),

      // payment flattened
      payment_method: payment ? payment.method : "unknown",
      payment_summary: maskedPaymentDisplay(),

      // items (JSONField in backend) and totals
      items: items,
      subtotal: Number(subtotal.toFixed(2)),
      tax: Number(taxAmount.toFixed(2)),
      total: Number(total.toFixed(2)),

      status:
        payment && (payment.method === "cod" || payment.method === "cash_on_delivery" || payment.method === "cash")
          ? "pending_cod"
          : "paid_mock",
    };

    // debug: log payload in browser console so you can compare with server logs
    console.debug("placeOrder: payload ->", payload);

    try {
      // <-- Update this URL if your Django backend runs somewhere else -->
      const API_URL = "http://127.0.0.1:8000/api/orders/";

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // try to show server error message (JSON or text)
        let err = null;
        try {
          err = await res.json();
        } catch (e) {
          err = await res.text();
        }
        console.error("order API error:", err);
        // helpful: show validation errors to user too
        alert("Order submission failed — check console (network response).");
        setPlacing(false);
        return;
      }

      const saved = await res.json();
      // Save server-returned order for confirmation page and navigate
      localStorage.setItem("checkout_order", JSON.stringify(saved));
      navigate("/checkout/confirmation", { state: { orderId: saved.id } });
    } catch (e) {
      console.error("network error while placing order:", e);
      alert("Network error while placing order. See console.");
      setPlacing(false);
    }
  }
  // ---------- END replaced placeOrder ----------

  // Styles - aim to match flow & visuals from your images
  const page = { fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, Arial", padding: 28, background: "#f6f7f8", minHeight: "78vh" };
  const containerBase = { maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 420px", gap: 24, alignItems: "start" };

  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    function check() { setNarrow(window.innerWidth < 940); }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  const container = narrow ? { ...containerBase, gridTemplateColumns: "1fr", paddingBottom: 60 } : containerBase;

  const card = { background: "#fff", borderRadius: 12, padding: 28, boxShadow: "0 8px 30px rgba(16,24,40,0.05)", border: "1px solid #eef2f6" };
  const title = { fontSize: 34, margin: "4px 0 18px", color: "#0b1220", fontWeight: 700 };
  const sectionTitle = { fontSize: 18, fontWeight: 700, margin: "10px 0 8px", color: "#0b1220" };
  const smallGray = { color: "#6b7280", fontSize: 14 };

  const summaryBox = { background: "#fff", borderRadius: 12, padding: 20, border: "1px solid #eef2f6", boxShadow: "0 8px 30px rgba(16,24,40,0.03)", position: "sticky", top: 28 };

  if (loading) return <div style={page}><div style={{ maxWidth: 1100, margin: "80px auto", textAlign: "center" }}>Loading…</div></div>;

  return (
    <div style={page}>
      <div style={container}>
        {/* LEFT: Review details (flow left column) */}
        <div style={card}>
          <h1 style={title}>Review Order</h1>

          {/* Shipping address */}
          <div style={{ marginBottom: 18 }}>
            <div style={sectionTitle}>Shipping Address</div>
            <div style={{ color: "#0b1220", fontWeight: 700, marginBottom: 8 }}>
              {customer ? `${customer.firstName || ""} ${customer.lastName || ""}` : "Guest"}
            </div>
            <div style={smallGray}>
              {customer?.address || shipping?.address || "No street"}
              <br />
              {(customer?.city || shipping?.city) ? `${customer?.city || shipping?.city}` : ""}
              {(customer?.province || shipping?.province) ? ` ${customer?.province || shipping?.province}` : ""}
              {(customer?.postal || shipping?.postal) ? ` ${customer?.postal || shipping?.postal}` : ""}
              <br />
              {customer?.country || shipping?.country || ""}
            </div>
          </div>

          {/* Shipping method */}
          <div style={{ marginBottom: 18 }}>
            <div style={sectionTitle}>Shipping Method</div>
            <div style={smallGray}>
              {shipping ? `${shipping.name || shipping.method || "Method"} • ${shipping.price ? fm(Number(shipping.price)) : "Free"}` : "Standard • Free"}
            </div>
          </div>

          {/* Payment method */}
          <div style={{ marginBottom: 22 }}>
            <div style={sectionTitle}>Payment Method</div>
            <div style={smallGray}>{maskedPaymentDisplay()}</div>
            {payment && payment.cardName && payment.cardMask && (
              <div style={{ marginTop: 8, color: "#6b7280", fontSize: 13 }}>{payment.cardName}</div>
            )}
          </div>

          {/* Place order CTA */}
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => placeOrder()}
              disabled={placing}
              style={{
                flex: 1,
                padding: "14px 18px",
                borderRadius: 10,
                border: "none",
                background: placing ? "#93c5fd" : "#0a6bd6",
                color: "#fff",
                fontWeight: 800,
                fontSize: 16,
                cursor: placing ? "default" : "pointer",
              }}
            >
              {placing ? "Placing order…" : "Place Order"}
            </button>

            <Link to="/checkout/payment" style={{ textDecoration: "none", alignSelf: "center" }}>
              <button style={{ padding: "12px 16px", borderRadius: 10, border: "1px solid #e6eef6", background: "#fff", color: "#0b1220", fontWeight: 700 }}>
                Back to payment
              </button>
            </Link>
          </div>
        </div>

        {/* RIGHT: Summary card styled like example image */}
        <aside style={summaryBox}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Order Summary</div>

          {/* product list — show image inside a highlighted box */}
          <div style={{ maxHeight: 260, overflow: "auto", marginBottom: 14 }}>
            {items.length === 0 ? (
              <div style={{ color: "#9ca3af" }}>Your cart is empty.</div>
            ) : (
              items.map((it, idx) => (
                <div key={idx} style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                  <div style={{ flex: 1, display: "flex", gap: 12, alignItems: "center", background: "#fbfdff", borderRadius: 8, padding: 12, border: "1px solid #eef3f6" }}>
                    <img
                      src={safeImageSrc(it)}
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/laptop.png"; }}
                      alt={it.title}
                      style={{ width: 84, height: 64, objectFit: "cover", borderRadius: 8, background: "#fff", border: "1px solid #f1f5f9" }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>{it.title}</div>
                      <div style={{ color: "#6b7280", fontSize: 13, marginTop: 6 }}>{it.qty} x {fm(it.price)}</div>
                    </div>
                    <div style={{ fontWeight: 700 }}>{fm(it.price * (it.qty || 1))}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* totals */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ color: "#6b7280" }}>Subtotal</div>
            <div style={{ fontWeight: 700 }}>{fm(subtotal)}</div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ color: "#6b7280" }}>Shipping</div>
            <div style={{ fontWeight: 700 }}>{shippingPrice() ? fm(shippingPrice()) : "Free"}</div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ color: "#6b7280" }}>{taxRate ? `Tax (${(taxRate * 100).toFixed(2)}%)` : "Tax"}</div>
            <div style={{ fontWeight: 700 }}>{fm(taxAmount)}</div>
          </div>

          <div style={{ borderTop: "1px dashed #f3f4f6", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ color: "#6b7280", fontWeight: 700 }}>Total</div>
            <div style={{ fontWeight: 900, fontSize: 20 }}>{fm(total)}</div>
          </div>

          <div style={{ color: "#9ca3af", fontSize: 13, marginBottom: 12 }}>Taxes and duties calculated here as an example.</div>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => placeOrder()} style={{ flex: 1, padding: "12px 14px", borderRadius: 8, border: "none", background: "#475569", color: "#fff", fontWeight: 700 }}>
              Place Order
            </button>

            <Link to="/cart" style={{ textDecoration: "none" }}>
              <button style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #e6eef6", background: "#fff", color: "#0b1220", fontWeight: 700 }}>
                Edit cart
              </button>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}