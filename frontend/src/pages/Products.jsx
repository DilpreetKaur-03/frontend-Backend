// frontend/src/pages/Products.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchProducts } from "../lib/api"; // path to your unified API helper

// Build base for local media fallback (if API returns relative paths)
const BASE = (import.meta.env?.VITE_API_URL || process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000").replace(/\/$/, "");

function normalizeProducts(items) {
  const list = Array.isArray(items) ? items : items?.results || [];
  return list.map((p) => {
    const id = p.id ?? p.pk ?? p.product_id;
    const title = p.title ?? p.name ?? p.product ?? "Product";
    const price = p.price ?? p.unit_price ?? p.amount ?? 0;

    let img = p.image || p.thumbnail || p.image_url || p.media || "";
    if (img && !/^https?:\/\//i.test(img)) {
      // If image is a relative path, try to build a proper URL
      if (img.startsWith("/")) img = `${BASE}${img}`;
      else img = `${BASE}/media/${img}`;
    }
    return { id, title, price, image: img };
  });
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [hoverIndex, setHoverIndex] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const data = await fetchProducts(); // uses frontend/src/lib/api.js
        if (!mounted) return;
        setProducts(normalizeProducts(data));
      } catch (e) {
        console.error("Products fetch failed:", e);
        if (!mounted) return;
        setErr("Products not available right now.");
        // fallback sample data so UI still shows something
        setProducts([
          { id: 2, title: "Laptop", price: 999, image: "/laptop.png" },
          { id: 3, title: "Wireless Headphones", price: 199, image: "/headphones.png" },
          { id: 4, title: "4K TV", price: 799, image: "/tv.png" },
        ]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Add single product to cart (overwrites old cart)
  function handleAddToCart(product) {
    try {
      localStorage.removeItem("cart"); // clear old cart (as requested in prior code)
      const onlyThis = [{
        id: product.id,
        title: product.title ?? product.name ?? "Product",
        price: Number(product.price) || 0,
        image: product.image || "/laptop.png",
        qty: 1,
        _ts: Date.now(),
      }];
      localStorage.setItem("cart", JSON.stringify(onlyThis));
    } catch (e) {
      console.error("Cart write error", e);
    }
    navigate("/cart");
  }

  // Styles
  const pageStyle = { maxWidth: 1200, margin: "0 auto", padding: "28px 20px", fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial", color: "#111827" };
  const headingStyle = { textAlign: "center", fontSize: 40, fontWeight: 700, marginBottom: 18 };
  const gridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, alignItems: "stretch" };
  const cardStyle = { border: "1px solid #e6e6e6", boxSizing: "border-box", borderRadius: 12, background: "#fff", padding: 14, display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 260, transition: "transform .12s ease, box-shadow .12s ease" };
  const cardHover = { transform: "translateY(-6px)", boxShadow: "0 8px 24px rgba(16,24,40,0.08)" };
  const imageWrap = { height: 160, display: "flex", alignItems: "center", justifyContent: "center", background: "#fafafa", borderRadius: 8, overflow: "hidden", marginBottom: 12 };
  const imageStyle = { maxWidth: "100%", maxHeight: "100%", objectFit: "contain" };
  const titleStyle = { fontSize: 18, fontWeight: 600, margin: "6px 0 6px", color: "#111827" };
  const priceStyle = { fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 10 };
  const viewBtn = { padding: "8px 12px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", textDecoration: "none", color: "#111827", fontWeight: 600 };
  const cartBtn = { padding: "8px 12px", borderRadius: 8, border: "none", background: "#0a3d62", color: "#fff", cursor: "pointer", fontWeight: 700 };

  return (
    <div style={pageStyle}>
      <h1 style={headingStyle}>Products</h1>

      {loading && <p style={{ textAlign: "center" }}>Loading…</p>}
      {!loading && err && <p style={{ textAlign: "center", color: "#b91c1c", marginBottom: 16 }}>{err}</p>}
      {!loading && !err && products.length === 0 && <p style={{ textAlign: "center" }}>No products yet.</p>}

      <div style={gridStyle}>
        {products.map((p, idx) => (
          <div
            key={p.id ?? idx}
            style={{ ...cardStyle, ...(hoverIndex === idx ? cardHover : {}) }}
            onMouseEnter={() => setHoverIndex(idx)}
            onMouseLeave={() => setHoverIndex(null)}
          >
            <div>
              <div style={imageWrap}>
                <img
                  src={p.image || "/laptop.png"}
                  alt={p.title}
                  style={imageStyle}
                  onError={(e) => { e.currentTarget.src = "/laptop.png"; }}
                />
              </div>
              <div style={{ textAlign: "left" }}>
                <h3 style={titleStyle}>{p.title}</h3>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={priceStyle}>${p.price}</div>
              <div style={{ borderTop: "1px dashed #f3f4f6", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <Link to={`/products/${p.id}`} style={viewBtn}>View</Link>
                <button onClick={() => handleAddToCart(p)} style={cartBtn}>Add to cart</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}