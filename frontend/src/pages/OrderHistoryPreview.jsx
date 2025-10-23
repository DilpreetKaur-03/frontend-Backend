// ✅ src/components/OrderHistoryPreview.jsx
import React, { useEffect, useState } from "react";

export default function OrderHistoryPreview() {
  const [orders, setOrders] = useState([]);

  // ✅ Helper: Format currency
  const fmtMoney = (n) => `$${Number(n || 0).toFixed(2)}`;

  // ✅ Parse dates safely
  const toTime = (v) => {
    if (!v) return 0;
    if (typeof v === "number") return v;
    const t = Date.parse(v) || Date.parse(String(v)) || 0;
    return isNaN(t) ? 0 : t;
  };

  // ✅ Normalize orders so structure remains consistent
  const normalize = (o = {}) => {
    const id =
      o.id || o.order_id || o.code || `ORD-${o.created_at || o.date || Date.now()}`;
    const date = new Date(toTime(o.date || o.created_at || o.timestamp || Date.now())).toISOString();

    return {
      id,
      date,
      items: Array.isArray(o.items) ? o.items : o.products || o.lines || [],
      total: Number(o.total ?? o.grand_total ?? o.amount ?? o.subtotal ?? 0),
      subtotal: Number(o.subtotal ?? o.total ?? 0),
      ...o,
    };
  };

  // ✅ Merge logic: fetch from multiple possible keys & combine all
  const loadOrders = () => {
    const all = [];

    // 1️⃣ main array
    try {
      const arr = JSON.parse(localStorage.getItem("orders") || "[]");
      if (Array.isArray(arr)) all.push(...arr);
    } catch {}

    // 2️⃣ single latest order (sometimes saved separately)
    const singleKeys = [
      "last_order",
      "checkout_order",
      "order_confirmation",
      "recent_order",
    ];
    for (const key of singleKeys) {
      try {
        const obj = JSON.parse(localStorage.getItem(key) || "null");
        if (obj && typeof obj === "object") {
          all.push(obj.order || obj);
        }
      } catch {}
    }

    // ✅ normalize & remove duplicates
    const seen = new Set();
    const merged = [];
    for (const o of all) {
      const n = normalize(o);
      if (!seen.has(n.id)) {
        seen.add(n.id);
        merged.push(n);
      }
    }

    // ✅ Sort newest → oldest
    merged.sort((a, b) => toTime(b.date) - toTime(a.date));

    setOrders(merged);

    // ✅ Re-save back merged list to localStorage["orders"]
    localStorage.setItem("orders", JSON.stringify(merged));
  };

  // ✅ Run on mount + refresh when tab focuses
  useEffect(() => {
    loadOrders();

    const handleFocus = () => loadOrders();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const latest = orders[0] || null;

  // ---- Styles ----
  const page = {
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, Arial",
    background: "linear-gradient(180deg,#f6f8fb 0%, #ffffff 60%)",
    padding: 28,
    minHeight: "80vh",
  };
  const container = { maxWidth: 980, margin: "0 auto", display: "grid", gap: 20 };
  const card = {
    borderRadius: 12,
    background: "#fff",
    padding: 20,
    boxShadow: "0 20px 40px rgba(10,20,40,0.06)",
    border: "1px solid #e9eef6",
  };
  const orderBox = {
    borderRadius: 10,
    border: "1px solid #eef4fb",
    padding: 16,
    marginBottom: 14,
    background: "linear-gradient(180deg,#fff,#fbfdff)",
  };

  return (
    <div style={page}>
      <div style={container}>
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>Your Order History</div>
              <div style={{ color: "#6b7280" }}>
                Recent orders and receipts — secure & Canadian-friendly 🇨🇦
              </div>
            </div>
            <div style={{ color: "#c0392b", fontWeight: 800 }}>🇨🇦</div>
          </div>

          {/* ✅ Latest Order */}
          {latest ? (
            <div style={orderBox}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 13, color: "#6b7280" }}>Latest Order</div>
                  <div style={{ fontWeight: 800, fontSize: 18 }}>#{latest.id}</div>
                  <div style={{ color: "#6b7280", fontSize: 13 }}>
                    Placed on {new Date(latest.date).toLocaleString()}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#6b7280", fontSize: 13 }}>Total</div>
                  <div style={{ fontWeight: 900, fontSize: 18 }}>
                    {fmtMoney(latest.total ?? latest.subtotal)}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 14, borderTop: "1px dashed #eef6fb", paddingTop: 12 }}>
                {latest.items?.map((it, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10 }}>
                    <img
                      src={it.image || "/laptop.png"}
                      alt={it.title}
                      style={{
                        width: 72,
                        height: 54,
                        objectFit: "cover",
                        borderRadius: 8,
                        border: "1px solid #f1f5f9",
                      }}
                      onError={(e) => (e.currentTarget.src = "/laptop.png")}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>{it.title}</div>
                      <div style={{ color: "#6b7280", fontSize: 13 }}>
                        {it.qty} × {fmtMoney(it.price)}
                      </div>
                    </div>
                    <div style={{ fontWeight: 800 }}>
                      {fmtMoney((it.price || 0) * (it.qty || 1))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding: 18, color: "#6b7280" }}>You have no orders yet.</div>
          )}

          {/* ✅ All Orders */}
          <div style={{ fontSize: 20, fontWeight: 800, margin: "12px 0" }}>All Orders</div>
          {orders.length === 0 && <div style={{ color: "#6b7280" }}>No past orders.</div>}

          {orders.map((order) => (
            <div key={order.id} style={orderBox}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Order #{order.id}</div>
                  <div style={{ color: "#6b7280", fontSize: 13 }}>
                    {new Date(order.date).toLocaleString()}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#6b7280", fontSize: 13 }}>Total</div>
                  <div style={{ fontWeight: 900 }}>
                    {fmtMoney(order.total ?? order.subtotal)}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 10, borderTop: "1px dashed #eef6fb", paddingTop: 10 }}>
                {order.items?.slice(0, 3).map((it, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
                    <img
                      src={it.image || "/laptop.png"}
                      alt={it.title}
                      style={{
                        width: 64,
                        height: 48,
                        objectFit: "cover",
                        borderRadius: 6,
                        border: "1px solid #f1f5f9",
                      }}
                      onError={(e) => (e.currentTarget.src = "/laptop.png")}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>{it.title}</div>
                      <div style={{ color: "#6b7280", fontSize: 13 }}>
                        {it.qty} × {fmtMoney(it.price)}
                      </div>
                    </div>
                    <div style={{ fontWeight: 800 }}>
                      {fmtMoney((it.price || 0) * (it.qty || 1))}
                    </div>
                  </div>
                ))}
                {order.items?.length > 3 && (
                  <div style={{ color: "#6b7280", fontSize: 13 }}>
                    + {order.items.length - 3} more items
                  </div>
                )}
              </div>
            </div>
          ))}

          <div style={{ textAlign: "right", marginTop: 6 }}>
            <button
              onClick={loadOrders}
              style={{
                border: "none",
                background: "transparent",
                color: "#0a6bd6",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}