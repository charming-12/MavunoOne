"use client";

import Image from "next/image";
import { trpc } from "@/lib/trpc";

export default function BossDashboard() {
  const dashboardQuery = trpc.dashboard.stats.useQuery();
  const lowStockQuery = trpc.products.lowStock.useQuery();
  const salesQuery = trpc.sales.list.useQuery();

  const stats = {
    todaySalesTotal: Number(dashboardQuery.data?.todaySalesTotal ?? 0),
    todaySalesCount: Number(dashboardQuery.data?.todaySalesCount ?? 0),
    lowStockCount: Number(lowStockQuery.data?.length ?? 0),
    totalCustomerDebt: Number(dashboardQuery.data?.totalCustomerDebt ?? 0),
  };

  const recentActivity = salesQuery.data?.slice(0, 3) ?? [
    { invoiceNumber: "INV-0000", totalAmount: 450000 },
    { invoiceNumber: "Kujaza Stock", totalAmount: 0 },
    { invoiceNumber: "Delivery", totalAmount: 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-800 text-white p-4">
        <h1 className="text-lg font-bold">MavunoOne — Boss</h1>
        <p className="text-sm opacity-80">Karibu, Mzee Kisiri 👋</p>
      </header>

      <main className="p-4 space-y-4">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Today's Sales Card */}
          <a href="/boss/sales" className="block">
            <div className="relative h-40 rounded-lg overflow-hidden group cursor-pointer hover:shadow-xl transition">
              <Image
                src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop"
                alt="Mauzo ya Leo"
                fill
                className="object-cover group-hover:scale-110 transition duration-300"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition"></div>
              <div className="absolute inset-0 p-4 flex flex-col justify-end">
                <p className="text-xs text-gray-300">Mauzo ya Leo</p>
                <p className="text-2xl font-bold text-white">TZS {(stats.todaySalesTotal || 0).toLocaleString()}</p>
                <p className="text-xs text-gray-200">{stats.todaySalesCount} mauzo</p>
              </div>
            </div>
          </a>

          {/* Low Stock Alert */}
          <a href="/boss/stock" className="block">
            <div className="relative h-40 rounded-lg overflow-hidden group cursor-pointer hover:shadow-xl transition">
              <Image
                src="https://images.unsplash.com/photo-1586528946e3-b5e3d1ba4908?w=600&h=400&fit=crop"
                alt="Stock za Chini"
                fill
                className="object-cover group-hover:scale-110 transition duration-300"
              />
              <div className="absolute inset-0 bg-black/50 group-hover:bg-black/60 transition"></div>
              <div className="absolute inset-0 p-4 flex flex-col justify-end">
                <p className="text-xs text-gray-300">Stock za Chini</p>
                <p className="text-2xl font-bold text-white">{stats.lowStockCount}</p>
                <p className="text-xs text-gray-200">Zinahitaji kujazwa</p>
              </div>
            </div>
          </a>

          {/* Customer Debt */}
          <a href="/boss/sales" className="block">
            <div className="relative h-40 rounded-lg overflow-hidden group cursor-pointer hover:shadow-xl transition">
              <Image
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop"
                alt="Madeni ya Wateja"
                fill
                className="object-cover group-hover:scale-110 transition duration-300"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition"></div>
              <div className="absolute inset-0 p-4 flex flex-col justify-end">
                <p className="text-xs text-gray-300">Madeni ya Wateja</p>
                <p className="text-2xl font-bold text-white">TZS {(stats.totalCustomerDebt || 0).toLocaleString()}</p>
                <p className="text-xs text-gray-200">Yanahitaji kufuatiliwa</p>
              </div>
            </div>
          </a>

          {/* Active Vehicles */}
          <a href="/boss/vehicles" className="block">
            <div className="relative h-40 rounded-lg overflow-hidden group cursor-pointer hover:shadow-xl transition">
              <Image
                src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop"
                alt="Magari Yanayotembea"
                fill
                className="object-cover group-hover:scale-110 transition duration-300"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition"></div>
              <div className="absolute inset-0 p-4 flex flex-col justify-end">
                <p className="text-xs text-gray-300">Magari Yanayotembea</p>
                <p className="text-2xl font-bold text-white">2</p>
                <p className="text-xs text-gray-200">Sasa hivi</p>
              </div>
            </div>
          </a>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-gray-900 mb-3">Shughuli za Hivi Karibuni</h3>
          <div className="space-y-3">
            {recentActivity.map((item, index) => (
              <div key={`${item.invoiceNumber ?? "activity"}-${index}`} className="flex items-start gap-3 py-2 border-b last:border-b-0 last:pb-0">
                <div className="text-green-600 flex-shrink-0 mt-1 text-lg">📊</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.invoiceNumber ?? "Kazi ya Biashara"}</p>
                  <p className="text-xs text-gray-600">
                    {item.totalAmount ? `Mauzo ya TZS ${Number(item.totalAmount).toLocaleString()}` : "Hali ya shughuli"}
                  </p>
                  <p className={item.totalAmount ? "text-xs text-green-600 mt-1" : "text-xs text-blue-600 mt-1"}>
                    {item.totalAmount ? `+${Number(item.totalAmount).toLocaleString()} TZS` : "Inafuatiliwa"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
