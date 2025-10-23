import React from "react";

export default function Flowchart(){
  return (
    <div className="max-w-6xl mx-auto px-6">
      <h2 className="text-3xl font-extrabold text-center mb-8">Order Flow</h2>
      <div className="bg-white rounded-lg shadow p-8">
        {/* Use the provided flowchart image (replace url with local file if you have) */}
        <img src="https://i.imgur.com/yourflowchart.png" alt="flowchart" className="w-full object-contain"/>
        <p className="mt-4 text-sm text-gray-600">Follow the flow: Home → Products → Product Details → Add to Cart → Checkout → Payment → Review → Place Order</p>
      </div>
    </div>
  );
}