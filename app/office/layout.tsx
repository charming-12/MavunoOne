"use client";

import Link from "next/link";
import {
  LayoutDashboard, ShoppingCart, History, Package,
  ArrowDownToLine, ArrowUpFromLine, Users, Cog,
  Truck, Receipt, Settings, FileBarChart, Bell, Camera, Zap, DollarSign,
  BarChart3, Settings2, Rocket
} from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";

const sidebarItems = [
  { href: "/office", label: "Dashboard", icon: LayoutDashboard, group: "Main" },
  { href: "/office/pos", label: "POS (Mauzo)", icon: ShoppingCart, group: "Sales" },
  { href: "/office/sales", label: "Historia ya Mauzo", icon: History, group: "Sales" },
  { href: "/office/products", label: "Bidhaa", icon: Package, group: "Inventory" },
  { href: "/office/stock-in", label: "Stock In", icon: ArrowDownToLine, group: "Inventory" },
  { href: "/office/stock-out", label: "Stock Out", icon: ArrowUpFromLine, group: "Inventory" },
  { href: "/office/inventory-analytics", label: "Uchambuzi wa Hesabu", icon: FileBarChart, group: "Inventory" },
  { href: "/office/customers", label: "Wateja", icon: Users, group: "Operations" },
  { href: "/office/debt", label: "Deni la Wateja", icon: DollarSign, group: "Operations" },
  { href: "/office/farmers", label: "Wakulima", icon: Users, group: "Operations" },
  { href: "/office/employees", label: "Wafanyakazi", icon: Users, group: "Operations" },
  { href: "/office/machines", label: "Mashine", icon: Zap, group: "Operations" },
  { href: "/office/vehicles", label: "Magari", icon: Truck, group: "Operations" },
  { href: "/office/cameras", label: "Kamera", icon: Camera, group: "Security" },
  { href: "/office/deliveries", label: "Uwasilishaji", icon: Truck, group: "Operations" },
  { href: "/office/expenses", label: "Gharama", icon: Receipt, group: "Finance" },
  { href: "/office/closures", label: "Kufunga Siku", icon: Cog, group: "Finance" },
  { href: "/office/reports", label: "Ripoti", icon: FileBarChart, group: "Reports" },
  { href: "/office/advanced-analytics", label: "Uchambuzi Mkali", icon: BarChart3, group: "Reports" },
  { href: "/office/hardware", label: "Vifaa vya Mtandao", icon: Settings2, group: "Advanced" },
  { href: "/office/setup-wizard", label: "Mkutano wa Sanidi", icon: Rocket, group: "Advanced" },
  { href: "/office/notifications", label: "Arifa", icon: Bell, group: "System" },
  { href: "/office/settings", label: "Settings", icon: Settings, group: "System" },
];

// Group items by category
const groupedItems = sidebarItems.reduce(
  (acc, item) => {
    const group = item.group || "Other";
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  },
  {} as Record<string, typeof sidebarItems>
);

export default function OfficeLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={["admin", "manager", "cashier", "storekeeper", "machine_operator"]}>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className="w-64 bg-gradient-to-b from-green-800 to-green-900 text-white p-6 fixed h-screen overflow-y-auto shadow-xl">
          {/* Logo */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">🌾 MavunoOne</h2>
            <p className="text-green-200 text-xs mt-1">Biashara Hub</p>
          </div>

          {/* Navigation */}
          <nav className="space-y-6">
            {Object.entries(groupedItems).map(([group, items]) => (
              <div key={group}>
                <p className="text-green-300 text-xs font-semibold uppercase tracking-wider mb-3">
                  {group}
                </p>
                <div className="space-y-1">
                  {items.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-green-50 hover:bg-white hover:bg-opacity-20 transition-all duration-200 hover:translate-x-0.5 group"
                    >
                      <Icon size={18} className="flex-shrink-0 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium">{label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-green-700">
            <p className="text-green-300 text-xs">
              © 2024 MavunoOne - All Rights Reserved
            </p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="ml-64 flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}
