"use client";

import { Plus } from "lucide-react";

export default function StockInPage() {
  const stockInRecords = [
    { id: 1, product: "Mahindi", quantity: 50, supplier: "Mkocha Farm", costPerUnit: 8000, totalCost: 400000, date: "2026-08-15", status: "Received" },
    { id: 2, product: "Ndizi", quantity: 30, supplier: "Banana Traders", costPerUnit: 4500, totalCost: 135000, date: "2026-08-14", status: "Received" },
    { id: 3, product: "Mchele", quantity: 100, supplier: "Rice Mills Ltd", costPerUnit: 3200, totalCost: 320000, date: "2026-08-13", status: "Pending" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stock In</h1>
          <p className="text-gray-600 mt-2">Rekodi ya bidhaa zinazoingia</p>
        </div>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
          <Plus size={20} />
          Stock Mpya
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Bidhaa</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Kiasi</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Mzazi</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Bei ya Kilo</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Jumla</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tarehe</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Hali</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {stockInRecords.map(record => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{record.product}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{record.quantity} kg</td>
                <td className="px-6 py-4 text-sm text-gray-600">{record.supplier}</td>
                <td className="px-6 py-4 text-sm text-gray-600">TZS {record.costPerUnit.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-gray-900 font-semibold">TZS {record.totalCost.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{record.date}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded text-sm ${
                    record.status === "Received"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {record.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
