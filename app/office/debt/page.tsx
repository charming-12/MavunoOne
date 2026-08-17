"use client";

import { useState } from "react";
import Image from "next/image";
import { AlertTriangle, CheckCircle, DollarSign, Phone, User } from "lucide-react";

// Mock customer debt data
const mockDebtors = [
  { id: 1, name: "Ali Mohamed", phone: "0712345678", totalDebt: 450000, paid: 200000, daysOverdue: 15, status: "overdue" },
  { id: 2, name: "Fatuma Hassan", phone: "0723456789", totalDebt: 320000, paid: 320000, daysOverdue: 0, status: "cleared" },
  { id: 3, name: "Juma Kipanga", phone: "0734567890", totalDebt: 620000, paid: 200000, daysOverdue: 28, status: "overdue" },
  { id: 4, name: "Mwanahamisi Komu", phone: "0745678901", totalDebt: 180000, paid: 50000, daysOverdue: 5, status: "pending" },
  { id: 5, name: "Rashid Salim", phone: "0756789012", totalDebt: 890000, paid: 0, daysOverdue: 45, status: "overdue" },
  { id: 6, name: "Grace Njoroge", phone: "0767890123", totalDebt: 250000, paid: 150000, daysOverdue: 3, status: "pending" },
];

export default function CustomerDebtPage() {
  const [debtors] = useState(mockDebtors);
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredDebtors =
    selectedStatus === "all"
      ? debtors
      : debtors.filter((d) => d.status === selectedStatus);

  const totalDebt = debtors.reduce((sum, d) => sum + (d.totalDebt - d.paid), 0);
  const overduCount = debtors.filter((d) => d.status === "overdue").length;
  const clearedCount = debtors.filter((d) => d.status === "cleared").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "overdue":
        return "bg-red-100 text-red-800 border-red-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "cleared":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "overdue":
        return "Kuchelewa";
      case "pending":
        return "Inasubiri";
      case "cleared":
        return "Kulipwa";
      default:
        return "Haijulikani";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="text-red-600" size={32} />
            Deni la Wateja
          </h1>
          <p className="text-gray-600 mt-1">Chakula cha wanaondoka kulipa</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Debt */}
        <div className="relative h-40 rounded-lg overflow-hidden group cursor-pointer hover:shadow-xl transition">
          <Image
            src="https://images.unsplash.com/photo-1586528946e3-b5e3d1ba4908?w=600&h=400&fit=crop"
            alt="Jumla ya Deni"
            fill
            className="object-cover group-hover:scale-110 transition duration-300"
          />
          <div className="absolute inset-0 bg-black/50 group-hover:bg-black/60 transition"></div>
          <div className="absolute inset-0 p-4 flex flex-col justify-end">
            <p className="text-xs text-gray-300 font-medium">Jumla ya Deni</p>
            <p className="text-2xl font-bold text-white">
              TZS {totalDebt.toLocaleString()}
            </p>
            <p className="text-xs text-gray-200 mt-1">Bado halijalipi</p>
          </div>
        </div>

        {/* Overdue Accounts */}
        <div className="relative h-40 rounded-lg overflow-hidden group cursor-pointer hover:shadow-xl transition">
          <Image
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop"
            alt="Mahesabu Kuchelewa"
            fill
            className="object-cover group-hover:scale-110 transition duration-300"
          />
          <div className="absolute inset-0 bg-black/50 group-hover:bg-black/60 transition"></div>
          <div className="absolute inset-0 p-4 flex flex-col justify-end">
            <p className="text-xs text-gray-300 font-medium">Mahesabu Kuchelewa</p>
            <p className="text-2xl font-bold text-white">{overduCount}</p>
            <p className="text-xs text-gray-200 mt-1">Zaidi ya siku 3</p>
          </div>
        </div>

        {/* Pending Accounts */}
        <div className="relative h-40 rounded-lg overflow-hidden group cursor-pointer hover:shadow-xl transition">
          <Image
            src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop"
            alt="Mahesabu Inasubiri"
            fill
            className="object-cover group-hover:scale-110 transition duration-300"
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition"></div>
          <div className="absolute inset-0 p-4 flex flex-col justify-end">
            <p className="text-xs text-gray-300 font-medium">Mahesabu Inasubiri</p>
            <p className="text-2xl font-bold text-white">
              {debtors.filter((d) => d.status === "pending").length}
            </p>
            <p className="text-xs text-gray-200 mt-1">Hadi siku 3</p>
          </div>
        </div>

        {/* Cleared Accounts */}
        <div className="relative h-40 rounded-lg overflow-hidden group cursor-pointer hover:shadow-xl transition">
          <Image
            src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&h=400&fit=crop"
            alt="Mahesabu Yalipi"
            fill
            className="object-cover group-hover:scale-110 transition duration-300"
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition"></div>
          <div className="absolute inset-0 p-4 flex flex-col justify-end">
            <p className="text-xs text-gray-300 font-medium">Mahesabu Yalipi</p>
            <p className="text-2xl font-bold text-white">{clearedCount}</p>
            <p className="text-xs text-gray-200 mt-1">Mahesabu kamili</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 bg-white p-4 rounded-lg shadow">
        {["all", "overdue", "pending", "cleared"].map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              selectedStatus === status
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {status === "all" && "Wote"}
            {status === "overdue" && "Kuchelewa"}
            {status === "pending" && "Inasubiri"}
            {status === "cleared" && "Yalipi"}
          </button>
        ))}
      </div>

      {/* Debtors Table */}
      <div className="card overflow-hidden">
        <h2 className="text-xl font-semibold mb-4">Orodha ya Watajika</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Jina</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Simu</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Jumla</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Kulipwa</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Bado</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Siku za Chelezo</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Hali</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Kitendo</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredDebtors.map((debtor) => (
                <tr key={debtor.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <User size={16} className="text-blue-600" />
                    </div>
                    {debtor.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600 flex items-center gap-2">
                    <Phone size={16} className="text-green-600" />
                    {debtor.phone}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    TZS {debtor.totalDebt.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-green-600 font-semibold">
                    TZS {debtor.paid.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
                      TZS {(debtor.totalDebt - debtor.paid).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        debtor.daysOverdue > 14
                          ? "bg-red-100 text-red-800"
                          : debtor.daysOverdue > 7
                          ? "bg-orange-100 text-orange-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {debtor.daysOverdue} siku
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(debtor.status)}`}>
                      {getStatusLabel(debtor.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button className="text-blue-600 hover:text-blue-800 font-medium text-sm hover:underline">
                      Butua Ukumbusho
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Send Reminders */}
        <div className="card bg-orange-50 border-l-4 border-orange-500">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-orange-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-semibold text-gray-900">Tuma Ukumbusho</h3>
              <p className="text-sm text-gray-600 mt-1">
                Tuma ujumbe wa SMS kwa wote wanaochelewa kurekebisha deni
              </p>
              <button className="mt-3 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition text-sm font-semibold">
                Tuma SMS kwa Wote
              </button>
            </div>
          </div>
        </div>

        {/* Export Report */}
        <div className="card bg-blue-50 border-l-4 border-blue-500">
          <div className="flex items-start gap-3">
            <CheckCircle className="text-blue-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-semibold text-gray-900">Karibu PDF</h3>
              <p className="text-sm text-gray-600 mt-1">
                Piga PDF ya nchi nzima ya deni na uwasilishe kwa benki
              </p>
              <button className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-semibold">
                Piga PDF Ripoti
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Record */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Kurekodi Malipo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chagua Mteja
            </label>
            <select className="form-input">
              <option value="">-- Chagua Mteja --</option>
              {debtors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} (TZS {(d.totalDebt - d.paid).toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kiasi Kilicholipwa (TZS)
            </label>
            <input type="number" placeholder="500000" className="form-input" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Njia ya Malipo
            </label>
            <select className="form-input">
              <option value="cash">Pesa Taslimu</option>
              <option value="mpesa">M-Pesa</option>
              <option value="bank">Benki</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tarehe
            </label>
            <input type="date" className="form-input" />
          </div>

          <div className="md:col-span-2">
            <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold">
              Hifadhi Malipo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
