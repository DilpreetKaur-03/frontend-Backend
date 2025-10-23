// src/pages/CheckoutPayment.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createOrder } from "../lib/api";
/**
 * Checkout Payment Page
 * - Inline styles only (no external CSS)
 * - Reads customer from localStorage.checkout_customer
 * - Reads shipping method from localStorage.checkout_shipping
 * - Reads cart from localStorage.cart to compute subtotal/shipping/total
 * - Mock credit card form with client-side validation
 * - Billing address option: same as shipping or custom
 * - Saves masked payment summary to localStorage.checkout_payment and navigates to /checkout/review
 *
 * NOTE: This is a mock form for UI only — DO NOT store or transmit real card numbers in plaintext.
 */

export default function CheckoutPayment() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [shipping, setShipping] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // payment form state
  const [method, setMethod] = useState("card"); // only card implemented by default; COD will be supported as well
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState(""); // MM/YY
  const [cvv, setCvv] = useState("");
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [billing, setBilling] = useState({
    address: "",
    address2: "",
    city: "",
    province: "",
    postal: "",
    country: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // load customer
    try {
      const raw = localStorage.getItem("checkout_customer");
      if (raw) setCustomer(JSON.parse(raw));
      else setCustomer(null);
    } catch (e) {
      setCustomer(null);
    }

    // load shipping
    try {
      const raw = localStorage.getItem("checkout_shipping");
      if (raw) setShipping(JSON.parse(raw));
      else setShipping(null);
    } catch (e) {
      setShipping(null);
    }

    // load cart and compute subtotal
    try {
      const raw = localStorage.getItem("cart") || "[]";
      const arr = JSON.parse(raw);
      const normalized = (arr || []).map((it) => ({
        id: it.id ?? it.product ?? Math.random(),
        title: it.title ?? it.name ?? "Product",
        price: Number(it.price ?? it.amount ?? it.unit_price ?? 0) || 0,
        qty: Math.max(1, Math.floor(Number(it.qty ?? it.quantity ?? 1) || 1)),
      }));
      setCartItems(normalized);
      setSubtotal(normalized.reduce((s, it) => s + it.price * (it.qty || 1), 0));
    } catch (e) {
      setCartItems([]);
      setSubtotal(0);
    }

    // load billing if saved
    try {
      const raw = localStorage.getItem("checkout_payment");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.billing) setBilling(parsed.billing);
        if (parsed.sameAsShipping !== undefined) setSameAsShipping(Boolean(parsed.sameAsShipping));
        if (parsed.method) setMethod(parsed.method);
      }
    } catch (e) {
      // ignore
    }

    setLoading(false);
  }, []);

  // helper money formatting (CAD as earlier)
  function fm(n) {
    return `$${Number(n || 0).toFixed(2)}`;
  }

  function shippingPrice() {
    return (shipping && Number(shipping.price)) ? Number(shipping.price) : 0;
  }

  function total() {
    return subtotal + shippingPrice();
  }

  // simple Luhn check for card number (allow spaces)
  function luhnCheck(num) {
    const digits = num.replace(/\D/g, "");
    if (digits.length < 12) return false;
    let sum = 0;
    let alt = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let d = parseInt(digits.charAt(i), 10);
      if (alt) {
        d *= 2;
        if (d > 9) d -= 9;
      }
      sum += d;
      alt = !alt;
    }
    return sum % 10 === 0;
  }

  function validatePayment() {
    const e = {};
    if (method === "card") {
      const digits = cardNumber.replace(/\s+/g, "");
      if (!digits || !/^\d{12,19}$/.test(digits) || !luhnCheck(digits)) {
        e.cardNumber = "Enter a valid card number";
      }
      if (!cardName || cardName.trim().length < 2) e.cardName = "Name on card required";
      // expiry MM/YY validity & not past
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
        e.expiry = "Expiry must be in MM/YY";
      } else {
        const [mStr, yStr] = expiry.split("/");
        const m = parseInt(mStr, 10);
        const y = 2000 + parseInt(yStr, 10);
        const lastDay = new Date(y, m, 0, 23, 59, 59);
        if (lastDay < new Date()) e.expiry = "Card expired";
      }
      if (!/^\d{3,4}$/.test(cvv)) e.cvv = "Invalid CVV";
    } else if (method === "cod") {
      // Cash on Delivery: no card validation required.
      // Optionally you can add phone required validation here for COD if desired.
    } else {
      e.method = "Select a payment method";
    }

    // billing validation if not same as shipping
    if (!sameAsShipping) {
      if (!billing.address) e.billingAddress = "Billing address required";
      if (!billing.city) e.billingCity = "City required";
      if (!billing.country) e.billingCountry = "Country required";
    }

    return e;
  }

  function maskCard(num) {
    const digits = num.replace(/\D/g, "");
    const last4 = digits.slice(-4);
    return `•••• •••• •••• ${last4}`;
  }
  navigate("/checkout/review");

  function handlePay(e) {
    e && e.preventDefault();
    const eobj = validatePayment();
    setErrors(eobj);
    if (Object.keys(eobj).length > 0) {
      // focus first error field if present
      const first = Object.keys(eobj)[0];
      const el = document.querySelector(`[name="${first}"]`);
      if (el) el.focus();
      return;
    }

    // create payment summary (mask card) - handle COD by skipping card storage
    const masked = {
      method,
      cardMask: method === "cod" ? null : maskCard(cardNumber || ""),
      cardName: method === "cod" ? null : cardName,
      billing: sameAsShipping ? { address: customer?.address || "", city: customer?.city || "", province: customer?.province || "", postal: customer?.postal || "", country: customer?.country || "" } : billing,
      sameAsShipping,
      amount: total(),
      shipping: shippingPrice(),
      subtotal,
      cashDueOnDelivery: method === "cod" ? total() : 0,
    };

    // save a minimal payment summary (NOT full card details)
    try {
      localStorage.setItem("checkout_payment", JSON.stringify(masked));
    } catch (err) {
      console.error("save payment summary error", err);
    }

    // navigate to review
    navigate("/checkout/review");
  }

  // simple input helpers for card formatting (groups of 4)
  function handleCardInput(val) {
    const digits = val.replace(/\D/g, "");
    // group as 4-4-4-... up to 19 digits
    const groups = [];
    for (let i = 0; i < digits.length; i += 4) groups.push(digits.substr(i, 4));
    setCardNumber(groups.join(" "));
  }

  // styles inline
  const page = { fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, Arial", padding: 28, background: "#f8fafb", minHeight: "78vh" };
  const container = { maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" };

  const cardStyle = { background: "#fff", borderRadius: 12, padding: 28, boxShadow: "0 8px 30px rgba(16,24,40,0.05)", border: "1px solid #f1f5f9" };
  const title = { fontSize: 34, color: "#0b1220", margin: "4px 0 18px", fontWeight: 700 };

  const sectionTitle = { fontSize: 18, fontWeight: 700, margin: "14px 0 8px", color: "#0b1220" };
  const label = { display: "block", marginBottom: 6, fontWeight: 600, color: "#0f172a" };
  const input = { width: "100%", padding: "12px 14px", borderRadius: 8, border: "1px solid #e6e6e6", fontSize: 16, boxSizing: "border-box" };
  const small = { color: "#6b7280", fontSize: 13 };

  const errorStyle = { color: "#ef4444", marginTop: 6, fontSize: 13 };

  const payBtn = { width: "100%", padding: "14px 18px", borderRadius: 10, border: "none", background: "#0a6bd6", color: "#fff", fontWeight: 800, fontSize: 16, cursor: "pointer", marginTop: 18 };

  const summary = { background: "#fff", borderRadius: 12, padding: 18, border: "1px solid #f1f5f9", boxShadow: "0 8px 30px rgba(16,24,40,0.03)", position: "sticky", top: 28 };

  // responsive handling (stack)
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    function check() { setNarrow(window.innerWidth < 900); }
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const finalContainer = narrow ? { ...container, gridTemplateColumns: "1fr", paddingBottom: 60 } : container;

  if (loading) return <div style={page}><div style={{ maxWidth: 1100, margin: "80px auto", textAlign: "center" }}>Loading…</div></div>;

  return (
    <div style={page}>
      <div style={finalContainer}>
        {/* left - form */}
        <div style={cardStyle}>
          <h1 style={title}>Payment Information</h1>

          {/* top row: customer name/email */}
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontWeight: 700 }}>{customer ? `${customer.firstName || ""} ${customer.lastName || ""}` : "Guest"}</div>
            <div style={{ color: "#6b7280" }}>{customer?.email || ""}</div>
          </div>

          {/* --- ADDED: shipping address summary block (merged from image) --- */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 700, color: "#0b1220", marginBottom: 8 }}>Shipping address</div>
            <div style={{ color: "#0b1220", marginBottom: 4 }}>
              {customer?.address ? customer.address : shipping?.address ? shipping.address : "No address provided"}
            </div>
            <div style={{ color: "#6b7280", marginBottom: 2 }}>
              {customer?.city || shipping?.city ? `${customer?.city || shipping?.city}` : ""}
              { (customer?.province || shipping?.province) ? ` ${customer?.province || shipping?.province}` : "" }
              { (customer?.postal || shipping?.postal) ? ` ${customer?.postal || shipping?.postal}` : "" }
            </div>
            <div style={{ color: "#6b7280", fontSize: 13 }}>
              {customer?.country || shipping?.country || ""}
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid #f3f4f6", margin: "6px 0 18px" }} />

          {/* Payment method */}
          <div>
            <div style={sectionTitle}>Payment method</div>
            <div style={{ color: "#6b7280", marginBottom: 12 }}>All transactions are secure and encrypted.</div>

            {/* small row of card icons / secure note (added, decorative) */}
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: "#6b7280", display: "flex", gap: 8, alignItems: "center" }}>
                <span role="img" aria-label="lock">🔒</span> Secure payment
              </div>
              <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>Visa</div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>Mastercard</div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>Amex</div>
              </div>
            </div>

            <div style={{ border: "1px solid #e6eef6", borderRadius: 10, padding: 12 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <input type="radio" checked={method === "card"} onChange={() => setMethod("card")} />
                <div style={{ fontWeight: 700 }}>Credit Card</div>
              </label>

              {/* added COD radio option */}
              <label style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
                <input type="radio" checked={method === "cod"} onChange={() => setMethod("cod")} />
                <div style={{ fontWeight: 700 }}>Cash on Delivery (COD)</div>
              </label>

              {/* card fields (visible only if method === "card") */}
              {method === "card" && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ marginBottom: 10 }}>
                    <label style={label}>Card number</label>
                    <input
                      name="cardNumber"
                      value={cardNumber}
                      onChange={(e) => handleCardInput(e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      style={input}
                      inputMode="numeric"
                      autoComplete="cc-number"
                    />
                    {errors.cardNumber && <div style={errorStyle}>{errors.cardNumber}</div>}
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <label style={label}>Name on card</label>
                    <input
                      name="cardName"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Full name as on card"
                      style={input}
                      autoComplete="cc-name"
                    />
                    {errors.cardName && <div style={errorStyle}>{errors.cardName}</div>}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 100px", gap: 12 }}>
                    <div>
                      <label style={label}>Expiration (MM/YY)</label>
                      <input
                        name="expiry"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        placeholder="MM/YY"
                        style={input}
                        autoComplete="cc-exp"
                      />
                      {errors.expiry && <div style={errorStyle}>{errors.expiry}</div>}
                    </div>

                    <div>
                      <label style={label}>CVV</label>
                      <input
                        name="cvv"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0,4))}
                        placeholder="123"
                        style={input}
                        inputMode="numeric"
                        autoComplete="cc-csc"
                      />
                      {errors.cvv && <div style={errorStyle}>{errors.cvv}</div>}
                    </div>
                  </div>
                </div>
              )}

              {/* COD note when selected */}
              {method === "cod" && (
                <div style={{ marginTop: 12, padding: 10, borderRadius: 8, background: "#fffbeb", border: "1px solid #fde68a", color: "#92400e" }}>
                  <strong>Cash on Delivery selected:</strong> Please have the exact amount ready. Delivery personnel may not carry change. Amount due on delivery: <strong>{fm(total())}</strong>.
                </div>
              )}
            </div>
          </div>

          {/* Billing address */}
          <div style={{ marginTop: 18 }}>
            <div style={sectionTitle}>Billing address</div>

            <div style={{ border: "1px solid #e6eef6", borderRadius: 10, padding: 12 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <input type="radio" checked={sameAsShipping} onChange={() => setSameAsShipping(true)} />
                <div style={{ fontWeight: 700 }}>Same as shipping address</div>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <input type="radio" checked={!sameAsShipping} onChange={() => setSameAsShipping(false)} />
                <div style={{ fontWeight: 700 }}>Use a different billing address</div>
              </label>

              {!sameAsShipping && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ marginBottom: 10 }}>
                    <label style={label}>Address</label>
                    <input name="billingAddress" value={billing.address} onChange={(e) => setBilling({ ...billing, address: e.target.value })} style={input} />
                    {errors.billingAddress && <div style={errorStyle}>{errors.billingAddress}</div>}
                  </div>

                  <div style={{ marginBottom: 10 }}>
                    <label style={label}>Apartment / suite (optional)</label>
                    <input value={billing.address2} onChange={(e) => setBilling({ ...billing, address2: e.target.value })} style={input} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={label}>City</label>
                      <input value={billing.city} onChange={(e) => setBilling({ ...billing, city: e.target.value })} style={input} />
                      {errors.billingCity && <div style={errorStyle}>{errors.billingCity}</div>}
                    </div>

                    <div>
                      <label style={label}>Province / State</label>
                      <input value={billing.province} onChange={(e) => setBilling({ ...billing, province: e.target.value })} style={input} />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
                    <div>
                      <label style={label}>Country</label>
                      <input value={billing.country} onChange={(e) => setBilling({ ...billing, country: e.target.value })} style={input} />
                      {errors.billingCountry && <div style={errorStyle}>{errors.billingCountry}</div>}
                    </div>

                    <div>
                      <label style={label}>Postal / ZIP</label>
                      <input value={billing.postal} onChange={(e) => setBilling({ ...billing, postal: e.target.value })} style={input} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button onClick={handlePay} style={payBtn} aria-label="Pay now">
            Pay now
          </button>
        </div>

        {/* right - order summary */}
        <aside style={summary}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Order summary</div>

          <div style={{ maxHeight: 240, overflow: "auto", marginBottom: 12 }}>
            {cartItems.length === 0 ? (
              <div style={{ color: "#9ca3af" }}>Your cart is empty.</div>
            ) : (
              cartItems.map((it, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{it.title}</div>
                    <div style={{ color: "#6b7280", fontSize: 13 }}>Qty {it.qty}</div>
                  </div>
                  <div style={{ fontWeight: 700 }}>{fm(it.price * (it.qty || 1))}</div>
                </div>
              ))
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ color: "#6b7280" }}>Subtotal</div>
            <div style={{ fontWeight: 700 }}>{fm(subtotal)}</div>
          </div>
           <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ color: "#6b7280" }}>Shipping</div>
        <div style={{ fontWeight: 700 }}>{fm(shippingPrice())}</div>
      </div>

      <div style={{ borderTop: "1px dashed #f3f4f6", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ color: "#6b7280" }}>Total</div>
        <div style={{ fontWeight: 900, fontSize: 18 }}>{fm(total())}</div>
      </div>

      <div style={{ color: "#9ca3af", fontSize: 13, marginBottom: 12 }}>
        Taxes and duties calculated at review / confirmation.
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={handlePay}
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 8,
            border: "none",
            background: "#f59e0b",
            color: "#000",
            fontWeight: 800,
          }}
        >
          Continue to review
        </button>
        <Link to="/checkout/shipping" style={{ textDecoration: "none" }}>
          <button
            style={{
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px solid #e6eef6",
              background: "#fff",
              color: "#0b1220",
              fontWeight: 700,
            }}
          >
            Back to shipping
          </button>
        </Link>
      </div>
    </aside>
  </div>
</div>
);
}
          