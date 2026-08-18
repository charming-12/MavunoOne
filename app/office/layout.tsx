"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard, ShoppingCart, History, Package, ArrowLeft, ArrowDownToLine,
  ArrowUpFromLine, Users, Cog, Truck, Receipt, Settings, FileBarChart, Bell,
  Camera, Zap, DollarSign, BarChart3, Settings2, Rocket, Menu, X, UserRound,
} from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { clearStoredUser, readStoredUser, type AppUserRole } from "@/lib/auth";

type SidebarItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  group: string;
  roles: AppUserRole[];
};

const sidebarItems: SidebarItem[] = [
  { href: "/office", label: "Executive Overview", icon: LayoutDashboard, group: "Main", roles: ["admin", "owner", "manager", "cashier", "storekeeper", "machine_operator", "boss"] },
  { href: "/office/pos", label: "POS (Mauzo)", icon: ShoppingCart, group: "Sales", roles: ["admin", "owner", "manager", "cashier"] },
  { href: "/office/sales", label: "Historia ya Mauzo", icon: History, group: "Sales", roles: ["admin", "owner", "manager", "cashier"] },
  { href: "/office/products", label: "Bidhaa", icon: Package, group: "Inventory", roles: ["admin", "owner", "manager", "storekeeper"] },
  { href: "/office/stock-in", label: "Stock In", icon: ArrowDownToLine, group: "Inventory", roles: ["admin", "owner", "manager", "storekeeper"] },
  { href: "/office/stock-out", label: "Stock Out", icon: ArrowUpFromLine, group: "Inventory", roles: ["admin", "owner", "manager", "storekeeper"] },
  { href: "/office/inventory-analytics", label: "Uchambuzi wa Hesabu", icon: FileBarChart, group: "Inventory", roles: ["admin", "owner", "manager", "storekeeper"] },
  { href: "/office/customers", label: "Wateja", icon: Users, group: "Operations", roles: ["admin", "owner", "manager", "cashier", "boss"] },
  { href: "/office/debt", label: "Deni la Wateja", icon: DollarSign, group: "Operations", roles: ["admin", "owner", "manager", "boss"] },
  { href: "/office/farmers", label: "Wakulima", icon: Users, group: "Operations", roles: ["admin", "owner", "manager", "boss"] },
  { href: "/office/employees", label: "Wafanyakazi", icon: Users, group: "Operations", roles: ["admin", "owner", "boss"] },
  { href: "/office/machines", label: "Mashine", icon: Zap, group: "Operations", roles: ["admin", "owner", "manager", "machine_operator"] },
  { href: "/office/vehicles", label: "Magari", icon: Truck, group: "Operations", roles: ["admin", "owner", "manager", "boss"] },
  { href: "/office/cameras", label: "Kamera", icon: Camera, group: "Security", roles: ["admin", "owner", "manager", "boss"] },
  { href: "/office/deliveries", label: "Uwasilishaji", icon: Truck, group: "Operations", roles: ["admin", "owner", "manager", "boss"] },
  { href: "/office/expenses", label: "Gharama", icon: Receipt, group: "Finance", roles: ["admin", "owner", "manager"] },
  { href: "/office/closures", label: "Kufunga Siku", icon: Cog, group: "Finance", roles: ["admin", "owner", "manager", "cashier"] },
  { href: "/office/reports", label: "Ripoti", icon: FileBarChart, group: "Reports", roles: ["admin", "owner", "manager", "boss"] },
  { href: "/office/advanced-analytics", label: "Uchambuzi Mkali", icon: BarChart3, group: "Reports", roles: ["admin", "owner", "manager", "boss"] },
  { href: "/office/hardware", label: "Vifaa vya Mtandao", icon: Settings2, group: "Advanced", roles: ["admin", "owner"] },
  { href: "/office/setup-wizard", label: "Setup Wizard", icon: Rocket, group: "Advanced", roles: ["admin", "owner"] },
  { href: "/office/notifications", label: "Arifa", icon: Bell, group: "System", roles: ["admin", "owner", "manager", "cashier", "storekeeper", "machine_operator", "boss"] },
  { href: "/office/settings", label: "Settings", icon: Settings, group: "System", roles: ["admin", "owner"] },
];

const roleLabels: Record<string, string> = {
  admin: "Administrator",
  owner: "Owner",
  manager: "Operations Manager",
  cashier: "Cashier",
  storekeeper: "Storekeeper",
  machine_operator: "Machine Operator",
  boss: "Executive View",
};

export default function OfficeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [storedUser] = useState(() => readStoredUser());
  const role: AppUserRole | null = storedUser?.role || null;
  const userName = storedUser?.name || storedUser?.email || "Operations User";

  const visibleItems = useMemo(() => sidebarItems.filter((item) => role ? item.roles.includes(role) : false), [role]);
  const groupedItems = useMemo(() => visibleItems.reduce<Record<string, SidebarItem[]>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = [];
    acc[item.group].push(item);
    return acc;
  }, {}), [visibleItems]);

  useEffect(() => {
    if (!role || pathname === "/office") return;
    const permitted = visibleItems.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
    if (!permitted) router.replace("/office");
  }, [pathname, role, router, visibleItems]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    clearStoredUser();
    router.push("/login");
  };

  const navigation = (
    <nav className="space-y-6">
      {Object.entries(groupedItems).map(([group, items]) => (
        <div key={group}>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-amber-300">{group}</p>
          <div className="space-y-1">
            {items.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-emerald-50 transition-all duration-200 hover:bg-emerald-500/20 hover:border-l-2 hover:border-amber-400 hover:pl-2.5 ${active ? "border-l-2 border-amber-300 bg-emerald-500/20 pl-2.5" : ""}`}><Icon size={18} className="flex-shrink-0 group-hover:text-amber-300" /><span className="text-sm font-medium">{label}</span></Link>;
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <AuthGuard allowedRoles={["admin", "owner", "manager", "cashier", "storekeeper", "machine_operator", "boss"]}>
      <div className="flex min-h-screen bg-[#07150f]">
        {mobileOpen && <div className="fixed inset-0 z-50 lg:hidden"><button aria-label="Funga menu" onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-black/60" /><aside className="relative flex h-full w-[285px] flex-col overflow-y-auto bg-gradient-to-b from-[#0a1e18] to-[#051511] p-6 text-white shadow-2xl"><div className="mb-8 flex items-start justify-between border-b border-emerald-900/40 pb-4"><div><h2 className="text-2xl font-black">MavunoOne</h2><p className="mt-2 text-xs font-semibold uppercase tracking-wider text-emerald-300">{roleLabels[role || ""] || "Operations Hub"}</p></div><button aria-label="Funga menu" onClick={() => setMobileOpen(false)} className="rounded-lg p-2 text-emerald-200 hover:bg-white/10"><X size={20} /></button></div>{navigation}<button onClick={handleLogout} className="mt-8 w-full rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-4 py-2.5 text-sm font-bold text-white">Toka Nje</button></aside></div>}

        <aside className="fixed hidden h-screen w-64 overflow-y-auto border-r border-emerald-900/30 bg-gradient-to-b from-[#0a1e18] to-[#051511] p-6 text-white shadow-2xl lg:block"><div className="mb-8 border-b border-emerald-900/40 pb-4"><h2 className="text-2xl font-black">MavunoOne</h2><p className="mt-2 text-xs font-semibold uppercase tracking-wider text-emerald-300">{roleLabels[role || ""] || "Operations Hub"}</p></div>{navigation}<button onClick={handleLogout} className="mt-8 w-full rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-4 py-2.5 text-sm font-bold text-white">Toka Nje</button><div className="mt-4 border-t border-emerald-900/40 pt-4"><p className="flex items-center gap-2 truncate text-xs font-semibold text-emerald-300"><UserRound size={14} />{userName}</p><p className="mt-1 text-xs text-emerald-500/70">© 2026 MavunoOne</p></div></aside>

        <main className="min-w-0 flex-1 bg-gradient-to-br from-[#07150f] to-[#0a1e18] lg:ml-64"><header className="sticky top-0 z-30 flex items-center justify-between border-b border-emerald-900/30 bg-[#07150f]/95 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8"><button aria-label="Fungua menu" onClick={() => setMobileOpen(true)} className="rounded-xl border border-emerald-700/30 bg-emerald-950/50 p-2.5 text-emerald-100 lg:hidden"><Menu size={20} /></button><div className="hidden items-center gap-2 text-xs font-semibold text-emerald-300 sm:flex"><span>MavunoOne</span><span className="text-emerald-700">/</span><span>{roleLabels[role || ""] || "Operations Hub"}</span></div><div className="ml-auto flex items-center gap-3"><span className="hidden max-w-[220px] truncate text-xs font-semibold text-emerald-200 sm:block">{userName}</span><Link href={role === "boss" ? "/boss" : "/office"} className="inline-flex items-center gap-2 rounded-xl border border-emerald-700/30 bg-emerald-950/40 px-3 py-2 text-xs font-bold text-emerald-100 transition hover:bg-emerald-800/60"><ArrowLeft size={15} />{role === "boss" ? "Boss Dashboard" : "Dashboard"}</Link></div></header><div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8"><div className="mb-5 hidden items-center justify-between sm:flex"><span className="text-xs font-semibold text-emerald-300/70">MavunoOne Operations Hub</span></div>{children}</div></main>
      </div>
    </AuthGuard>
  );
}
