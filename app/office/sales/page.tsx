"use client";

import { Eye, Download } from "lucide-react";

export default function SalesHistoryPage() {
  const sales = [
    { id: "INV-001", customer: "John Mkwambi", total: 450000, items: 5, date: "2026-08-15 14:30", status: "Paid", method: "Cash" },
    { id: "INV-002", customer: "Amina Hassan", total: 120000, items: 2, date: "2026-08-15 12:15", status: "Paid", method: "M-Pesa" },
    { id: "INV-003", customer: "Emmanuel Kamari", total: 350000, items: 4, date: "2026-08-14 16:45", status: "Pending", method: "Credit" },
    { id: "INV-004", customer: "Mary Pamba", total: 80000, items: 3, date: "2026-08-14 11:20", status: "Paid", method: "M-Pesa" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Historia ya Mauzo</h1>
        <p className="text-gray-600 mt-2">Angalia na udaki historia ya mauzo</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">No. Risiti</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Mteja</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Jumla</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Bidhaa</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tarehe</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Njia</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Hali</th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">Hatua</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sales.map(sale => (
              <tr key={sale.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-semibold text-blue-600">{sale.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{sale.customer}</td>
                <td className="px-6 py-4 text-sm font-medium text-green-600">TZS {sale.total.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{sale.items} bidhaa</td>
                <td className="px-6 py-4 text-sm text-gray-600">{sale.date}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{sale.method}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded text-sm ${
                    sale.status === "Paid"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {sale.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                  <button className="text-blue-600 hover:text-blue-700">
                    <Eye size={18} />
                  </button>
                  <button className="text-green-600 hover:text-green-700">
                    <Download size={18} />
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
