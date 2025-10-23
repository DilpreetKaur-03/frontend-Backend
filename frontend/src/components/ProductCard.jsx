// src/components/ProductCard.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function ProductCard({ p, onAddToCart }) {
  // image resolver: if p.image is absolute (http) use as-is, else prefix backend host
  const imageSrc =
    p.image && typeof p.image === "string"
      ? (p.image.startsWith("http") ? p.image : `http://127.0.0.1:8000${p.image}`)
      : "/laptop.png"; // public fallback

  return (
    <article className="border rounded-lg shadow-sm hover:shadow-lg transition p-4 bg-white">
      <div className="flex items-center justify-center h-40 bg-gray-100 mb-4">
        <img
          src={imageSrc}
          alt={p.title || p.name}
          className="max-h-32 object-contain"
          onError={(e) => { e.target.onerror = null; e.target.src = "/laptop.png"; }}
        />
      </div>

      <div className="text-center">
        <h3 className="font-semibold text-lg mb-2">{p.title || p.name}</h3>
        <div className="text-gray-700 mb-4">${p.price}</div>

        <div className="flex justify-center gap-2">
          <Link
            to={`/products/${p.id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            View
          </Link>

          <button
            onClick={() => onAddToCart && onAddToCart(p)}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
          >
            Add to cart
          </button>
        </div>
      </div>
    </article>
  );
}