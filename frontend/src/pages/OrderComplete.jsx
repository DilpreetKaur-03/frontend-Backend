// src/pages/OrderComplete.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

/**
 * Order Complete page
 * - Inline styles only (no external CSS)
 * - Reads localStorage.checkout_order for order details
 * - Shows celebration popup (🎉) + animated confetti (CSS) — no external libs
 * - Responsive and matches the visual language of checkout pages
 */

export default function OrderComplete() {
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [showPopup, setShowPopup] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("checkout_order");
      if (raw) setOrder(JSON.parse(raw));
    } catch (err) {
      setOrder(null);
    }

    // Auto-hide popup after a short time (still immediate visual)
    const t = setTimeout(() => setShowPopup(false), 3000);
    return () => clearTimeout(t);
  }, []);

  // If route state had orderId passed (optional), prefer localStorage order but show that id if missing
  const routeState = location.state || {};
  const displayId = (order && order.id) || routeState.orderId || "—";

  // formatted total fallback
  function fm(n) {
    return `$${Number(n || 0).toFixed(2)}`;
  }

  // inline styles (kept consistent with your other pages)
  const page = { fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, Arial", padding: 28, background: "#f6f7f8", minHeight: "78vh" };
  const card = { maxWidth: 920, margin: "40px auto", background: "#fff", borderRadius: 12, padding: 28, boxShadow: "0 8px 30px rgba(16,24,40,0.05)", border: "1px solid #eef2f6" };
  const title = { fontSize: 34, margin: "4px 0 14px", color: "#0b1220", fontWeight: 700 };
  const lead = { fontSize: 18, color: "#374151", marginBottom: 12 };
  const codeBox = { background: "#f8fafc", borderRadius: 10, padding: 20, border: "1px solid #eef2f6", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, 'Roboto Mono', monospace", fontSize: 16, color: "#0b1220" };
  const buttonPrimary = { display: "inline-block", padding: "12px 20px", borderRadius: 10, background: "#0a6bd6", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer", textDecoration: "none" };
  const smallLink = { marginLeft: 12, color: "#0b1220", textDecoration: "underline", cursor: "pointer" };

  // popup / confetti styles via JS-in-CSS, appended to DOM
  const confettiParent = {
    pointerEvents: "none",
    position: "fixed",
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
    zIndex: 9999,
    overflow: "hidden",
  };

  // small helper: render a few emoji divs with random left offsets
  const Confetti = () => {
    const emojis = ["🎉", "✨", "🥳", "🎊", "🎈"];
    // create 18 pieces
    return (
      <div style={confettiParent} aria-hidden>
        {[...Array(18)].map((_, i) => {
          const left = Math.round(Math.random() * 100);
          const delay = (Math.random() * 1.2).toFixed(2);
          const size = 18 + Math.round(Math.random() * 20);
          const emoji = emojis[Math.floor(Math.random() * emojis.length)];
          const style = {
            position: "absolute",
            left: `${left}%`,
            top: "-10%",
            fontSize: size,
            transform: `rotate(${Math.round(Math.random() * 360)}deg)`,
            animation: `fall 2.2s ${delay}s linear both`,
            opacity: 0.95,
            filter: "drop-shadow(0 2px 6px rgba(16,24,40,0.12))",
          };
          return (
            <div key={i} style={style}>
              {emoji}
            </div>
          );
        })}
        {/* keyframes inserted via style tag for compatibility */}
        <style>{`
          @keyframes fall {
            0% { transform: translateY(-20vh) rotate(0deg); opacity: 0; }
            20% { opacity: 1; }
            100% { transform: translateY(110vh) rotate(360deg); opacity: 1; }
          }
        `}</style>
      </div>
    );
  };

  return (
    <div style={page}>
      <div style={card}>
        <h1 style={title}>Thank you — your order is confirmed</h1>

        <div style={lead}>We received your order. A confirmation email has been sent (mocked).</div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20 }}>
          {/* left column - message & details */}
          <div>
            <div style={codeBox}>
              <div style={{ marginBottom: 6, color: "#6b7280" }}>Thank you! Your order</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#0b1220", display: "inline-block" }}>
                #{displayId}
              </div>
              <div style={{ marginTop: 12, color: "#374151" }}>
                We’ve emailed an order confirmation to <strong>{(order && order.customer && order.customer.email) || (order && order.customer?.email) || "you"}</strong>. If you don’t see it, check your own folder.
              </div>

              {/* small summary if available */}
              {order && (
                <div style={{ marginTop: 14, display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: "#6b7280" }}>Order total</div>
                    <div style={{ fontWeight: 800, fontSize: 18 }}>{fm(order.total)}</div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13, color: "#6b7280" }}>Payment</div>
                    <div style={{ fontWeight: 700 }}>{order.payment?.summary || "—"}</div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
              <button
                style={buttonPrimary}
                onClick={() => {
                  // optional: go to orders / clear?
                  navigate("/");
                }}
              >
                Continue shopping
              </button>

              <Link to="/checkout/review" style={smallLink}>View orders</Link>
              <Link to="/checkout/review" style={{ ...smallLink, marginLeft: "auto" }}>Back to review</Link>
            </div>
          </div>

          {/* right column - order card visual similar to your image */}
          <aside style={{ background: "#fff", borderRadius: 10, border: "1px solid #eef2f6", padding: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 10 }}>Order summary</div>

            {order && order.items && order.items.length > 0 ? (
              <>
                {order.items.slice(0, 4).map((it, idx) => (
                  <div key={idx} style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10 }}>
                    <img src={it.image || "/laptop.png"} alt={it.title} style={{ width: 72, height: 54, objectFit: "cover", borderRadius: 8, border: "1px solid #f1f5f9", background: "#fff" }} onError={(e) => { e.target.onerror = null; e.target.src = "/laptop.png"; }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>{it.title}</div>
                      <div style={{ color: "#6b7280", fontSize: 13 }}>{it.qty} × {fm(it.price)}</div>
                    </div>
                    <div style={{ fontWeight: 800 }}>{fm(it.price * (it.qty || 1))}</div>
                  </div>
                ))}

                <div style={{ borderTop: "1px dashed #f3f4f6", paddingTop: 12, marginTop: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ color: "#6b7280" }}>Subtotal</div>
                    <div style={{ fontWeight: 700 }}>{fm(order.subtotal)}</div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ color: "#6b7280" }}>Shipping</div>
                    <div style={{ fontWeight: 700 }}>{order.shippingCost ? fm(order.shippingCost) : "Free"}</div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ color: "#6b7280" }}>Tax</div>
                    <div style={{ fontWeight: 700 }}>{fm(order.tax)}</div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontWeight: 800 }}>Total</div>
                    <div style={{ fontSize: 18, fontWeight: 900 }}>{fm(order.total)}</div>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ color: "#9ca3af" }}>No items found for this order.</div>
            )}
          </aside>
        </div>
      </div>

      {/* celebration popup */}
      {showPopup && (
        <div style={{ position: "fixed", left: 0, right: 0, top: 20, display: "flex", justifyContent: "center", zIndex: 10000 }}>
          <div style={{ background: "linear-gradient(90deg,#fff,#f8fbff)", borderRadius: 12, padding: "10px 18px", boxShadow: "0 8px 30px rgba(16,24,40,0.12)", display: "flex", gap: 12, alignItems: "center", border: "1px solid rgba(10,107,214,0.12)" }}>
            <div style={{ fontSize: 28 }}>🎉</div>
            <div>
              <div style={{ fontWeight: 800 }}>Order placed!</div>
              <div style={{ color: "#6b7280", fontSize: 13 }}>Your order <span style={{ fontWeight: 800 }}>#{displayId}</span> is confirmed.</div>
            </div>
          </div>
        </div>
      )}

      {/* confetti layer (render when popup present for the brief celebration effect) */}
      {showPopup && <Confetti />}
    </div>
  );
}