"use client";

import { useState } from "react";
import { AlertTriangle, TrendingDown, BarChart3, Package, Zap } from "lucide-react";

// Mock inventory data
const mockInventory = [
  { id: 1, name: "Mahindi", sku: "CORN-001", quantity: 45, minStock: 50, maxStock: 200, unit: "kg", lastRestocked: "2024-01-15", value: 4500000 },
  { id: 2, name: "Unga wa Mahindi", sku: "FLOUR-001", quantity: 12, minStock: 30, maxStock: 150, unit: "bags", lastRestocked: "2024-01-10", value: 1800000 },
  { id: 3, name: "Alizee", sku: "ALI-001", quantity: 8, minStock: 20, maxStock: 100, unit: "bags", lastRestocked: "2024-01-08", value: 1600000 },
  { id: 4, name: "Sukari", sku: "SUGAR-001", quantity: 95, minStock: 40, maxStock: 200, unit: "kg", lastRestocked: "2024-01-20", value: 2850000 },
  { id: 5, name: "Chai", sku: "TEA-001", quantity: 320, minStock: 100, maxStock: 500, unit: "pieces", lastRestocked: "2024-01-18", value: 3200000 },
  { id: 6, name: "Simu ya Kusimika", sku: "GRIND-001", quantity: 2, minStock: 5, maxStock: 15, unit: "units", lastRestocked: "2024-01-12", value: 600000 },
];

export default function InventoryAnalyticsPage() {
  const [inventory] = useState(mockInventory);
  const [sortBy, setSortBy] = useState("name");

  // Calculate inventory metrics
  const lowStockItems = inventory.filter((item) => item.quantity <= item.minStock);
  const overstockedItems = inventory.filter((item) => item.quantity > item.maxStock);
  const totalValue = inventory.reduce((sum, item) => sum + item.value, 0);

  const getSortedInventory = () => {
    const sorted = [...inventory];
    switch (sortBy) {
      case "stock":
        return sorted.sort((a, b) => a.quantity - b.quantity);
      case "value":
        return sorted.sort((a, b) => b.value - a.value);
      case "turnover":
        return sorted.sort((a, b) => {
          const aTurnover = a.quantity / a.maxStock;
          const bTurnover = b.quantity / b.maxStock;
          return aTurnover - bTurnover;
        });
      default:
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
  };

  const getStockStatus = (quantity: number, min: number, max: number) => {
    if (quantity <= min) return "critical";
    if (quantity >= max) return "overstock";
    return "optimal";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "overstock":
        return "bg-blue-100 text-blue-800";
      case "optimal":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const sortedInventory = getSortedInventory();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 className="text-blue-600" size={32} />
          Uchambuzi wa Hesabu ya Bidhaa
        </h1>
        <p className="text-gray-600 mt-1">Kutazama mienendo na mapendekezo ya kujaza stock</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-gray-600 text-sm">Jumla ya Bidhaa</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{inventory.length}</p>
          <p className="text-xs text-gray-500 mt-1">Aina za bidhaa</p>
        </div>

        <div className="card">
          <p className="text-gray-600 text-sm">Stock za Haraka</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{lowStockItems.length}</p>
          <p className="text-xs text-gray-500 mt-1">Zinahitaji kujazwa</p>
        </div>

        <div className="card">
          <p className="text-gray-600 text-sm">Stock Zaidi</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{overstockedItems.length}</p>
          <p className="text-xs text-gray-500 mt-1">Zaidi ya kiwango</p>
        </div>

        <div className="card">
          <p className="text-gray-600 text-sm">Jumla ya Thamani</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            TZS {(totalValue / 1000000).toFixed(1)}M
          </p>
          <p className="text-xs text-gray-500 mt-1">Sehemu ya bidhaa</p>
        </div>
      </div>

      {/* Critical Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="card bg-red-50 border-l-4 border-red-500">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-red-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-semibold text-gray-900">Onyo wa Stock za Haraka!</h3>
              <p className="text-sm text-gray-700 mt-1">
                {lowStockItems.length} bidhaa za haraka zinahitaji kujazwa upesi:
              </p>
              <ul className="text-sm text-gray-700 mt-2 space-y-1">
                {lowStockItems.map((item) => (
                  <li key={item.id} className="ml-4">
                    • <strong>{item.name}</strong>: Waliopo {item.quantity} {item.unit} (Min: {item.minStock})
                  </li>
                ))}
              </ul>
              <button className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm font-semibold">
                Jaza Stock Sasa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overstocked Alert */}
      {overstockedItems.length > 0 && (
        <div className="card bg-blue-50 border-l-4 border-blue-500">
          <div className="flex items-start gap-3">
            <TrendingDown className="text-blue-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-semibold text-gray-900">Stock Zaidi na Kuzuiwa!</h3>
              <p className="text-sm text-gray-700 mt-1">
                Bidhaa hii zina stock zaidi ya kiwango cha juu:
              </p>
              <ul className="text-sm text-gray-700 mt-2 space-y-1">
                {overstockedItems.map((item) => (
                  <li key={item.id} className="ml-4">
                    • <strong>{item.name}</strong>: Waliopo {item.quantity} {item.unit} (Max: {item.maxStock})
                  </li>
                ))}
              </ul>
              <button className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-semibold">
                Kuuza na Kupunguza
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sort Controls */}
      <div className="card">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Orodha ya Bidhaa</h3>
          <div className="flex gap-2">
            <label className="text-sm text-gray-600">Panga kwa:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-input text-sm"
            >
              <option value="name">Jina</option>
              <option value="stock">Stock (Chini → Juu)</option>
              <option value="value">Thamani (Juu → Chini)</option>
              <option value="turnover">Turnover (Haraka)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Bidhaa</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">SKU</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Waliopo</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Min | Max</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Thamani</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Hali</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Kujaza Upesi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortedInventory.map((item) => {
                const status = getStockStatus(item.quantity, item.minStock, item.maxStock);
                const restockDays = status === "critical" ? 1 : status === "optimal" ? 14 : 30;
                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2">
                      <Package size={16} className="text-gray-600" />
                      {item.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-sm">{item.sku}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800">
                        {item.quantity} {item.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-600">
                      {item.minStock} | {item.maxStock}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      TZS {(item.value / 1000000).toFixed(2)}M
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(status)}`}>
                        {status === "critical" && "⚠️ Haraka"}
                        {status === "overstock" && "📦 Zaidi"}
                        {status === "optimal" && "✅ Sawa"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs font-semibold text-gray-600">
                        {restockDays === 1 ? "Sasa!" : `${restockDays} siku`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Recommendations */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="text-yellow-600" size={24} />
          Mapendekezo ya Kujaza
        </h3>
        <div className="space-y-3">
          {lowStockItems.map((item) => {
            const restockQty = item.maxStock - item.quantity;
            return (
              <div key={item.id} className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Pendekezo: Jaza {restockQty} {item.unit} kufikia kiwango cha juu ({item.maxStock})
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Mzani wa wakaati wa Kujaza upesi: {restockQty <= 20 ? "SASA" : restockQty <= 50 ? "Leo" : "Wiki hii"}
                    </p>
                  </div>
                  <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition font-semibold text-sm">
                    Jaza
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inventory History */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Historia ya Kujaza (Miezi 3 Iliyopita)</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <p className="font-medium text-gray-900">Mahindi</p>
              <p className="text-xs text-gray-600">Kuzungushwa saa 45kg - 2024-01-15</p>
            </div>
            <span className="text-green-600 font-semibold">+45 kg</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <p className="font-medium text-gray-900">Unga wa Mahindi</p>
              <p className="text-xs text-gray-600">Kuzungushwa saa 30 bags - 2024-01-10</p>
            </div>
            <span className="text-green-600 font-semibold">+30 bags</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div>
              <p className="font-medium text-gray-900">Sukari</p>
              <p className="text-xs text-gray-600">Kuzungushwa saa 60kg - 2024-01-20</p>
            </div>
            <span className="text-green-600 font-semibold">+60 kg</span>
          </div>
        </div>
      </div>
    </div>
  );
}
