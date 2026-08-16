"use client";

import { User, TrendingUp, Clock } from "lucide-react";

export default function ShopAccountPage() {
  const customerInfo = {
    name: "John Mkwambi",
    phone: "+255718123456",
    type: "Wholesale Customer",
    creditLimit: 1000000,
    currentDebt: 450000,
  };

  const orders = [
    { id: "ORD-001", date: "2026-08-15", items: "Mahindi (50kg)", amount: 450000, status: "Delivered" },
    { id: "ORD-002", date: "2026-08-14", items: "Ndizi (20kg), Mchele (30kg)", amount: 100000, status: "Delivered" },
    { id: "ORD-003", date: "2026-08-12", items: "Maharage (25kg)", amount: 100000, status: "Paid" },
  ];

  const availableCredit = customerInfo.creditLimit - customerInfo.currentDebt;

  return (
    <div className="min-h-screen bg-gray-50 p-4 space-y-4">
      {/* Profile Card */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl">
            <User size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{customerInfo.name}</h2>
            <p className="text-sm text-gray-600">{customerInfo.type}</p>
            <p className="text-sm text-gray-600">{customerInfo.phone}</p>
          </div>
        </div>
      </div>

      {/* Credit Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Limit ya Deni</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            TZS {customerInfo.creditLimit.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-gray-600 text-sm">Deni Halisi</p>
          <p className="text-2xl font-bold text-red-600 mt-2">
            TZS {customerInfo.currentDebt.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Available Credit */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-gray-600 text-sm">Mkopo Unaoweza Kutumia</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              TZS {availableCredit.toLocaleString()}
            </p>
          </div>
          <TrendingUp className="text-green-600" size={32} />
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-red-600 h-3"
            style={{ width: `${(customerInfo.currentDebt / customerInfo.creditLimit) * 100}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          {((customerInfo.currentDebt / customerInfo.creditLimit) * 100).toFixed(0)}% ya mkopo uliotumika
        </p>
      </div>

      {/* Recent Orders */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Clock size={20} />
          Agizo za Hivi Karibuni
        </h3>
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order.id} className="border-b pb-3">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-gray-900 text-sm">{order.id}</p>
                <span className={`text-xs px-2 py-1 rounded ${
                  order.status === "Paid"
                    ? "bg-green-100 text-green-800"
                    : "bg-blue-100 text-blue-800"
                }`}>
                  {order.status}
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-2">{order.items}</p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-600">{order.date}</p>
                <p className="font-semibold text-green-600">TZS {order.amount.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <button className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700">
          Lipa Deni
        </button>
        <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">
          Wasiliana Nasi
        </button>
      </div>
    </div>
  );
}
