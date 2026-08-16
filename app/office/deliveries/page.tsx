"use client";

import { Plus, MapPin } from "lucide-react";

export default function DeliveriesPage() {
  const deliveries = [
    { id: 1, invoice: "INV-001", customer: "John Mkwambi", product: "Mahindi", quantity: 50, destination: "Dar es Salaam", date: "2026-08-15 14:30", status: "Delivered" },
    { id: 2, invoice: "INV-002", customer: "Amina Hassan", product: "Ndizi", quantity: 20, destination: "Morogoro", date: "2026-08-15 12:15", status: "In Transit" },
    { id: 3, invoice: "INV-003", customer: "Emmanuel Kamari", product: "Mchele", quantity: 100, destination: "Iringa", date: "2026-08-14 16:45", status: "Pending" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upokeaji</h1>
          <p className="text-gray-600 mt-2">Ufuatiliaji wa shipment</p>
        </div>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
          <Plus size={20} />
          Delivery Mpya
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Risiti</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Mteja</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Bidhaa</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Kiasi</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Mahali</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tarehe</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Hali</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {deliveries.map(delivery => (
              <tr key={delivery.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-semibold text-blue-600">{delivery.invoice}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{delivery.customer}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{delivery.product}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{delivery.quantity} kg</td>
                <td className="px-6 py-4 text-sm text-gray-600 flex items-center gap-1">
                  <MapPin size={16} />
                  {delivery.destination}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{delivery.date}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded text-sm ${
                    delivery.status === "Delivered"
                      ? "bg-green-100 text-green-800"
                      : delivery.status === "In Transit"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {delivery.status}
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
