"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, ShoppingCart, History, Package,
  ArrowDownToLine, ArrowUpFromLine, Users, Cog,
  Truck, Receipt, Settings, FileBarChart, Bell, Camera, Zap, DollarSign,
  BarChart3, Settings2, Rocket
} from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { clearStoredUser } from "@/lib/auth";

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
  const router = useRouter();

  return (
    <AuthGuard allowedRoles={["admin", "owner", "manager", "cashier", "storekeeper", "machine_operator"]}>
      <div className="flex min-h-screen bg-[#07150f]">
        {/* Sidebar */}
        <aside className="w-64 bg-gradient-to-b from-[#0a1e18] to-[#051511] text-white p-6 fixed h-screen overflow-y-auto shadow-2xl border-r border-emerald-900/30">
          {/* Logo */}
          <div className="mb-8 pb-4 border-b border-emerald-900/40">
            <h2 className="text-2xl font-black text-white">🌾 MavunoOne</h2>
            <p className="text-emerald-300 text-xs mt-2 font-semibold uppercase tracking-wider">Operations Hub</p>
          </div>

          {/* Navigation */}
          <nav className="space-y-6">
            {Object.entries(groupedItems).map(([group, items]) => (
              <div key={group}>
                <p className="text-amber-300 text-xs font-bold uppercase tracking-[0.25em] mb-3">
                  {group}
                </p>
                <div className="space-y-1">
                  {items.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-emerald-50 hover:bg-emerald-500/20 hover:border-l-2 hover:border-amber-400 hover:pl-2.5 transition-all duration-200 group"
                    >
                      <Icon size={18} className="flex-shrink-0 group-hover:text-amber-300 transition-colors" />
                      <span className="text-sm font-medium">{label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Logout Button */}
          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              clearStoredUser();
              router.push('/login');
            }}
            className="w-full mt-6 py-2.5 px-4 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-bold rounded-lg hover:from-red-500 hover:to-red-600 transition shadow-lg"
          >
            Toka Nje
          </button>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-emerald-900/40">
            <p className="text-emerald-300 text-xs font-semibold">
              © 2026 MavunoOne
            </p>
            <p className="text-emerald-500/70 text-xs mt-1">Premium Agribusiness Platform</p>
          </div>
        </aside>

        {/* Main Content */}
        <main className="ml-64 flex-1 p-8 overflow-auto bg-gradient-to-br from-[#07150f] to-[#0a1e18]">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}
