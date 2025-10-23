// frontend/src/lib/api.js
// ----------------------------------------------------
// Unified API helpers: products/orders (fetch) + auth/profile (axios)
// ----------------------------------------------------
import axios from "axios";

// ---------- Base URL ----------
export const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
export const API_PREFIX = "/api";

function fullUrl(path) {
  if (!path.startsWith("/")) path = "/" + path;
  return `${API_BASE}${API_PREFIX}${path}`;
}
export { fullUrl }; // optional, if needed elsewhere

// ---------- Axios instance (auth endpoints) ----------
export const api = axios.create({
  baseURL: `${API_BASE}${API_PREFIX}/`,
});

// Attach JWT token from localStorage if present
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("access");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// ---------- Auto-refresh token on 401 ----------
let isRefreshing = false;
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config || {};
    if (error.response?.status === 401 && !original._retry) {
      const refresh = localStorage.getItem("refresh");
      if (!refresh || isRefreshing) throw error;

      original._retry = true;
      isRefreshing = true;

      try {
        const res = await fetch(`${API_BASE}/api/token/refresh/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh }),
        });
        isRefreshing = false;
        if (!res.ok) throw error;

        const data = await res.json();
        if (data?.access) {
          localStorage.setItem("access", data.access);
          original.headers = original.headers || {};
          original.headers.Authorization = `Bearer ${data.access}`;
          return api(original);
        }
      } catch (e) {
        isRefreshing = false;
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        throw error;
      }
    }
    throw error;
  }
);

// ================= AUTH =================
export async function loginWithPassword(usernameOrEmail, password) {
  // Try SimpleJWT first
  let res = await fetch(`${API_BASE}/api/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: usernameOrEmail, password }),
  });

  // Optional Djoser fallback
  if (!res.ok) {
    res = await fetch(`${API_BASE}/api/auth/jwt/create/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: usernameOrEmail, password }),
    });
  }

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Login failed: ${res.status} ${txt}`);
  }

  const data = await res.json();
  const access = data.access || data.token || null;
  const refresh = data.refresh || null;

  if (access) localStorage.setItem("access", access);
  if (refresh) localStorage.setItem("refresh", refresh);

  return { access, refresh };
}

// ================= Products / Orders (fetch) =================
export async function fetchProducts() {
  const res = await fetch(fullUrl("/products/"));
  if (!res.ok) throw new Error("Failed to fetch products: " + res.status);
  return res.json();
}

export async function fetchProduct(id) {
  const res = await fetch(fullUrl(`/products/${id}/`));
  if (!res.ok) throw new Error("Failed to fetch product: " + res.status);
  return res.json();
}

export async function createOrder(payload) {
  const res = await fetch(fullUrl("/checkout/"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let body = "";
    try { body = await res.text(); } catch {}
    throw new Error("Order failed: " + res.status + " " + body);
  }

  const data = await res.json();

  // also cache locally for OrderHistory
  const orderToStore = {
    id: data.id ?? data.order_id ?? `ORD-${Date.now()}`,
    date: data.date ?? data.created_at ?? new Date().toISOString(),
    items: data.items ?? payload.items ?? [],
    total: data.total ?? data.subtotal ?? payload.total ?? payload.subtotal ?? 0,
    subtotal: data.subtotal ?? payload.subtotal ?? payload.total ?? 0,
    ...(data.shipping_address ? { shipping_address: data.shipping_address } : {}),
  };

  try {
    const existing = JSON.parse(localStorage.getItem("orders") || "[]");
    const arr = Array.isArray(existing) ? existing : [];
    arr.unshift(orderToStore);
    localStorage.setItem("orders", JSON.stringify(arr));
  } catch (e) {
    console.warn("Failed to save order to localStorage:", e);
  }

  return data;
}

export async function submitReview(productId, rating, text) {
  const res = await fetch(fullUrl(`/products/${productId}/reviews/`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rating, text }),
  });

  if (!res.ok) {
    let body = "";
    try { body = await res.text(); } catch {}
    throw new Error("Failed to submit review: " + res.status + " " + body);
  }

  return res.json();
}

// ================= Profile (axios) =================
export const getMyProfile = () =>
  api.get("profile/me/").then((r) => r.data);

export const updateMyProfile = (data) =>
  api.patch("profile/me/", data, {
    headers: { "Content-Type": "application/json" },
  }).then((r) => r.data);

export const updateMyProfileMultipart = (values) => {
  const form = new FormData();
  Object.entries(values).forEach(([k, v]) => {
    if (v !== undefined && v !== null) form.append(k, v);
  });
  return api.patch("profile/me/", form, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);
};

export const saveMyProfile = (values) => {
  const hasFile = Object.values(values).some(
    (v) => v instanceof File || v instanceof Blob
  );
  return hasFile ? updateMyProfileMultipart(values) : updateMyProfile(values);
};