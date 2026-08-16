"use client";

import { Loader2, TrendingUp, AlertTriangle, Users, DollarSign, Package, Clock, Target } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Link from "next/link";

export default function OfficeDashboard() {
  const dashboardQuery = trpc.dashboard.stats.useQuery();
  const lowStockQuery = trpc.products.lowStock.useQuery();
  const salesQuery = trpc.sales.list.useQuery();

  const stats = {
    todaySalesTotal: Number(dashboardQuery.data?.todaySalesTotal ?? 0),
    todaySalesCount: Number(dashboardQuery.data?.todaySalesCount ?? 0),
    lowStockCount: Number(lowStockQuery.data?.length ?? 0),
    totalCustomerDebt: Number(dashboardQuery.data?.totalCustomerDebt ?? 0),
  };

  const recentActivity = salesQuery.data?.slice(0, 5) ?? [
    { invoiceNumber: "INV-0000", totalAmount: 450000, status: "Mock" },
    { invoiceNumber: "Kujaza Stock", totalAmount: 0, status: "Stock" },
    { invoiceNumber: "Mashine", totalAmount: 0, status: "Completed" },
  ];

  // Mock data for enhanced analytics
  const dailyTarget = 1000000;
  const weeklyAverage = 650000;
  const topProducts = [
    { name: "Mahindi", sales: 2500, revenue: 6250000 },
    { name: "Unga wa Mahindi", sales: 1800, revenue: 5400000 },
    { name: "Alizee", sales: 450, revenue: 2025000 },
  ];

  const salesProgress = (stats.todaySalesTotal / dailyTarget) * 100;

  if (dashboardQuery.isLoading || lowStockQuery.isLoading || salesQuery.isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center gap-3 text-gray-600">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Date */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard ya Leo</h1>
          <p className="text-gray-600 mt-1">{new Date().toLocaleDateString("sw-TZ", { weekday: "long", month: "long", day: "numeric" })}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Saa: {new Date().toLocaleTimeString("sw-TZ")}</p>
        </div>
      </div>

      {/* Main KPI Cards - 4 Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Sales */}
        <div className="card border-l-4 border-green-600 bg-gradient-to-br from-green-50 to-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Mauzo ya Leo</p>
              <p className="text-3xl font-bold text-green-700 mt-2">
                TZS {(stats.todaySalesTotal / 1000000).toFixed(2)}M
              </p>
              <p className="text-xs text-gray-500 mt-1">{stats.todaySalesCount} makali</p>
            </div>
            <TrendingUp className="text-green-200" size={40} />
          </div>
          {/* Progress Bar */}
          <div className="mt-3 bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(salesProgress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Target: TZS {(dailyTarget / 1000000).toFixed(1)}M ({Math.round(salesProgress)}%)</p>
        </div>

        {/* Low Stock Alert */}
        <div className="card border-l-4 border-orange-600 bg-gradient-to-br from-orange-50 to-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Stock za Chini</p>
              <p className="text-3xl font-bold text-orange-700 mt-2">
                {stats.lowStockCount}
              </p>
              <p className="text-xs text-gray-500 mt-1">Bidhaa za kubaini</p>
            </div>
            <AlertTriangle className="text-orange-200" size={40} />
          </div>
          <Link href="/office/products">
            <button className="mt-3 w-full text-xs bg-orange-100 text-orange-700 py-1 rounded hover:bg-orange-200 transition font-semibold">
              Angalia Stock
            </button>
          </Link>
        </div>

        {/* Customer Debt */}
        <div className="card border-l-4 border-red-600 bg-gradient-to-br from-red-50 to-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Madeni ya Wateja</p>
              <p className="text-3xl font-bold text-red-700 mt-2">
                TZS {(stats.totalCustomerDebt / 1000000).toFixed(2)}M
              </p>
              <p className="text-xs text-gray-500 mt-1">Yanahitaji kufuatiliwa</p>
            </div>
            <DollarSign className="text-red-200" size={40} />
          </div>
          <Link href="/office/debt">
            <button className="mt-3 w-full text-xs bg-red-100 text-red-700 py-1 rounded hover:bg-red-200 transition font-semibold">
              Malipo Sasa
            </button>
          </Link>
        </div>

        {/* Weekly Average */}
        <div className="card border-l-4 border-blue-600 bg-gradient-to-br from-blue-50 to-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Wastani wa Juma</p>
              <p className="text-3xl font-bold text-blue-700 mt-2">
                TZS {(weeklyAverage / 1000000).toFixed(2)}M
              </p>
              <p className="text-xs text-gray-500 mt-1">Siku 7 zilizopita</p>
            </div>
            <Target className="text-blue-200" size={40} />
          </div>
        </div>
      </div>

      {/* Two Column Section - Quick Actions & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Vitendo Vya Haraka</h3>
          <div className="space-y-2">
            <Link href="/office/pos">
              <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2">
                <DollarSign size={18} />
                Mauzo Mapya (POS)
              </button>
            </Link>
            <Link href="/office/stock-in">
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2">
                <Package size={18} />
                Jaza Stock
              </button>
            </Link>
            <Link href="/office/customers">
              <button className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-semibold flex items-center justify-center gap-2">
                <Users size={18} />
                Mteja Mpya
              </button>
            </Link>
            <Link href="/office/deliveries">
              <button className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold flex items-center justify-center gap-2">
                <Clock size={18} />
                Uwasilishaji
              </button>
            </Link>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="lg:col-span-2 card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bidhaa za Kuzunguka</h3>
          <div className="space-y-3">
            {topProducts.map((product, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-xs text-gray-600">{product.sales} vitengo</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">TZS {(product.revenue / 1000000).toFixed(2)}M</p>
                  <p className="text-xs text-gray-500">mapato</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity & Sales Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Activity */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Shughuli za Hivi Karibuni</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {recentActivity.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-gray-50 transition">
                <div>
                  <p className="font-medium text-gray-900">{item.invoiceNumber}</p>
                  <p className="text-xs text-gray-500">{item.status}</p>
                </div>
                <p className="font-bold text-green-600">TZS {(item.totalAmount).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sales Metrics */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Takwimu za Mauzo</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">Mnamo Saa Hii</p>
                <p className="text-sm font-bold text-gray-900">
                  {Math.round((stats.todaySalesTotal / stats.todaySalesCount) * (stats.todaySalesCount || 1) / 1000)}K avg
                </p>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: "72%" }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Wastani kwa Muzo</p>
                <p className="text-xl font-bold text-blue-600">
                  TZS {Math.round(stats.todaySalesTotal / Math.max(stats.todaySalesCount, 1) / 1000)}K
                </p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Jumla ya Makali</p>
                <p className="text-xl font-bold text-purple-600">{stats.todaySalesCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
