"use client";

import { BarChart3, TrendingUp, AlertTriangle } from "lucide-react";

// Mock daily data
const mockDailyData = [
  { date: "Jan 14", sales: 450000, expenses: 120000, profit: 330000 },
  { date: "Jan 15", sales: 520000, expenses: 140000, profit: 380000 },
  { date: "Jan 16", sales: 380000, expenses: 95000, profit: 285000 },
  { date: "Jan 17", sales: 610000, expenses: 180000, profit: 430000 },
  { date: "Jan 18", sales: 490000, expenses: 130000, profit: 360000 },
  { date: "Jan 19", sales: 720000, expenses: 200000, profit: 520000 },
  { date: "Jan 20", sales: 650000, expenses: 160000, profit: 490000 },
];

export default function ReportsPage() {
  const totalSales = mockDailyData.reduce((sum, d) => sum + d.sales, 0);
  const totalExpenses = mockDailyData.reduce((sum, d) => sum + d.expenses, 0);
  const totalProfit = totalSales - totalExpenses;

  const maxSales = Math.max(...mockDailyData.map((d) => d.sales));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="text-green-600" size={32} />
            Ripoti za Siku
          </h1>
          <p className="text-gray-600 mt-1">Muhtasari wa mauzo, matumizi, na faida</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-gradient-to-br from-green-50 to-green-100">
          <p className="text-gray-600 text-sm font-medium">Jumla ya Mauzo</p>
          <p className="text-4xl font-bold text-green-700 mt-2">
            TZS {(totalSales / 1000000).toFixed(2)}M
          </p>
          <p className="text-xs text-gray-600 mt-2">Katika siku {mockDailyData.length}</p>
        </div>

        <div className="card bg-gradient-to-br from-orange-50 to-orange-100">
          <p className="text-gray-600 text-sm font-medium">Jumla ya Matumizi</p>
          <p className="text-4xl font-bold text-orange-700 mt-2">
            TZS {(totalExpenses / 1000000).toFixed(2)}M
          </p>
          <p className="text-xs text-gray-600 mt-2">Gharama za sehemu</p>
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
          <p className="text-gray-600 text-sm font-medium">Jumla ya Faida</p>
          <p className="text-4xl font-bold text-blue-700 mt-2">
            TZS {(totalProfit / 1000000).toFixed(2)}M
          </p>
          <p className="text-xs text-gray-600 mt-2">Mauzo - Matumizi</p>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-6">Chati ya Mauzo (Siku 7 Zilizopita)</h2>
        <div className="flex items-end gap-2 h-64">
          {mockDailyData.map((day, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div
                className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg transition hover:opacity-80"
                style={{
                  height: `${(day.sales / maxSales) * 100}%`,
                }}
                title={`${day.date}: TZS ${(day.sales / 1000).toFixed(0)}K`}
              />
              <span className="text-xs font-medium text-gray-700 text-center">
                {day.date.split(" ")[1]}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-4 text-center">Urefu = Bei ya Mauzo</p>
      </div>

      {/* Profit Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Daily Breakdown */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-green-600" />
            Muhtasari wa Kila Siku
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {mockDailyData.map((day, index) => (
              <div key={index} className="pb-3 border-b last:border-b-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">{day.date}</span>
                  <span className="text-sm font-semibold text-green-600">
                    TZS {(day.profit / 1000).toFixed(0)}K
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-green-50 p-2 rounded">
                    <p className="text-gray-600">Mauzo</p>
                    <p className="font-semibold text-green-700">
                      {(day.sales / 1000).toFixed(0)}K
                    </p>
                  </div>
                  <div className="bg-orange-50 p-2 rounded">
                    <p className="text-gray-600">Matumizi</p>
                    <p className="font-semibold text-orange-700">
                      {(day.expenses / 1000).toFixed(0)}K
                    </p>
                  </div>
                  <div className="bg-blue-50 p-2 rounded">
                    <p className="text-gray-600">Faida %</p>
                    <p className="font-semibold text-blue-700">
                      {((day.profit / day.sales) * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Takwimu za Jumla</h2>
          <div className="space-y-4">
            {/* Average Daily Sales */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
              <p className="text-sm text-gray-700">Wastani wa Mauzo kwa Siku</p>
              <p className="text-2xl font-bold text-green-700 mt-1">
                TZS {(totalSales / mockDailyData.length / 1000).toFixed(0)}K
              </p>
            </div>

            {/* Average Daily Expenses */}
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg">
              <p className="text-sm text-gray-700">Wastani wa Matumizi kwa Siku</p>
              <p className="text-2xl font-bold text-orange-700 mt-1">
                TZS {(totalExpenses / mockDailyData.length / 1000).toFixed(0)}K
              </p>
            </div>

            {/* Profit Margin */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
              <p className="text-sm text-gray-700">Asilimia ya Faida (Margin)</p>
              <p className="text-2xl font-bold text-blue-700 mt-1">
                {((totalProfit / totalSales) * 100).toFixed(1)}%
              </p>
            </div>

            {/* Best Day */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
              <p className="text-sm text-gray-700">Siku ya Faida Kubwa</p>
              <p className="text-2xl font-bold text-purple-700 mt-1">
                {mockDailyData.reduce((max, d) => (d.profit > max.profit ? d : max)).date}
              </p>
              <p className="text-xs text-purple-600 mt-1">
                TZS{" "}
                {(
                  mockDailyData.reduce((max, d) => (d.profit > max.profit ? d : max))
                    .profit / 1000
                ).toFixed(0)}
                K
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div className="card border-l-4 border-orange-500 bg-orange-50">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="text-orange-600" size={24} />
          <h2 className="text-lg font-semibold text-orange-900">Stock za Chini</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white p-3 rounded border-l-2 border-red-500">
            <p className="text-sm text-gray-600">Mahindi</p>
            <p className="text-lg font-bold text-red-600">45 kg</p>
            <p className="text-xs text-gray-500">Chini ya 100 kg</p>
          </div>
          <div className="bg-white p-3 rounded border-l-2 border-yellow-500">
            <p className="text-sm text-gray-600">Unga wa Mahindi</p>
            <p className="text-lg font-bold text-yellow-600">78 kg</p>
            <p className="text-xs text-gray-500">Karibu na kiingilio</p>
          </div>
          <div className="bg-white p-3 rounded border-l-2 border-green-500">
            <p className="text-sm text-gray-600">Alizee</p>
            <p className="text-lg font-bold text-green-600">234 kg</p>
            <p className="text-xs text-gray-500">Poa</p>
          </div>
        </div>
      </div>

      {/* Download Report */}
      <div className="flex gap-3 justify-end">
        <button className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold">
          Download PDF
        </button>
        <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold">
          Chapisha
        </button>
      </div>
    </div>
  );
}
