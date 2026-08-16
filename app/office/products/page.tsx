"use client";

import { Plus, Edit2, Trash2, AlertTriangle, Lock } from "lucide-react";
import { readStoredUser } from "@/lib/auth";

const products = [
  { id: 1, name: "Mahindi (Raw)", category: "Mahindi", stock: 50, costPrice: 8000, sellPrice: 9000, status: "OK" },
  { id: 2, name: "Unga wa Mahindi", category: "Mahindi", stock: 12, costPrice: 15000, sellPrice: 18000, status: "LOW" },
  { id: 3, name: "Uduvi (Bran)", category: "Mahindi", stock: 8, costPrice: 3000, sellPrice: 4500, status: "LOW" },
  { id: 4, name: "Pumba (Meal)", category: "Mahindi", stock: 5, costPrice: 12000, sellPrice: 15000, status: "LOW" },
  { id: 5, name: "Kahdarikaa", category: "Mahindi", stock: 25, costPrice: 10000, sellPrice: 12000, status: "OK" },
  { id: 6, name: "Alizeti (Raw)", category: "Alizeti", stock: 10, costPrice: 25000, sellPrice: 30000, status: "OK" },
  { id: 7, name: "Mafuta Alizeti (Oil)", category: "Alizeti", stock: 3, costPrice: 50000, sellPrice: 65000, status: "LOW" },
  { id: 8, name: "Chokaa (Limestone)", category: "Supplements", stock: 40, costPrice: 2000, sellPrice: 2500, status: "OK" },
  { id: 9, name: "Animal Feeds (Mixed)", category: "Animal Feeds", stock: 15, costPrice: 20000, sellPrice: 25000, status: "LOW" },
] as const;

export default function ProductsPage() {
  const currentUser = readStoredUser();
  const canManageInventory = ["admin", "boss", "owner"].includes(currentUser?.role ?? "");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bidhaa</h1>
          <p className="text-gray-600 mt-2">Dhamana na kueneza bidhaa</p>
        </div>
        <button
          disabled={!canManageInventory}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
            canManageInventory
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          aria-label="Add new product"
        >
          <Plus size={20} />
          Bidhaa Mpya
        </button>
      </div>

      {!canManageInventory && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 flex items-center gap-2">
          <Lock size={16} />
          Taarifa: Kudhibiti bidhaa na bei ni kwa Admin/Boss pekee. Wafanyakazi wanaelekezwa kwenye POS tu.
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Jina</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Makundi</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Stock</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Bei ya Kununua</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Bei ya Kuuza</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Hali</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Hatua</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{product.stock} kg</td>
                <td className="px-6 py-4 text-sm text-gray-600">TZS {product.costPrice.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-gray-600">TZS {product.sellPrice.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm">
                  {product.status === "LOW" ? (
                    <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                      <AlertTriangle size={16} />
                      Chini
                    </span>
                  ) : (
                    <span className="text-green-600 bg-green-50 px-2 py-1 rounded">Sawa</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                  <button
                    className={`transition ${canManageInventory ? "text-blue-600 hover:text-blue-700" : "text-gray-300 cursor-not-allowed"}`}
                    disabled={!canManageInventory}
                    aria-label={`Edit ${product.name}`}
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    className={`transition ${canManageInventory ? "text-red-600 hover:text-red-700" : "text-gray-300 cursor-not-allowed"}`}
                    disabled={!canManageInventory}
                    aria-label={`Delete ${product.name}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
