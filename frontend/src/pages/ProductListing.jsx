import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";

export default function ProductListing(){
  const [products, setProducts] = useState([]);

  useEffect(() => {
    api.get("/products/")
      .then(res => setProducts(res.data))
      .catch(err => {
        console.error(err);
        // fallback sample
        setProducts([{id:1,name:"Wireless Headphones", price:199.99, category:"Headphones", image:"https://via.placeholder.com/300"}]);
      });
  }, []);

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Products</h2>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(p => (
          <div key={p.id} className="bg-white rounded shadow-sm p-4">
            <img src={p.image || "https://via.placeholder.com/300"} className="h-44 w-full object-cover mb-3 rounded" alt={p.name} />
            <div className="font-semibold">{p.name}</div>
            <div className="text-gray-600">{p.category}</div>
            <div className="flex justify-between items-center mt-3">
              <div className="text-lg font-bold">${Number(p.price).toFixed(2)}</div>
              <Link to={`/products/${p.id}`} className="text-blue-700">View</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}