"use client";

import { Plus } from "lucide-react";

export default function StockOutPage() {
  const stockOutRecords = [
    { id: 1, product: "Mahindi", quantity: 10, reason: "Waste", date: "2026-08-15", status: "Recorded" },
    { id: 2, product: "Ndizi", quantity: 5, reason: "Damaged", date: "2026-08-14", status: "Recorded" },
    { id: 3, product: "Mchele", quantity: 20, reason: "Free Sample", date: "2026-08-13", status: "Recorded" },
    { id: 4, product: "Maharage", quantity: 3, reason: "Return", date: "2026-08-12", status: "Recorded" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stock Out</h1>
          <p className="text-gray-600 mt-2">Rekodi ya bidhaa zinazotoka</p>
        </div>
        <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2">
          <Plus size={20} />
          Stock Inatoka
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Bidhaa</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Kiasi</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Sababu</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tarehe</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Hali</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {stockOutRecords.map(record => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{record.product}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{record.quantity} kg</td>
                <td className="px-6 py-4 text-sm text-gray-600">{record.reason}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{record.date}</td>
                <td className="px-6 py-4 text-sm">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
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
