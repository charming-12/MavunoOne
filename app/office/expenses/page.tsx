"use client";

import { useState } from "react";
import { Receipt, AlertCircle, Plus, Trash2, Edit2, Calendar } from "lucide-react";

// Mock expense data
const mockExpenses = [
  { id: 1, category: "Electricity", amount: 450000, date: "2024-01-20", description: "Monthly power bill", recurring: true, vendor: "Tanzania Power" },
  { id: 2, category: "Transport", amount: 200000, date: "2024-01-20", description: "Fuel for delivery", recurring: false, vendor: "Petrol Station" },
  { id: 3, category: "Maintenance", amount: 150000, date: "2024-01-18", description: "Vehicle repair", recurring: false, vendor: "Garage XYZ" },
  { id: 4, category: "Rent", amount: 5000000, date: "2024-01-15", description: "Monthly rent", recurring: true, vendor: "Landlord" },
  { id: 5, category: "Supplies", amount: 350000, date: "2024-01-19", description: "Office supplies", recurring: false, vendor: "Supplies Store" },
  { id: 6, category: "Marketing", amount: 250000, date: "2024-01-17", description: "Radio ads", recurring: true, vendor: "Radio Station" },
  { id: 7, category: "Staff Salary", amount: 3000000, date: "2024-01-01", description: "Monthly salaries", recurring: true, vendor: "Payroll" },
];

const categories = ["Electricity", "Transport", "Maintenance", "Rent", "Supplies", "Staff Salary", "Marketing", "Insurance", "Training", "Other"];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState(mockExpenses);
  const [showForm, setShowForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  // Calculate metrics
  const monthlyTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
  const recurringTotal = expenses.filter((e) => e.recurring).reduce((sum, e) => sum + e.amount, 0);
  const largestExpense = expenses.length > 0 ? Math.max(...expenses.map((e) => e.amount)) : 0;
  const averageExpense = expenses.length > 0 ? Math.round(monthlyTotal / expenses.length) : 0;

  const categoryBreakdown = categories.map((cat) => {
    const categoryExpenses = expenses.filter((e) => e.category === cat);
    return {
      category: cat,
      amount: categoryExpenses.reduce((sum, e) => sum + e.amount, 0),
      count: categoryExpenses.length,
    };
  }).filter((c) => c.amount > 0);

  const filteredExpenses = expenses
    .filter((e) => filterCategory === "all" || e.category === filterCategory)
    .sort((a, b) => {
      if (sortBy === "date") return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === "amount") return b.amount - a.amount;
      if (sortBy === "category") return a.category.localeCompare(b.category);
      return 0;
    });

  const deleteExpense = (id: number) => {
    if (confirm("Taka kuondoa gharama?")) {
      setExpenses(expenses.filter((e) => e.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Receipt className="text-orange-600" size={32} />
            Gharama za Biashara
          </h1>
          <p className="text-gray-600 mt-1">Fuatilia na kufa taharrifu haji gharama</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold flex items-center gap-2"
        >
          <Plus size={20} />
          Gharama Mpya
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-gray-600 text-sm">Jumla ya Gharama</p>
          <p className="text-3xl font-bold text-red-600 mt-2">
            TZS {(monthlyTotal / 1000000).toFixed(2)}M
          </p>
          <p className="text-xs text-gray-500 mt-1">Mwezi huu</p>
        </div>

        <div className="card">
          <p className="text-gray-600 text-sm">Gharama Zinazorudia</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">
            TZS {(recurringTotal / 1000000).toFixed(2)}M
          </p>
          <p className="text-xs text-gray-500 mt-1">Kila mwezi</p>
        </div>

        <div className="card">
          <p className="text-gray-600 text-sm">Gharama Kubwa Zaidi</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            TZS {(largestExpense / 1000000).toFixed(2)}M
          </p>
          <p className="text-xs text-gray-500 mt-1">Katika orodha</p>
        </div>

        <div className="card">
          <p className="text-gray-600 text-sm">Wastani ya Gharama</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            TZS {(averageExpense / 1000).toLocaleString()}K
          </p>
          <p className="text-xs text-gray-500 mt-1">Kwa kila kaidi</p>
        </div>
      </div>

      {/* Add Expense Form */}
      {showForm && (
        <div className="card bg-green-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rekodi Gharama Mpya</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select className="form-input">
              <option value="">-- Chagua Kategori --</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <input type="number" placeholder="Kiasi (TZS)" className="form-input" />

            <input type="date" className="form-input" />

            <input type="text" placeholder="Jina la Muuzaji" className="form-input" />

            <textarea placeholder="Maelezo" className="form-input md:col-span-2" rows={3}></textarea>

            <label className="flex items-center gap-2">
              <input type="checkbox" className="form-checkbox" />
              <span className="text-sm text-gray-700">Gharama Zinazorudia?</span>
            </label>

            <div className="md:col-span-2 flex gap-2">
              <button className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold">
                Hifadhi Gharama
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

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gharama kwa Kategori</h3>
          <div className="space-y-3">
            {categoryBreakdown.map((cat) => (
              <div key={cat.category}>
                <div className="flex justify-between mb-1">
                  <p className="text-sm font-medium text-gray-700">{cat.category}</p>
                  <p className="text-sm font-bold text-gray-900">TZS {(cat.amount / 1000000).toFixed(2)}M</p>
                </div>
                <div className="bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-orange-400 to-red-500 h-3 rounded-full transition-all"
                    style={{ width: `${(cat.amount / monthlyTotal) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{cat.count} kaidi</p>
              </div>
            ))}
          </div>
        </div>

        {/* Budget vs Actual */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bajeti vs Halisi</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">Bajeti ya Mwezi</p>
                <p className="text-sm font-bold text-gray-900">TZS 8.0M</p>
              </div>
              <div className="bg-blue-100 rounded-full h-4">
                <div className="bg-blue-600 h-4 rounded-full" style={{ width: "100%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">Gharama Halisi</p>
                <p className="text-sm font-bold text-red-600">TZS {(monthlyTotal / 1000000).toFixed(2)}M</p>
              </div>
              <div className="bg-red-100 rounded-full h-4">
                <div className="bg-red-600 h-4 rounded-full" style={{ width: `${(monthlyTotal / 8000000) * 100}%` }} />
              </div>
            </div>

            <div className="pt-3 border-t">
              <div className="flex justify-between">
                <p className="text-sm font-medium text-gray-700">Iliyobaki</p>
                <p className={`text-sm font-bold ${8000000 - monthlyTotal >= 0 ? "text-green-600" : "text-red-600"}`}>
                  TZS {((8000000 - monthlyTotal) / 1000000).toFixed(2)}M
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div className="card flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="form-input"
          >
            <option value="all">-- Kategori Zote --</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="form-input md:w-48">
          <option value="date">Tarehe (Mpya Kwanza)</option>
          <option value="amount">Kiasi (Kubwa Kwanza)</option>
          <option value="category">Kategori</option>
        </select>
      </div>

      {/* Expenses Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Kategori</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Maelezo</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Muuzaji</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Tarehe</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Kiasi</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Rudia?</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Vitendo</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
                      {exp.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{exp.description}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{exp.vendor}</td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600">
                    <div className="flex items-center justify-center gap-1">
                      <Calendar size={14} className="text-gray-500" />
                      {new Date(exp.date).toLocaleDateString("sw-TZ")}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-red-600">
                    TZS {(exp.amount / 1000).toLocaleString()}K
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-sm font-semibold ${exp.recurring ? "text-green-600" : "text-gray-500"}`}>
                      {exp.recurring ? "✅ Ndiyo" : "❌ Hapana"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-100 rounded transition">
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteExpense(exp.id)}
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

        {filteredExpenses.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-gray-600">Hakuna gharama iliyorekodishwa</p>
          </div>
        )}
      </div>

      {/* Budget Alert */}
      {monthlyTotal > 7200000 && (
        <div className="card bg-red-50 border-l-4 border-red-600">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="font-semibold text-gray-900">Onyo wa Bajeti!</h3>
              <p className="text-sm text-gray-700 mt-1">
                Umekuwa na gharama kubwa sana! Umechelewa kwa {((monthlyTotal / 8000000 - 1) * 100).toFixed(0)}% juu ya bajeti.
              </p>
              <p className="text-sm text-gray-700 mt-2">
                Angalia gharama na fanya hatua za kupunguza.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
