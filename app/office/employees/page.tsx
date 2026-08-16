"use client";

import { useState } from "react";
import { Users, Plus, Edit2, Trash2, Phone, Mail, AlertCircle } from "lucide-react";

// Mock employee data
const mockEmployees = [
  { id: 1, name: "Ahmed Hassan", role: "POS Operator", phone: "0712345678", email: "ahmed@mavunoone.com", department: "Sales", status: "active", salary: 800000, joinDate: "2023-06-15" },
  { id: 2, name: "Zainab Mohamed", role: "Stock Manager", phone: "0723456789", email: "zainab@mavunoone.com", department: "Inventory", status: "active", salary: 1200000, joinDate: "2023-04-20" },
  { id: 3, name: "John Kipchoge", role: "Delivery Driver", phone: "0734567890", email: "john@mavunoone.com", department: "Logistics", status: "active", salary: 900000, joinDate: "2023-08-10" },
  { id: 4, name: "Mary Wanjiru", role: "Cashier", phone: "0745678901", email: "mary@mavunoone.com", department: "Finance", status: "active", salary: 750000, joinDate: "2023-07-25" },
  { id: 5, name: "David Omondi", role: "Warehouse Assistant", phone: "0756789012", email: "david@mavunoone.com", department: "Warehouse", status: "inactive", salary: 600000, joinDate: "2023-09-01" },
  { id: 6, name: "Grace Mwangi", role: "Customer Support", phone: "0767890123", email: "grace@mavunoone.com", department: "Operations", status: "active", salary: 700000, joinDate: "2023-11-15" },
];

const departments = ["Sales", "Inventory", "Logistics", "Finance", "Warehouse", "Operations", "Management"];
const roles = ["POS Operator", "Stock Manager", "Delivery Driver", "Cashier", "Warehouse Assistant", "Customer Support", "Manager"];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState(mockEmployees);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.phone.includes(searchTerm) ||
                          emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = filterDept === "all" || emp.department === filterDept;
    const matchesStatus = filterStatus === "all" || emp.status === filterStatus;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const activeCount = employees.filter((e) => e.status === "active").length;
  const inactiveCount = employees.filter((e) => e.status === "inactive").length;
  const totalPayroll = employees.reduce((sum, e) => sum + e.salary, 0);

  const deleteEmployee = (id: number) => {
    if (confirm("Taka kuondoa mfanyakazi huyu?")) {
      setEmployees(employees.filter((e) => e.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="text-blue-600" size={32} />
            Wafanyakazi
          </h1>
          <p className="text-gray-600 mt-1">Usimamizi wa timu na firimbi</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold flex items-center gap-2"
        >
          <Plus size={20} />
          Mfanyakazi Mpya
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-gray-600 text-sm">Jumla ya Wafanyakazi</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{employees.length}</p>
          <p className="text-xs text-gray-500 mt-1">Juma nzima</p>
        </div>

        <div className="card">
          <p className="text-gray-600 text-sm">Wanafanya Kazi</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{activeCount}</p>
          <p className="text-xs text-gray-500 mt-1">Sasa hivi</p>
        </div>

        <div className="card">
          <p className="text-gray-600 text-sm">Kuchezaana</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">{inactiveCount}</p>
          <p className="text-xs text-gray-500 mt-1">Hawakatikika</p>
        </div>

        <div className="card">
          <p className="text-gray-600 text-sm">Jumla ya Malipo</p>
          <p className="text-3xl font-bold text-red-600 mt-2">
            TZS {(totalPayroll / 1000000).toFixed(1)}M
          </p>
          <p className="text-xs text-gray-500 mt-1">Kwa mwezi</p>
        </div>
      </div>

      {/* Add Employee Form */}
      {showForm && (
        <div className="card bg-blue-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ongeza Mfanyakazi Mpya</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Jina Kamili" className="form-input" />
            <select className="form-input">
              <option value="">-- Chagua Jukumu --</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>

            <input type="tel" placeholder="Simu" className="form-input" />
            <input type="email" placeholder="Barua Pepe" className="form-input" />

            <select className="form-input">
              <option value="">-- Chagua Idara --</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            <input type="number" placeholder="Mshahara (TZS)" className="form-input" />

            <input type="date" placeholder="Tarehe ya Kuajiriwa" className="form-input" />
            <select className="form-input">
              <option value="active">Kazi</option>
              <option value="inactive">Hakatikika</option>
            </select>

            <div className="md:col-span-2 flex gap-2">
              <button className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold">
                Hifadhi Mfanyakazi
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition font-semibold"
              >
                Kataa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Tafuta jina, simu, au email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
          />
        </div>

        <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="form-input md:w-48">
          <option value="all">-- Idara Zote --</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="form-input md:w-40">
          <option value="all">-- Hali Zote --</option>
          <option value="active">Kazi</option>
          <option value="inactive">Hakatikika</option>
        </select>
      </div>

      {/* Employees Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Jina</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Jukumu</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Idara</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Simu & Email</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Mshahara</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Hali</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Vitendo</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-900">{emp.name}</td>
                  <td className="px-4 py-3 text-gray-600 text-sm">{emp.role}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                      {emp.department}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1 mb-1">
                      <Phone size={14} className="text-gray-500" />
                      {emp.phone}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Mail size={12} className="text-gray-500" />
                      {emp.email}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900">
                    TZS {(emp.salary / 1000000).toFixed(2)}M
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        emp.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {emp.status === "active" ? "✅ Kazi" : "⏸️ Hakatikika"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-100 rounded transition">
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteEmployee(emp.id)}
                        className="text-red-600 hover:text-red-800 p-1 hover:bg-red-100 rounded transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEmployees.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Users size={32} className="mx-auto mb-2 opacity-50" />
            <p>Hakuna wafanyakazi wanaolingana na hiari yako</p>
          </div>
        )}
      </div>

      {/* Payroll Summary */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Muhtasari wa Malipo</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-gray-600 mb-1">Wastani wa Mshahara</p>
            <p className="text-2xl font-bold text-green-600">
              TZS {Math.round(totalPayroll / employees.length / 1000).toLocaleString()}K
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Jumla ya Malipo (Mwezi)</p>
            <p className="text-2xl font-bold text-blue-600">
              TZS {(totalPayroll / 1000000).toFixed(1)}M
            </p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <p className="text-sm text-gray-600 mb-1">Wastani kwa Kila Kama</p>
            <p className="text-2xl font-bold text-purple-600">
              TZS {Math.round((totalPayroll / employees.length) / 4 / 1000).toLocaleString()}K
            </p>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="card bg-yellow-50 border-l-4 border-yellow-500">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-yellow-600 flex-shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-semibold text-gray-900">Tukio Ijayo</h3>
            <ul className="text-sm text-gray-700 mt-2 space-y-1">
              <li>• Ahmed Hassan - Mwezi wa Kazi wa Miezi 6 (2024-02-15)</li>
              <li>• Zainab Mohamed - Kuzaliwa (2024-02-22)</li>
              <li>• John Kipchoge - Likizo ya Kuzaliwa (2024-03-10)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
