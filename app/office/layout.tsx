"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LayoutDashboard, ShoppingCart, History, Package, ArrowLeft, ArrowDownToLine, ArrowUpFromLine, Users, Cog, Truck, Receipt, Settings, FileBarChart, Bell, Wrench, Camera, Zap, DollarSign, BarChart3, Settings2, Rocket, ShieldAlert, Globe2, Menu, X, UserRound } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";
import { clearStoredUser, readStoredUser, type AppUserRole } from "@/lib/auth";

type SidebarItem = { href: string; label: string; icon: typeof LayoutDashboard; group: string; roles: AppUserRole[] };

const sidebarItems: SidebarItem[] = [
  { href: "/office", label: "Overview", icon: LayoutDashboard, group: "Workspace", roles: ["admin", "owner", "manager", "cashier", "storekeeper", "machine_operator"] },
  { href: "/office/pos", label: "POS / Mauzo", icon: ShoppingCart, group: "Sales", roles: ["admin", "owner", "manager", "cashier"] },
  { href: "/office/sales", label: "Sales History", icon: History, group: "Sales", roles: ["admin", "owner", "manager", "cashier"] },
  { href: "/office/products", label: "Products", icon: Package, group: "Inventory", roles: ["admin", "owner", "manager", "storekeeper"] },
  { href: "/office/content", label: "Public Content", icon: Globe2, group: "Public publishing", roles: ["admin", "owner", "manager"] },
  { href: "/office/stock-in", label: "Stock In", icon: ArrowDownToLine, group: "Inventory", roles: ["admin", "owner", "manager", "storekeeper"] },
  { href: "/office/stock-out", label: "Stock Out", icon: ArrowUpFromLine, group: "Inventory", roles: ["admin", "owner", "manager", "storekeeper"] },
  { href: "/office/inventory-analytics", label: "Inventory Analytics", icon: FileBarChart, group: "Inventory", roles: ["admin", "owner", "manager", "storekeeper"] },
  { href: "/office/reconciliation", label: "Stock Reconciliation", icon: Cog, group: "Inventory", roles: ["admin", "owner", "manager", "storekeeper"] },
  { href: "/office/customers", label: "Customers", icon: Users, group: "Operations", roles: ["admin", "owner", "manager", "cashier"] },
  { href: "/office/debt", label: "Customer Debt", icon: DollarSign, group: "Operations", roles: ["admin", "owner", "manager"] },
  { href: "/office/farmers", label: "Farmers", icon: Users, group: "Operations", roles: ["admin", "owner", "manager"] },
  { href: "/office/employees", label: "Employees", icon: Users, group: "People & Access", roles: ["admin", "owner"] },
  { href: "/office/machines", label: "Machines", icon: Zap, group: "Operations", roles: ["admin", "owner", "manager", "machine_operator"] },
  { href: "/office/vehicles", label: "Vehicles", icon: Truck, group: "Operations", roles: ["admin", "owner", "manager"] },
  { href: "/office/cameras", label: "Cameras", icon: Camera, group: "Security", roles: ["admin", "owner", "manager"] },
  { href: "/office/deliveries", label: "Deliveries", icon: Truck, group: "Operations", roles: ["admin", "owner", "manager"] },
  { href: "/office/farmer-approvals", label: "Farmer Payments", icon: DollarSign, group: "Finance", roles: ["admin", "owner", "manager"] },
  { href: "/office/expenses", label: "Expenses", icon: Receipt, group: "Finance", roles: ["admin", "owner", "manager"] },
  { href: "/office/maintenance", label: "Maintenance Costs", icon: Wrench, group: "Finance", roles: ["admin", "owner", "manager"] },
  { href: "/office/closures", label: "Daily Closure", icon: Cog, group: "Finance", roles: ["admin", "owner", "manager", "cashier"] },
  { href: "/office/reports", label: "Reports", icon: FileBarChart, group: "Reports", roles: ["admin", "owner", "manager"] },
  { href: "/office/advanced-analytics", label: "Advanced Analytics", icon: BarChart3, group: "Reports", roles: ["admin", "owner", "manager"] },
  { href: "/office/technical-issues", label: "Technical Issues", icon: ShieldAlert, group: "Advanced", roles: ["admin", "owner"] },
  { href: "/office/hardware", label: "Hardware", icon: Settings2, group: "Advanced", roles: ["admin", "owner"] },
  { href: "/office/setup-wizard", label: "Setup Wizard", icon: Rocket, group: "Advanced", roles: ["admin", "owner"] },
  { href: "/office/notifications", label: "Notifications", icon: Bell, group: "System", roles: ["admin", "owner", "manager", "cashier", "storekeeper", "machine_operator"] },
  { href: "/office/settings", label: "Settings", icon: Settings, group: "System", roles: ["admin", "owner"] },
  { href: "/shop", label: "Fungua Public Shop", icon: ShoppingCart, group: "Public access", roles: ["admin", "owner", "manager", "cashier", "storekeeper", "machine_operator"] },
];

const roleLabels: Record<string, string> = { admin: "Administrator", owner: "Owner", manager: "Operations Manager", cashier: "Cashier", storekeeper: "Storekeeper", machine_operator: "Machine Operator", boss: "Executive View" };

export default function OfficeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [storedUser] = useState(() => readStoredUser());
  const role: AppUserRole | null = storedUser?.role || null;
  const userName = storedUser?.name || storedUser?.email || "Operations User";
  const visibleItems = useMemo(() => sidebarItems.filter((item) => role ? item.roles.includes(role) : false), [role]);
  const groupedItems = useMemo(() => visibleItems.reduce<Record<string, SidebarItem[]>>((acc, item) => { if (!acc[item.group]) acc[item.group] = []; acc[item.group].push(item); return acc; }, {}), [visibleItems]);

  useEffect(() => {
    if (!role) return;
    if (role === "boss") { router.replace("/boss"); return; }
    const permitted = pathname === "/office" || visibleItems.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
    if (!permitted) router.replace("/office");
  }, [pathname, role, router, visibleItems]);

  const handleLogout = async () => { await fetch("/api/auth/logout", { method: "POST" }); clearStoredUser(); router.push("/login"); };
  const navigation = <nav className="space-y-6">{Object.entries(groupedItems).map(([group, items]) => <div key={group}><p className="mb-2 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{group}</p><div className="space-y-1">{items.map(({ href, label, icon: Icon }) => { const active = pathname === href || (href !== "/office" && pathname.startsWith(`${href}/`)); return <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${active ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/20" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}><Icon size={17} className={active ? "text-white" : "text-slate-400 group-hover:text-emerald-300"} /><span>{label}</span>{active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />}</Link>; })}</div></div>)}</nav>;

  return <AuthGuard allowedRoles={["admin", "owner", "manager", "cashier", "storekeeper", "machine_operator", "boss"]}><div className="flex min-h-screen bg-[#f4f7f5] text-slate-900"><div className={`fixed inset-0 z-40 bg-slate-950/50 transition-opacity lg:hidden ${mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"}`} onClick={() => setMobileOpen(false)} /><aside className={`fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col overflow-y-auto bg-[#06151b] px-4 py-5 text-white shadow-2xl transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}><div className="flex items-center justify-between px-2 pb-7"><Link href="/office" onClick={() => setMobileOpen(false)} className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300"><LayoutDashboard size={20} /></span><span><span className="block text-xl font-black tracking-tight">Mavuno<span className="text-emerald-400">One</span></span><span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Operations portal</span></span></Link><button onClick={() => setMobileOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 lg:hidden" aria-label="Funga menu"><X size={18} /></button></div><div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.04] p-3"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300"><UserRound size={17} /></span><div className="min-w-0"><p className="truncate text-sm font-bold">{userName}</p><p className="mt-0.5 truncate text-[11px] text-slate-400">{roleLabels[role || ""] || "Operations User"}</p></div></div></div>{navigation}<button onClick={handleLogout} className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-200 transition hover:bg-red-500/20">Toka kwenye mfumo</button></aside><main className="min-w-0 flex-1"><header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8"><div className="flex items-center gap-3"><button aria-label="Fungua menu" onClick={() => setMobileOpen(true)} className="rounded-xl bg-[#06151b] p-2.5 text-white lg:hidden"><Menu size={19} /></button><div className="hidden items-center gap-2 text-xs font-bold text-slate-500 sm:flex"><span className="text-emerald-700">MavunoOne</span><span className="text-slate-300">/</span><span>{roleLabels[role || ""] || "Operations Portal"}</span></div></div><div className="flex items-center gap-2 sm:gap-3"><Link href="/office/notifications" className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 hover:border-emerald-300 hover:text-emerald-700"><Bell size={18} /><span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-emerald-500" /></Link><span className="hidden max-w-[220px] truncate text-xs font-bold text-slate-600 sm:block">{userName}</span><Link href="/office" className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-3 py-2 text-xs font-black text-white transition hover:bg-emerald-800"><ArrowLeft size={14} />Dashboard</Link></div></header><div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div></main></div></AuthGuard>;
}
