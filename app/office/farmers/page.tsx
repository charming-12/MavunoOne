"use client";

import { useState } from "react";
import Image from "next/image";
import { Users, Phone, MapPin, Plus } from "lucide-react";

// Mock farmers data
const mockFarmers = [
  {
    id: 1,
    name: "Mwalimu Juma",
    phone: "0712345678",
    location: "Morogoro",
    farmSize: "2 acres",
    totalSupplied: 5000,
    totalPaid: 4500,
    balance: 500,
  },
  {
    id: 2,
    name: "Mama Zainab",
    phone: "0723456789",
    location: "Iringa",
    farmSize: "3 acres",
    totalSupplied: 8000,
    totalPaid: 8000,
    balance: 0,
  },
  {
    id: 3,
    name: "Selemani Mkapa",
    phone: "0734567890",
    location: "Dar es Salaam",
    farmSize: "1.5 acres",
    totalSupplied: 3000,
    totalPaid: 2800,
    balance: 200,
  },
];

export default function FarmersPage() {
  const [farmers] = useState(mockFarmers);
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="text-green-600" size={32} />
            Wakulima
          </h1>
          <p className="text-gray-600 mt-1">Simamia wakulima na manunuzi</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
        >
          <Plus size={20} />
          Kuongeza Mkulima
        </button>
      </div>

      {/* Add Farmer Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-600">
          <h2 className="text-lg font-semibold mb-4">Mubu Kuongeza Mkulima</h2>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Jina la Mkulima"
              className="form-input"
            />
            <input
              type="tel"
              placeholder="Namba ya Simu"
              className="form-input"
            />
            <input
              type="text"
              placeholder="Eneo (Mji)"
              className="form-input"
            />
            <input
              type="text"
              placeholder="Ukubwa wa Shambani (acres)"
              className="form-input"
            />
            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
              >
                Hifadhi
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 bg-gray-300 text-gray-900 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Ghairi
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Farmers */}
        <div className="relative h-40 rounded-lg overflow-hidden group cursor-pointer hover:shadow-xl transition">
          <Image
            src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&h=400&fit=crop"
            alt="Jumla ya Wakulima"
            fill
            className="object-cover group-hover:scale-110 transition duration-300"
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition"></div>
          <div className="absolute inset-0 p-4 flex flex-col justify-end">
            <p className="text-xs text-gray-300 font-medium">Jumla ya Wakulima</p>
            <p className="text-2xl font-bold text-white">{farmers.length}</p>
          </div>
        </div>

        {/* Total Supplied */}
        <div className="relative h-40 rounded-lg overflow-hidden group cursor-pointer hover:shadow-xl transition">
          <Image
            src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&h=400&fit=crop"
            alt="Jumla Supplied"
            fill
            className="object-cover group-hover:scale-110 transition duration-300"
          />
          <div className="absolute inset-0 bg-black/50 group-hover:bg-black/60 transition"></div>
          <div className="absolute inset-0 p-4 flex flex-col justify-end">
            <p className="text-xs text-gray-300 font-medium">Jumla Supplied</p>
            <p className="text-2xl font-bold text-white">
              {farmers.reduce((sum, f) => sum + f.totalSupplied, 0).toLocaleString()} kg
            </p>
          </div>
        </div>

        {/* Total Paid */}
        <div className="relative h-40 rounded-lg overflow-hidden group cursor-pointer hover:shadow-xl transition">
          <Image
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop"
            alt="Jumla Kulipwa"
            fill
            className="object-cover group-hover:scale-110 transition duration-300"
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition"></div>
          <div className="absolute inset-0 p-4 flex flex-col justify-end">
            <p className="text-xs text-gray-300 font-medium">Jumla Kulipwa</p>
            <p className="text-2xl font-bold text-white">
              TZS {farmers.reduce((sum, f) => sum + f.totalPaid, 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Total Debt */}
        <div className="relative h-40 rounded-lg overflow-hidden group cursor-pointer hover:shadow-xl transition">
          <Image
            src="https://images.unsplash.com/photo-1586528946e3-b5e3d1ba4908?w=600&h=400&fit=crop"
            alt="Jumla Deni"
            fill
            className="object-cover group-hover:scale-110 transition duration-300"
          />
          <div className="absolute inset-0 bg-black/50 group-hover:bg-black/60 transition"></div>
          <div className="absolute inset-0 p-4 flex flex-col justify-end">
            <p className="text-xs text-gray-300 font-medium">Jumla Deni</p>
            <p className="text-2xl font-bold text-white">
              TZS {farmers.reduce((sum, f) => sum + f.balance, 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Farmers Table */}
      <div className="card overflow-hidden">
        <h2 className="text-xl font-semibold mb-4">Orodha ya Wakulima</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Jina</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Simu</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Eneo</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Farm Size</th>
                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Supplied</th>
                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Kulipwa</th>
                <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Deni</th>
                <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {farmers.map((farmer) => (
                <tr key={farmer.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-900">{farmer.name}</td>
                  <td className="px-4 py-3 text-gray-600 flex items-center gap-2">
                    <Phone size={16} className="text-green-600" />
                    {farmer.phone}
                  </td>
                  <td className="px-4 py-3 text-gray-600 flex items-center gap-2">
                    <MapPin size={16} className="text-blue-600" />
                    {farmer.location}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{farmer.farmSize}</td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    {farmer.totalSupplied.toLocaleString()} kg
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-green-600">
                    TZS {farmer.totalPaid.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        farmer.balance > 0
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      TZS {farmer.balance.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button className="text-blue-600 hover:text-blue-800 font-medium">
                      Nunua
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Farmer Purchase Form */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Nunua kutoka kwa Mkulima</h2>
        <form className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chagua Mkulima
            </label>
            <select className="form-input">
              <option value="">-- Chagua --</option>
              {farmers.map((farmer) => (
                <option key={farmer.id} value={farmer.id}>
                  {farmer.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bidhaa
            </label>
            <select className="form-input">
              <option value="">-- Chagua Bidhaa --</option>
              <option value="mahindi">Mahindi</option>
              <option value="alizee">Alizee</option>
              <option value="karamu">Karamu</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Idadi (kg)
            </label>
            <input type="number" placeholder="100" className="form-input" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bei kwa kg (TZS)
            </label>
            <input type="number" placeholder="2500" className="form-input" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Njia ya Malipo
            </label>
            <select className="form-input">
              <option value="cash">Pesa Taslimu</option>
              <option value="credit">Deni</option>
              <option value="mpesa">M-Pesa</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kilicholipwa (TZS)
            </label>
            <input type="number" placeholder="0" className="form-input" />
          </div>

          <div className="md:col-span-3">
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold"
            >
              Hifadhi Manunuzi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
