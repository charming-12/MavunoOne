"use client";

import Image from "next/image";
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
          <h1 className="text-3xl font-bold text-amber-300">Bidhaa</h1>
          <p className="text-emerald-200 mt-2">Dhamana na kueneza bidhaa</p>
        </div>
        <button
          disabled={!canManageInventory}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
            canManageInventory
              ? "bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-950 hover:from-amber-300 hover:to-amber-400 font-semibold"
              : "bg-gray-600 text-gray-400 cursor-not-allowed"
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

      {/* Alizeti Products Showcase */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-emerald-200 uppercase tracking-wider">Bidhaa za Alizeti</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Alizeti Raw */}
          <div className="bg-gradient-to-br from-[#0a1e18] to-[#051511] border border-emerald-900/40 rounded-lg overflow-hidden backdrop-blur-sm hover:border-amber-400/50 transition">
            <div className="relative h-48 w-full">
              <Image
                src="https://images.unsplash.com/photo-1585518419759-147695e3ac7a?w=500&h=400&fit=crop"
                alt="Alizeti Raw"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold text-amber-300">Alizeti (Raw)</h3>
              <p className="text-emerald-200 text-sm mt-2">Alizeti safi bila usindikaji</p>
              <div className="mt-4 space-y-2 text-sm">
                <p className="text-emerald-300">Stock: <span className="text-amber-300 font-semibold">10 kg</span></p>
                <p className="text-emerald-300">Bei ya Kununua: <span className="text-amber-300 font-semibold">TZS 25,000</span></p>
                <p className="text-emerald-300">Bei ya Kuuza: <span className="text-amber-300 font-semibold">TZS 30,000</span></p>
              </div>
            </div>
          </div>

          {/* Mafuta Alizeti */}
          <div className="bg-gradient-to-br from-[#0a1e18] to-[#051511] border border-emerald-900/40 rounded-lg overflow-hidden backdrop-blur-sm hover:border-amber-400/50 transition">
            <div className="relative h-48 w-full">
              <Image
                src="https://images.unsplash.com/photo-1550258987-920a2eae1d1f?w=500&h=400&fit=crop"
                alt="Mafuta Alizeti"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-bold text-amber-300">Mafuta Alizeti (Oil)</h3>
              <p className="text-emerald-200 text-sm mt-2">Mafuta ya alizeti safi na yenye nguvu</p>
              <div className="mt-4 space-y-2 text-sm">
                <p className="text-emerald-300">Stock: <span className="text-amber-300 font-semibold">3 Lt</span></p>
                <p className="text-emerald-300">Bei ya Kununua: <span className="text-amber-300 font-semibold">TZS 50,000</span></p>
                <p className="text-emerald-300">Bei ya Kuuza: <span className="text-amber-300 font-semibold">TZS 65,000</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!canManageInventory && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 flex items-center gap-2">
          <Lock size={16} />
          Taarifa: Kudhibiti bidhaa na bei ni kwa Admin/Boss pekee. Wafanyakazi wanaelekezwa kwenye POS tu.
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-emerald-200 uppercase tracking-wider">Orodha Kamili ya Bidhaa</h2>
        <div className="bg-gradient-to-br from-[#0a1e18] to-[#051511] border border-emerald-900/40 rounded-lg overflow-hidden backdrop-blur-sm">
          <table className="w-full">
          <thead className="bg-emerald-950/50 border-b border-emerald-900/40">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-amber-300">Jina</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-amber-300">Makundi</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-amber-300">Stock</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-amber-300">Bei ya Kununua</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-amber-300">Bei ya Kuuza</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-amber-300">Hali</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-amber-300">Hatua</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-emerald-900/40">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-emerald-900/20 transition">
                <td className="px-6 py-4 text-sm font-medium text-emerald-200">{product.name}</td>
                <td className="px-6 py-4 text-sm text-emerald-300">{product.category}</td>
                <td className="px-6 py-4 text-sm text-emerald-300">{product.stock} kg</td>
                <td className="px-6 py-4 text-sm text-emerald-300">TZS {product.costPrice.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-emerald-300">TZS {product.sellPrice.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm">
                  {product.status === "LOW" ? (
                    <span className="flex items-center gap-1 text-amber-300 bg-amber-900/30 px-2 py-1 rounded">
                      <AlertTriangle size={16} />
                      Chini
                    </span>
                  ) : (
                    <span className="text-emerald-300 bg-emerald-900/30 px-2 py-1 rounded">Sawa</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                  <button
                    className={`transition ${canManageInventory ? "text-amber-400 hover:text-amber-300" : "text-gray-600 cursor-not-allowed"}`}
                    disabled={!canManageInventory}
                    aria-label={`Edit ${product.name}`}
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    className={`transition ${canManageInventory ? "text-red-400 hover:text-red-300" : "text-gray-600 cursor-not-allowed"}`}
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
    </div>
  );
}
