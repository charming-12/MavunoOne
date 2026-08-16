"use client";

import { Plus, Check, AlertTriangle } from "lucide-react";

export default function ClosuresPage() {
  const closures = [
    { id: 1, date: "2026-08-15", expectedCash: 450000, actualCash: 450000, variance: 0, status: "Balanced" },
    { id: 2, date: "2026-08-14", expectedCash: 1030000, actualCash: 1025000, variance: -5000, status: "Minor Variance" },
    { id: 3, date: "2026-08-13", expectedCash: 530000, actualCash: 530000, variance: 0, status: "Balanced" },
    { id: 4, date: "2026-08-12", expectedCash: 805000, actualCash: 810000, variance: 5000, status: "Minor Variance" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kufunga Kila Siku</h1>
          <p className="text-gray-600 mt-2">Uzamili wa pesa na kusawazisha</p>
        </div>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
          <Plus size={20} />
          Kufunga Leo
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tarehe</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Pesa Inayotarajiwa</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Pesa Halisi</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tofauti</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Hali</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {closures.map(closure => (
              <tr key={closure.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{closure.date}</td>
                <td className="px-6 py-4 text-sm text-gray-600">TZS {closure.expectedCash.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-gray-600">TZS {closure.actualCash.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm font-semibold">
                  <span className={closure.variance === 0 ? "text-green-600" : "text-yellow-600"}>
                    {closure.variance >= 0 ? "+" : ""}{closure.variance.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded text-sm flex items-center gap-1 w-fit ${
                    closure.status === "Balanced"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {closure.status === "Balanced" ? (
                      <Check size={16} />
                    ) : (
                      <AlertTriangle size={16} />
                    )}
                    {closure.status}
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
