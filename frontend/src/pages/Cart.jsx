import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

/**
 * Cart page (self-contained)
 * - Reads from localStorage "cart"
 * - ✅ Only show the last-added product (as you asked)
 * - Qty +/- , remove, clear cart, subtotal, checkout
 */

export default function Cart() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // load cart from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("cart") || "[]";
      const arr = JSON.parse(raw);

      // normalize all entries
      const normalized = (arr || []).map((it) => ({
        id: it.id ?? it.product ?? Math.random(),
        title: it.title ?? it.name ?? "Product",
        image: it.image ?? it.thumbnail ?? "/laptop.png",
        price: Number(it.price ?? it.amount ?? it.unit_price ?? 0) || 0,
        qty: Number(it.qty ?? it.quantity ?? 1) || 1,
      }));

      // ✅ show only the last-added item
      const lastOnly = normalized.length ? [normalized[normalized.length - 1]] : [];
      setItems(lastOnly);
    } catch (e) {
      console.error("Cart parse error", e);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // persist helper
  function save(next) {
    localStorage.setItem("cart", JSON.stringify(next));
  }

  function updateQty(index, newQty) {
    const copy = items.slice();
    copy[index] = { ...copy[index], qty: Math.max(1, Math.floor(newQty)) };
    setItems(copy);
    save(copy);
  }

  function removeItem(index) {
    const copy = items.slice();
    copy.splice(index, 1);
    setItems(copy);
    save(copy);
  }

  function clearCart() {
    setItems([]);
    localStorage.removeItem("cart");
  }

  const subtotal = items.reduce((s, it) => s + it.price * (it.qty || 1), 0);

  // styles
  const page = { fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,Arial", padding: 20, color: "#0f172a" };
  const container = { maxWidth: 1100, margin: "0 auto" };
  const heading = { fontSize: 36, fontWeight: 700, marginBottom: 18, textAlign: "center" };
  const table = { width: "100%", borderCollapse: "collapse", marginTop: 20 };
  const th = { textAlign: "left", padding: "12px 8px", color: "#374151", borderBottom: "1px solid #e6eef6" };
  const tr = { verticalAlign: "middle" };
  const td = { padding: "14px 8px", borderBottom: "1px solid #f3f4f6" };

  const productCell = { display: "flex", gap: 12, alignItems: "center" };
  const thumb = { width: 92, height: 64, objectFit: "contain", borderRadius: 8, background: "#fafafa", padding: 8, border: "1px solid #f1f5f9" };

  const qtyInput = {
    width: 72,
    padding: "8px 10px",
    borderRadius: 6,
    border: "1px solid #e2e8f0",
    textAlign: "center",
  };

  const button = {
    padding: "10px 16px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontWeight: 700,
  };

  const btnPrimary = { ...button, background: "#fbbf24", color: "#000" };
  const btnSecondary = { ...button, background: "#0a3d62", color: "#fff" };

  const summary = { marginTop: 24, display: "flex", justifyContent: "flex-end", gap: 18, alignItems: "center" };
  const summaryBox = { width: 360, borderRadius: 12, border: "1px solid #e6eef6", padding: 18, background: "#fff", boxShadow: "0 6px 20px rgba(16,24,40,0.03)" };

  return (
    <div style={page}>
      <div style={container}>
        <h1 style={heading}>Your Shopping Cart</h1>

        {loading ? (
          <div style={{ textAlign: "center", padding: 30 }}>Loading...</div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#374151" }}>
            <p style={{ fontSize: 18, marginBottom: 10 }}>Your cart is empty.</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
              <Link to="/products" style={{ ...btnSecondary, textDecoration: "none" }}>
                Browse Products
              </Link>
              <button onClick={() => { clearCart(); navigate("/"); }} style={{ ...button, border: "1px solid #e6eef6", borderRadius: 8, background: "#fff" }}>
                Back to Home
              </button>
            </div>
          </div>
        ) : (
          <>
            <table style={table}>
              <thead>
                <tr style={tr}>
                  <th style={{ ...th, width: "48%" }}>Product</th>
                  <th style={{ ...th, width: "16%" }}>Price</th>
                  <th style={{ ...th, width: "18%" }}>Quantity</th>
                  <th style={{ ...th, width: "18%", textAlign: "right" }}>Total</th>
                </tr>
              </thead>

              <tbody>
                {items.map((it, i) => (
                  <tr key={i} style={tr}>
                    <td style={td}>
                      <div style={productCell}>
                        <img src={it.image} alt={it.title} style={thumb} onError={(e)=> e.target.src="/laptop.png"} />
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: "#0b1220" }}>{it.title}</div>
                        </div>
                      </div>
                    </td>

                    <td style={td}>
                      <div style={{ fontWeight: 700 }}>${Number(it.price).toFixed(2)}</div>
                    </td>

                    <td style={td}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <button
                          onClick={() => updateQty(i, (it.qty || 1) - 1)}
                          style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #e6eef6", background: "#fff", cursor: "pointer" }}
                        >
                          –
                        </button>

                        <input
                          type="number"
                          value={it.qty || 1}
                          min={1}
                          onChange={(e) => {
                            const v = Math.max(1, Number(e.target.value || 1));
                            updateQty(i, v);
                          }}
                          style={qtyInput}
                        />

                        <button
                          onClick={() => updateQty(i, (it.qty || 1) + 1)}
                          style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #e6eef6", background: "#fff", cursor: "pointer" }}
                        >
                          +
                        </button>

                        <button
                          onClick={() => removeItem(i)}
                          style={{ marginLeft: 8, padding: "6px 8px", borderRadius: 6, border: "1px solid #ffe4e6", background: "#fff", color: "#ef4444", cursor: "pointer" }}
                        >
                          Remove
                        </button>
                      </div>
                    </td>

                    <td style={{ ...td, textAlign: "right" }}>
                      <div style={{ fontWeight: 700 }}>${(it.price * (it.qty || 1)).toFixed(2)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={summary}>
              <div style={summaryBox}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ color: "#6b7280" }}>Subtotal</div>
                  <div style={{ fontWeight: 700 }}>${subtotal.toFixed(2)}</div>
                </div>

                <div style={{ color: "#9ca3af", fontSize: 13, marginBottom: 14 }}>Taxes and shipping calculated at checkout.</div>

                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button
                    onClick={() => navigate("/checkout/info")}
                    style={{ ...btnPrimary, width: "100%" }}
                  >
                    Proceed to Checkout
                  </button>
                </div>

                <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "space-between" }}>
                  <button
                    onClick={clearCart}
                    style={{ background: "#fff", border: "1px solid #e6eef6", padding: "8px 12px", borderRadius: 8, cursor: "pointer" }}
                  >
                    Clear Cart
                  </button>

                  <Link to="/products" style={{ textDecoration: "none" }}>
                    <button style={{ background: "#0a3d62", color: "#fff", padding: "8px 12px", borderRadius: 8, cursor: "pointer" }}>
                      Continue shopping
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}