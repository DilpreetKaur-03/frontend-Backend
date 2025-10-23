import React from "react";
const cats = ["Laptops","Smartphones","Cameras","Accessories"];

export default function Categories(){
  return (
    <div className="max-w-6xl mx-auto px-6">
      <h2 className="text-3xl font-extrabold text-center mb-8">Shop by Category</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {cats.map((c,i)=>(
          <div key={i} className="bg-[var(--brand-blue)] text-white rounded-lg p-8 flex flex-col items-center justify-center shadow">
            <div className="mb-4 text-3xl">📦</div>
            <div className="font-semibold">{c}</div>
          </div>
        ))}
      </div>
    </div>
  );
}