import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Home({ handleAddToCart }) {
  const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/";
  const [products, setProducts] = useState([]);
  const [hoverIdx, setHoverIdx] = useState(null);

  // 🟢 Fetch products from backend
  useEffect(() => {
    fetch(`${API}api/products/`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
        else if (data.results) setProducts(data.results);
        else setProducts([]);
      })
      .catch((err) => {
        console.error("Product fetch error:", err);
        // fallback demo data (in case backend is down)
        setProducts([
          { id: 1, name: "Laptop", price: 999, image: "/laptop.png" },
          { id: 2, name: "Wireless Headphones", price: 199, image: "/headphones.png" },
          { id: 3, name: "4K TV", price: 799, image: "/tv.png" },
        ]);
      });
  }, []);

  // 🟡 Add to cart and redirect to cart page
  const addToCart = (product) => {
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    cart.push({ ...product, qty: 1 });
    localStorage.setItem("cart", JSON.stringify(cart));
    window.location.href = "/cart";
  };

  // Layout styles
  const page = {
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, Arial",
    color: "#0f172a",
    background: "#ffffff",
  };

  const hero = {
    background: "linear-gradient(90deg, #0a3d62 0%, #1e6091 100%)",
    padding: "70px 40px",
    display: "flex",
    gap: 32,
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    marginBottom: 40,
    color: "#fff",
  };

  const heroLeft = { maxWidth: 700 };
  const heroTitle = { fontSize: 46, lineHeight: 1.1, margin: "0 0 12px", fontWeight: 700 };
  const heroSubtitle = { fontSize: 20, margin: "0 0 18px", opacity: 0.95 };
  const heroBadge = { display: "inline-block", marginBottom: 14, fontWeight: 600 };

  const cta = {
    display: "inline-block",
    background: "#fff",
    color: "#0a3d62",
    padding: "12px 20px",
    borderRadius: 8,
    textDecoration: "none",
    fontWeight: 700,
  };

  const heroImage = { width: 320, borderRadius: 12, objectFit: "cover", flexShrink: 0 };

  const section = { maxWidth: 1200, margin: "0 auto", padding: "0 20px" };

  const featuredHeading = {
    textAlign: "center",
    fontSize: 38,
    fontWeight: 700,
    margin: "8px 0 24px",
    color: "#0f172a",
  };

  // Grid
  const featuredGrid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: 22,
  };

  const card = {
    border: "1px solid #e6eef6",
    borderRadius: 12,
    padding: 20,
    background: "#ffffff",
    boxShadow: "0 3px 8px rgba(16,24,40,0.05)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    transition: "transform .15s ease, box-shadow .15s ease",
    minHeight: 280,
  };

  const cardHover = { transform: "translateY(-6px)", boxShadow: "0 10px 30px rgba(16,24,40,0.08)" };

  const cardImageWrap = {
    width: "100%",
    height: 160,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8fbff",
    borderRadius: 8,
    marginBottom: 16,
    overflow: "hidden",
  };

  const cardImage = { maxWidth: "100%", maxHeight: "100%", objectFit: "contain" };

  const cardTitle = { margin: "0 0 10px", fontSize: 18, fontWeight: 700, color: "#0b1220", textAlign: "center" };
  const cardPrice = { margin: 0, color: "#0b1220", fontWeight: 600, marginBottom: 14 };

  const linkStyle = {
    padding: "8px 14px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#0b1220",
    textDecoration: "none",
    fontWeight: 600,
  };

  const btnPrimary = {
    padding: "8px 14px",
    borderRadius: 8,
    border: "none",
    background: "#0a3d62",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  };

  return (
    <div style={page}>
      <main style={section}>
        {/* Hero Section */}
        <div style={hero}>
          <div style={heroLeft}>
            <h1 style={heroTitle}>Discover the Latest in Tech</h1>
            <div style={heroSubtitle}>Shop our wide range of electronic devices and accessories.</div>
            <div style={heroBadge}>✓ Quality products, guaranteed</div>

            <div style={{ display: "flex", gap: 12, marginTop: 16, alignItems: "center" }}>
              <Link to="/products" style={cta}>Shop Now</Link>
              <a
                href="#featured"
                style={{
                  color: "#fff",
                  textDecoration: "underline",
                  fontWeight: 600,
                  marginLeft: 6,
                }}
              >
                Browse featured
              </a>
            </div>
          </div>

          <img
            src="/hero-device.png"
            alt="hero device"
            style={heroImage}
            onError={(e) => (e.target.src = "/laptop.png")}
          />
        </div>

        {/* Featured Products */}
        <section id="featured" style={{ marginTop: 28 }}>
          <h2 style={featuredHeading}>Featured Products</h2>

          <div style={featuredGrid}>
            {products.map((product, idx) => (
              <div
                key={product.id}
                style={{
                  ...card,
                  ...(hoverIdx === idx ? cardHover : {}),
                }}
                onMouseEnter={() => setHoverIdx(idx)}
                onMouseLeave={() => setHoverIdx(null)}
              >
                <div style={cardImageWrap}>
                  <img
                    src={product.image || "/laptop.png"}
                    alt={product.name}
                    style={cardImage}
                    onError={(e) => (e.target.src = "/laptop.png")}
                  />
                </div>

                <h3 style={cardTitle}>{product.name || product.title}</h3>
                <p style={cardPrice}>${product.price}</p>

                <div style={{ marginTop: "auto", display: "flex", gap: 10 }}>
                  <Link to={`/products/${product.id}`} style={linkStyle}>View</Link>
                  <button onClick={() => addToCart(product)} style={btnPrimary}>
                    Add to cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <footer style={{ marginTop: 40, borderTop: "1px solid #f1f5f9", paddingTop: 24 }}>
          <div style={{ textAlign: "center", color: "#64748b" }}>
            © 2025 Electronics Store Canada. All rights reserved.
          </div>
        </footer>
      </main>
    </div>
  );
}

export default Home;