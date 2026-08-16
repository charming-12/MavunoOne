"use client";

import { TrendingUp, AlertTriangle, Users, Truck } from "lucide-react";
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
        {/* Today's Sales Card */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Mauzo ya Leo</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                TZS {(stats.todaySalesTotal || 0).toLocaleString()}
              </p>
              <p className="text-gray-500 text-xs mt-1">{stats.todaySalesCount} mauzo</p>
            </div>
            <TrendingUp className="text-green-600" size={40} />
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Stock za Chini</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.lowStockCount}
              </p>
              <p className="text-gray-500 text-xs mt-1">Zinahitaji kujazwa</p>
            </div>
            <AlertTriangle className="text-yellow-600" size={40} />
          </div>
        </div>

        {/* Customer Debt */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Madeni ya Wateja</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                TZS {(stats.totalCustomerDebt || 0).toLocaleString()}
              </p>
              <p className="text-gray-500 text-xs mt-1">Yanahitaji kufuatiliwa</p>
            </div>
            <Users className="text-red-600" size={40} />
          </div>
        </div>

        {/* Active Vehicles */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Magari Yanayotembea</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">2</p>
              <p className="text-gray-500 text-xs mt-1">Sasa hivi</p>
            </div>
            <Truck className="text-blue-600" size={40} />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-gray-900 mb-3">Shughuli za Hivi Karibuni</h3>
          <div className="space-y-3">
            {recentActivity.map((item, index) => (
              <div key={`${item.invoiceNumber ?? "activity"}-${index}`} className="flex items-start gap-3 py-2 border-b last:border-b-0 last:pb-0">
                <TrendingUp className="text-green-600 flex-shrink-0 mt-1" size={16} />
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
