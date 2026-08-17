"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Download, Calendar } from "lucide-react";

interface SalesReport {
  date: string;
  totalSales: number;
  totalExpenses: number;
  profit: number;
  transactions: number;
  topProduct: string;
}

interface AnalyticsData {
  period: string;
  reports: SalesReport[];
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    averageTransaction: number;
    topProducts: Array<{ name: string; count: number; revenue: number }>;
    customerCount: number;
  };
}

export default function AdvancedAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [dateRange, setDateRange] = useState({ from: "2024-01-01", to: "2024-01-31" });
  const [exportFormat, setExportFormat] = useState<"csv" | "json" | "pdf">("csv");

  useEffect(() => {
    const doFetch = async () => {
      try {
        const response = await fetch(
          `/api/analytics?from=${dateRange.from}&to=${dateRange.to}`
        );
        const data = await response.json();
        setAnalytics(data);
      } catch (error) {
        console.error("Analytics fetch failed:", error);
      }
    };
    void doFetch();
  }, [dateRange]);

  const handleExport = async () => {
    if (!analytics) return;

    try {
      const response = await fetch("/api/analytics/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: analytics,
          format: exportFormat,
          period: dateRange,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `analytics-${dateRange.from}-${dateRange.to}.${exportFormat}`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  if (!analytics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            📊
            Uchambuzi Mkali
          </h1>
        </div>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">Inapakia data...</p>
        </div>
      </div>
    );
  }

  const profitMargin =
    analytics.summary.totalRevenue > 0
      ? ((analytics.summary.netProfit / analytics.summary.totalRevenue) * 100).toFixed(1)
      : "0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            📊
            Uchambuzi Mkali
          </h1>
          <p className="text-gray-600 mt-2">Ripoti kamiliki: mauzo, faida, na mifumo ya mauzo</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-gray-600" />
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-600">-</span>
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as "csv" | "json" | "pdf")}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
            <option value="pdf">PDF</option>
          </select>
          <button
            onClick={handleExport}
            className="px-4 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2 transition text-sm"
          >
            <Download size={16} />
            Inua
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales Card */}
        <div className="relative h-40 rounded-lg overflow-hidden group cursor-pointer hover:shadow-xl transition">
          <Image
            src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop"
            alt="Jumla ya Mauzo"
            fill
            className="object-cover group-hover:scale-110 transition duration-300"
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition"></div>
          <div className="absolute inset-0 p-4 flex flex-col justify-end">
            <p className="text-xs text-gray-300 font-medium">Jumla ya Mauzo</p>
            <p className="text-2xl font-bold text-white">TZS {(analytics.summary.totalRevenue / 1000000).toFixed(2)}M</p>
            <p className="text-xs text-gray-200">Jumla ya kipindi kilicho chaguliwa</p>
          </div>
        </div>

        {/* Total Expenses Card */}
        <div className="relative h-40 rounded-lg overflow-hidden group cursor-pointer hover:shadow-xl transition">
          <Image
            src="https://images.unsplash.com/photo-1586528946e3-b5e3d1ba4908?w=600&h=400&fit=crop"
            alt="Jumla ya Matumizi"
            fill
            className="object-cover group-hover:scale-110 transition duration-300"
          />
          <div className="absolute inset-0 bg-black/50 group-hover:bg-black/60 transition"></div>
          <div className="absolute inset-0 p-4 flex flex-col justify-end">
            <p className="text-xs text-gray-300 font-medium">Jumla ya Matumizi</p>
            <p className="text-2xl font-bold text-white">TZS {(analytics.summary.totalExpenses / 1000000).toFixed(2)}M</p>
            <p className="text-xs text-gray-200">Gharama za uendeshaji</p>
          </div>
        </div>

        {/* Net Profit Card */}
        <div className="relative h-40 rounded-lg overflow-hidden group cursor-pointer hover:shadow-xl transition">
          <Image
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop"
            alt="Faida ya Wavu"
            fill
            className="object-cover group-hover:scale-110 transition duration-300"
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition"></div>
          <div className="absolute inset-0 p-4 flex flex-col justify-end">
            <p className="text-xs text-gray-300 font-medium">Faida ya Wavu</p>
            <p className="text-2xl font-bold text-white">TZS {(analytics.summary.netProfit / 1000000).toFixed(2)}M</p>
            <p className="text-xs text-gray-200">Ukingo wa faida: {profitMargin}%</p>
          </div>
        </div>

        {/* Average Transaction Card */}
        <div className="relative h-40 rounded-lg overflow-hidden group cursor-pointer hover:shadow-xl transition">
          <Image
            src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=600&h=400&fit=crop"
            alt="Wastani ya Muamala"
            fill
            className="object-cover group-hover:scale-110 transition duration-300"
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition"></div>
          <div className="absolute inset-0 p-4 flex flex-col justify-end">
            <p className="text-xs text-gray-300 font-medium">Wastani ya Muamala</p>
            <p className="text-2xl font-bold text-white">TZS {analytics.summary.averageTransaction.toLocaleString()}</p>
            <p className="text-xs text-gray-200">Kwa kila muamala</p>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Bidhaa za Juu</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Jina</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Idadi ya Mauzo</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Jumla ya Mauzo</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Asilimia</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {analytics.summary.topProducts.map((product, idx) => {
                const percentage =
                  analytics.summary.totalRevenue > 0
                    ? ((product.revenue / analytics.summary.totalRevenue) * 100).toFixed(1)
                    : "0";
                return (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.count}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      TZS {(product.revenue / 1000000).toFixed(2)}M
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="font-medium text-gray-900">{percentage}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Daily Breakdown */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Kwa Kila Siku</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tarehe</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Mauzo</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Matumizi</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Faida</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Muamala</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {analytics.reports.map((report, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{report.date}</td>
                  <td className="px-6 py-4 text-sm text-green-600 font-medium">
                    TZS {(report.totalSales / 1000).toFixed(1)}K
                  </td>
                  <td className="px-6 py-4 text-sm text-orange-600 font-medium">
                    TZS {(report.totalExpenses / 1000).toFixed(1)}K
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <span
                      className={
                        report.profit > 0
                          ? "text-blue-600"
                          : "text-red-600"
                      }
                    >
                      TZS {(report.profit / 1000).toFixed(1)}K
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{report.transactions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
