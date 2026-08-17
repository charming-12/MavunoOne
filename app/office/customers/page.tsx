"use client";

import Image from "next/image";
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
          <div key={customer.id} className="rounded-lg shadow hover:shadow-lg transition overflow-hidden group cursor-pointer">
            {/* Image Background */}
            <div className="relative h-28 bg-gray-200">
              <Image
                src={
                  customer.type === "Wholesale"
                    ? "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=300&fit=crop"
                    : "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=500&h=300&fit=crop"
                }
                alt={customer.name}
                fill
                className="object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/60 transition"></div>
              <div className="absolute inset-0 p-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">{customer.name}</h3>
                  <p className="text-sm text-gray-200">{customer.type}</p>
                </div>
                <span className={`px-3 py-1 rounded text-xs font-medium ${
                  customer.status === "Active"
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                }`}>
                  {customer.status}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white p-4">
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone size={16} className="text-green-600" />
                  <a href={`tel:${customer.phone}`} className="text-blue-600 hover:underline text-sm">
                    {customer.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail size={16} className="text-blue-600" />
                  <a href={`mailto:${customer.email}`} className="text-blue-600 hover:underline text-sm">
                    {customer.email}
                  </a>
                </div>
              </div>

              <div className="border-t pt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className={customer.debt > 0 ? "text-red-600" : "text-green-600"} size={16} />
                    <span className="text-xs text-gray-600">Deni:</span>
                  </div>
                  <span className={`font-bold text-sm ${customer.debt > 0 ? "text-red-600" : "text-green-600"}`}>
                    TZS {customer.debt.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
