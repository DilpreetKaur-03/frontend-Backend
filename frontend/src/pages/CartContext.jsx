// src/context/CartContext.jsx
import React, { createContext, useContext, useState } from "react";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  function addToCart(product, qty = 1) {
    setItems(prev => {
      const found = prev.find(i => i.id === product.id);
      if (found) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { ...product, qty }];
    });
  }

  function updateQty(id, qty) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  }

  function removeItem(id) {
    setItems(prev => prev.filter(i => i.id !== id));
  }

  const subtotal = items.reduce((s, i) => s + i.price * (i.qty || 1), 0);

  return (
    <CartContext.Provider value={{ items, addToCart, updateQty, removeItem, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}