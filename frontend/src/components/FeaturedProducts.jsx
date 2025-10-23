import React from "react";

const products = [
  { id:1, title:"Laptop", price:"$999", img:"\laptop.png" },
  { id:2, title:"Smartwatch", price:"$199", img:"\watch.png" },
  { id:3, title:"Camera", price:"$799", img:"camera.png" },
  { id:4, title:"Wireless Earbuds", price:"$129", img:"earbuds.png" }
];

function Card({p}){
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="bg-gray-50 rounded-md p-4 h-40 flex items-center justify-center">
        <img src={p.img} alt={p.title} className="object-contain h-full"/>
      </div>
      <h3 className="mt-4 font-semibold text-lg">{p.title}</h3>
      <div className="text-gray-700 mt-2">{p.price}</div>
    </div>
  );
}

export default function FeaturedProducts(){
  return (
    <div className="max-w-6xl mx-auto px-6">
      <h2 className="text-3xl font-extrabold text-center mb-8">Featured Products</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map(p => <Card key={p.id} p={p} />)}
      </div>
    </div>
  );
}