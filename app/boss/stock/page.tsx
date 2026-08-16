"use client";

import { AlertTriangle } from "lucide-react";

export default function BossStockPage() {
  const products = [
    { id: 1, name: "Mahindi", stock: 50, minStock: 30, status: "OK" },
    { id: 2, name: "Ndizi", stock: 2, minStock: 10, status: "CRITICAL" },
    { id: 3, name: "Mchele", stock: 100, minStock: 50, status: "OK" },
    { id: 4, name: "Maharage", stock: 5, minStock: 15, status: "LOW" },
  ];

  const lowStockCount = products.filter(p => p.status !== "OK").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-800 text-white p-4">
        <h1 className="text-lg font-bold">Stock — Hali Halisi</h1>
      </header>

      <main className="p-4 space-y-4">
        {/* Alert */}
        {lowStockCount > 0 && (
          <div className="bg-red-100 border border-red-300 p-3 rounded-lg flex items-start gap-3">
            <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={20} />
            <div>
              <p className="font-semibold text-red-800 text-sm">{lowStockCount} bidhaa za chini</p>
              <p className="text-xs text-red-700 mt-1">Zinahitaji kutengenezwa haraka</p>
            </div>
          </div>
        )}

        {/* Product List */}
        <div className="space-y-3">
          {products.map(product => (
            <div key={product.id} className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{product.name}</h3>
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  product.status === "OK"
                    ? "bg-green-100 text-green-800"
                    : product.status === "CRITICAL"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                  {product.status}
                </span>
              </div>
              
              <div className="bg-gray-100 rounded-full h-3 mb-2 overflow-hidden">
                <div
                  className={`h-3 ${
                    product.status === "OK"
                      ? "bg-green-600"
                      : product.status === "CRITICAL"
                      ? "bg-red-600"
                      : "bg-yellow-600"
                  }`}
                  style={{ width: `${(product.stock / 100) * 100}%` }}
                ></div>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-gray-600">
                  <strong>{product.stock}</strong> kg
                </span>
                <span className="text-gray-600">
                  Min: <strong>{product.minStock}</strong> kg
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
