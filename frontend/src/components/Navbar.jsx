import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useCart } from "../pages/CartContext";

export default function Navbar() {
  const { items } = useCart?.() ?? { items: [] };
  const count = items?.reduce((s, i) => s + (i.qty ?? 1), 0) || 0;

  return (
    <header className="bg-gradient-to-r from-[#0a3d62] to-[#12375a] shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Brand */}
          <Link
            to="/"
            className="text-2xl font-bold tracking-wide uppercase text-white hover:text-yellow-300 transition"
          >
            ELECTROESSENTIALS
          </Link>

          {/* Right Links */}
          <nav className="flex items-center gap-8 text-lg font-medium">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md transition ${
                  isActive
                    ? "bg-yellow-400 text-black font-semibold shadow-md"
                    : "text-white hover:bg-white/10 hover:shadow-md"
                }`
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/products"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md transition ${
                  isActive
                    ? "bg-yellow-400 text-black font-semibold shadow-md"
                    : "text-white hover:bg-white/10 hover:shadow-md"
                }`
              }
            >
              Products
            </NavLink>

            <NavLink
              to="/categories"
              className={({ isActive }) =>
                `px-3 py-2 rounded-md transition ${
                  isActive
                    ? "bg-yellow-400 text-black font-semibold shadow-md"
                    : "text-white hover:bg-white/10 hover:shadow-md"
                }`
              }
            >
              Categories
            </NavLink>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative inline-flex items-center px-3 py-2 rounded-md hover:bg-white/10 hover:shadow-md transition text-white"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                className="stroke-current"
              >
                <path
                  d="M3 3h2l1 5h13l-1.5 7.5a2 2 0 0 1-2 1.5H9.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="10" cy="20" r="1" fill="white" />
                <circle cx="18" cy="20" r="1" fill="white" />
              </svg>
              {count > 0 && (
                <span className="absolute -top-2 -right-3 bg-yellow-400 text-black text-xs font-semibold rounded-full px-2 shadow">
                  {count}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}