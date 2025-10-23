// App.jsx
import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { FaShoppingCart, FaUserCircle } from "react-icons/fa";

import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import CustomerInfo from "./pages/CustomerInfo";
import Shipping from "./pages/Shipping";
import Payment from "./pages/Payment";
import Review from "./pages/Review";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import OrderComplete from "./pages/OrderComplete";
import OrderHistoryPreview from "./pages/OrderHistoryPreview";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";

function App() {
  const headerWrapper = { padding: 18 };

  // ---- NEW: read total orders from localStorage and keep it in sync ----
  const [orderCount, setOrderCount] = useState(0);

  const computeOrderCount = () => {
    // Try a few likely keys and shapes (array or object with .orders)
    const keys = ["orderHistory", "orders", "allOrders", "order_history"];
    let count = 0;

    for (const k of keys) {
      try {
        const raw = localStorage.getItem(k);
        if (!raw) continue;
        const data = JSON.parse(raw);

        if (Array.isArray(data)) {
          count = Math.max(count, data.length); // prefer the biggest plausible list
        } else if (data && Array.isArray(data.orders)) {
          count = Math.max(count, data.orders.length);
        }
      } catch {
        // ignore bad JSON
      }
    }

    setOrderCount(count);
  };

  useEffect(() => {
    computeOrderCount(); // on first load

    // update if something else modifies localStorage (another tab, etc.)
    const onStorage = (e) => {
      if (!e) return;
      if (["orderHistory", "orders", "allOrders", "order_history"].includes(e.key)) {
        computeOrderCount();
      }
    };
    window.addEventListener("storage", onStorage);

    // small polling safety net in case orders are written without storage event
    const t = setInterval(computeOrderCount, 1500);

    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(t);
    };
  }, []);
  // ---- /NEW ----

  return (
    <nav>
      <style>{`
        .app-header {
          background: linear-gradient(90deg, #0a3d62 0%, #12375a 100%);
          border-radius: 10px;
          padding: 18px;
          box-shadow: 0 8px 30px rgba(9, 30, 66, 0.08);
          margin: 12px;
          position: inherit;
          top: 10px;
          z-index: 60;
        }
        .inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        .brand {
          font-size: 1.9rem;
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.6px;
          padding: 6px 10px;
          border-radius: 8px;
          background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
          box-shadow: inset 0 -4px 12px rgba(255,255,255,0.02);
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .nav-links a {
          color: #fff;
          text-decoration: none;
          font-size: 0.98rem;
          font-weight: 500;
          padding: 8px 14px;
          border-radius: 8px;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .nav-links a:hover {
          background: rgba(255,255,255,0.08);
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(2,6,23,0.08);
        }
        .active-like {
          background: #ffeb99;
          color: #0b1220 !important;
          font-weight: 700;
        }
        .cart-btn {
          background: rgba(255,255,255,0.12);
          padding: 8px 12px;
          border-radius: 8px;
          position: relative;
        }
        .cart-badge {
          position: absolute;
          top: -6px;
          right: -8px;
          background: #f6c84c;
          color: #0b1220;
          font-weight: 700;
          font-size: 12px;
          padding: 2px 6px;
          border-radius: 999px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
        }
        @media (max-width: 880px) {
          .brand { font-size: 1.4rem; }
          .nav-links { width: 100%; justify-content: flex-end; gap: 8px; margin-top: 8px; }
        }
        @media (max-width: 480px) {
          .brand { font-size: 1.15rem; }
          .nav-links a { padding: 6px 8px; font-size: 0.9rem; }
        }
      `}</style>

      <header className="app-header" style={headerWrapper}>
        <div className="inner">
          <div className="brand">Electronics</div>

          <div className="nav-links" role="navigation" aria-label="Main navigation">
            <a href="/" className="nav-anchor">Home</a>
            <a href="/products" className="nav-anchor active-like">Products</a>
            <a href="/login" className="nav-anchor">Login</a>
          

            {/* 🛒 shows total orders from history */}
            <a href="/orders" className="nav-anchor cart-btn" title="Order history">
              <FaShoppingCart size={18} color="white" />
              {orderCount > 0 && <span className="cart-badge">{orderCount}</span>}
            </a>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout/info" element={<CustomerInfo />} />
          <Route path="/checkout/shipping" element={<Shipping />} />
          <Route path="/checkout/payment" element={<Payment />} />
          <Route path="/checkout/review" element={<Review />} />
          <Route path="/checkout/confirmation" element={<OrderComplete />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/orders" element={<OrderHistoryPreview />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/reset" element={<ResetPassword />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </nav>
  );
}

export default App;