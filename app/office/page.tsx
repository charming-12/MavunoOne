"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";
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

  const recentActivity = salesQuery.data?.slice(0, 5) ?? [];
  const trackedProducts = lowStockQuery.data ?? [];

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

      {/* Main KPI Cards - Real Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Sales - Market Image */}
        <Link href="/office/sales">
          <div className="relative h-48 rounded-lg overflow-hidden group cursor-pointer hover:shadow-2xl transition">
            <Image
              src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop"
              alt="Mauzo ya Leo"
              fill
              className="object-cover group-hover:scale-110 transition duration-300"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition"></div>
            <div className="absolute inset-0 p-4 flex flex-col justify-end">
              <p className="text-xs text-gray-300 font-medium">Mauzo ya Leo</p>
              <p className="text-2xl font-bold text-white">TZS {(stats.todaySalesTotal / 1000000).toFixed(2)}M</p>
              <p className="text-xs text-gray-200">{stats.todaySalesCount} makali</p>
            </div>
          </div>
        </Link>

        {/* Low Stock Alert - Warehouse Image */}
        <Link href="/office/products">
          <div className="relative h-48 rounded-lg overflow-hidden group cursor-pointer hover:shadow-2xl transition">
            <Image
              src="https://images.unsplash.com/photo-1586528946e3-b5e3d1ba4908?w=600&h=400&fit=crop"
              alt="Stock za Chini"
              fill
              className="object-cover group-hover:scale-110 transition duration-300"
            />
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/60 transition"></div>
            <div className="absolute inset-0 p-4 flex flex-col justify-end">
              <p className="text-xs text-gray-300 font-medium">Stock za Chini</p>
              <p className="text-2xl font-bold text-white">{stats.lowStockCount}</p>
              <p className="text-xs text-gray-200">Bidhaa za kubaini</p>
            </div>
          </div>
        </Link>

        {/* Customer Debt - Finance Image */}
        <Link href="/office/debt">
          <div className="relative h-48 rounded-lg overflow-hidden group cursor-pointer hover:shadow-2xl transition">
            <Image
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop"
              alt="Madeni ya Wateja"
              fill
              className="object-cover group-hover:scale-110 transition duration-300"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition"></div>
            <div className="absolute inset-0 p-4 flex flex-col justify-end">
              <p className="text-xs text-gray-300 font-medium">Madeni ya Wateja</p>
              <p className="text-2xl font-bold text-white">TZS {(stats.totalCustomerDebt / 1000000).toFixed(2)}M</p>
              <p className="text-xs text-gray-200">Yanahitaji kufuatiliwa</p>
            </div>
          </div>
        </Link>

        {/* Weekly Average - Analytics Image */}
        <div className="relative h-48 rounded-lg overflow-hidden group cursor-pointer hover:shadow-2xl transition">
          <Image
            src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=600&h=400&fit=crop"
            alt="Wastani wa Juma"
            fill
            className="object-cover group-hover:scale-110 transition duration-300"
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition"></div>
          <div className="absolute inset-0 p-4 flex flex-col justify-end">
            <p className="text-xs text-gray-300 font-medium">Wastani wa Juma</p>
            <p className="text-2xl font-bold text-white">{trackedProducts.length}</p>
            <p className="text-xs text-gray-200">Bidhaa zinazohitaji kufuatiliwa</p>
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
                💰
                Mauzo Mapya (POS)
              </button>
            </Link>
            <Link href="/office/stock-in">
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2">
                📦
                Jaza Stock
              </button>
            </Link>
            <Link href="/office/customers">
              <button className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition font-semibold flex items-center justify-center gap-2">
                👥
                Mteja Mpya
              </button>
            </Link>
            <Link href="/office/deliveries">
              <button className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold flex items-center justify-center gap-2">
                🚚
                Uwasilishaji
              </button>
            </Link>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="lg:col-span-2 card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bidhaa za Kuzunguka</h3>
          <div className="space-y-3">
            {trackedProducts.length ? trackedProducts.slice(0, 5).map((product) => (
              <div key={product.id} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                <div className="flex-1"><p className="font-medium text-gray-900">{product.name}</p><p className="text-xs text-gray-600">Stock {Number(product.currentStock ?? 0).toLocaleString()} {product.unit}</p></div>
                <div className="text-right"><p className="font-bold text-amber-600">Reorder</p><p className="text-xs text-gray-500">Threshold {Number(product.lowStockThreshold ?? 0).toLocaleString()}</p></div>
              </div>
            )) : <p className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700">Hakuna bidhaa inayohitaji kufuatiliwa sasa.</p>}
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
