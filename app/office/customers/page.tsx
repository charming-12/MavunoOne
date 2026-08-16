"use client";

import { Plus, Phone, Mail, TrendingUp } from "lucide-react";

export default function CustomersPage() {
  const customers = [
    { id: 1, name: "John Mkwambi", phone: "+255718123456", email: "john@mail.com", type: "Wholesale", debt: 450000, status: "Active" },
    { id: 2, name: "Amina Hassan", phone: "+255716543210", email: "amina@mail.com", type: "Retail", debt: 0, status: "Active" },
    { id: 3, name: "Emmanuel Kamari", phone: "+255719876543", email: "emma@mail.com", type: "Wholesale", debt: 250000, status: "Active" },
    { id: 4, name: "Mary Pamba", phone: "+255715555555", email: "mary@mail.com", type: "Retail", debt: 100000, status: "Suspended" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Wateja</h1>
          <p className="text-gray-600 mt-2">Dhumana na kueneza wateja</p>
        </div>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
          <Plus size={20} />
          Mteja Mpya
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {customers.map(customer => (
          <div key={customer.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
                <p className="text-sm text-gray-600">{customer.type} Customer</p>
              </div>
              <span className={`px-3 py-1 rounded text-sm font-medium ${
                customer.status === "Active"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}>
                {customer.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Phone size={16} />
                <a href={`tel:${customer.phone}`} className="text-blue-600 hover:underline">
                  {customer.phone}
                </a>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail size={16} />
                <a href={`mailto:${customer.email}`} className="text-blue-600 hover:underline">
                  {customer.email}
                </a>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className={customer.debt > 0 ? "text-red-600" : "text-green-600"} size={20} />
                  <span className="text-sm text-gray-600">Deni:</span>
                </div>
                <span className={`text-lg font-bold ${customer.debt > 0 ? "text-red-600" : "text-green-600"}`}>
                  TZS {customer.debt.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
