"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Boxes, Camera, ChevronDown, CircleUserRound, FileBarChart, Home, Leaf, LogOut, Menu, Moon, Settings, ShoppingCart, ArrowLeft, Truck, UsersRound, X, Sun, WalletCards } from "lucide-react";
import { useMemo, useState } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { clearStoredUser, readStoredUser } from "@/lib/auth";
import { trpc } from "@/lib/trpc";

const navItems = [
  { href: "/boss", label: "Muhtasari", icon: Home },
  { href: "/boss/sales", label: "Mauzo", icon: ShoppingCart },
  { href: "/boss/stock", label: "Stock", icon: Boxes },
  { href: "/boss/vehicles", label: "Magari / GPS", icon: Truck },
  { href: "/boss/cameras", label: "CCTV", icon: Camera },
  { href: "/boss/customers", label: "Wateja", icon: UsersRound },
  { href: "/boss/employees", label: "Wafanyakazi", icon: UsersRound },
  { href: "/boss/expenses", label: "Gharama / P&L", icon: WalletCards },
  { href: "/boss/farmer-payments", label: "Malipo ya Wakulima", icon: FileBarChart },
  { href: "/boss/notifications", label: "Taarifa", icon: Bell },
  { href: "/shop", label: "Fungua Public Shop", icon: ShoppingCart },
];

function Brand() {
  return <Link href="/boss" className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-[#071a18] shadow-lg shadow-emerald-950/30"><Leaf size={22} strokeWidth={2.4} /></span><span><span className="block text-lg font-extrabold tracking-tight text-white">Mavuno<span className="text-emerald-400">One</span></span><span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300/80">Boss command center</span></span></Link>;
}

export default function BossLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "focus">("light");
  const [storedUser] = useState(() => readStoredUser());
  const notificationsQuery = trpc.notifications.list.useQuery(undefined, { refetchInterval: 30000 });
  const unreadCount = useMemo(() => (notificationsQuery.data ?? []).filter((notification) => !notification.isRead).length, [notificationsQuery.data]);
  const userName = storedUser?.name || storedUser?.email || "Boss";

  const toggleTheme = () => {
    setTheme((current) => {
      const next = current === "light" ? "focus" : "light";
      document.documentElement.dataset.theme = next;
      window.localStorage.setItem("mavunoone-theme", next);
      return next;
    });
  };

  const handleLogout = async () => { await fetch("/api/auth/logout", { method: "POST" }); clearStoredUser(); router.push("/login"); };
  const navigation = (mobile = false) => <nav className="mt-3 space-y-1.5">{navItems.map(({ href, label, icon: Icon }) => { const active = pathname === href; return <Link onClick={() => mobile && setMobileOpen(false)} key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${active ? "bg-emerald-500 text-[#071a18] shadow-lg shadow-emerald-950/20" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}><Icon size={18} strokeWidth={active ? 2.4 : 2} />{label}</Link>; })}</nav>;

  return <AuthGuard allowedRoles={["boss"]}><div className={`${theme === "focus" ? "boss-theme-focus" : ""} min-h-screen bg-[#f7f9f8]`}>
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col bg-[#071a18] px-4 py-6 text-white shadow-2xl lg:flex"><div className="px-3"><Brand /></div><div className="my-8 h-px bg-white/10" /><p className="px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-400/70">Executive navigation</p>{navigation()}<div className="mt-auto space-y-3"><div className="rounded-2xl border border-white/10 bg-white/5 p-3"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300"><CircleUserRound size={20} /></span><div className="min-w-0"><p className="truncate text-sm font-semibold text-white">{userName}</p><p className="text-xs text-slate-400">Boss / Executive</p></div><ChevronDown size={15} className="ml-auto text-slate-400" /></div></div><button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"><LogOut size={18} />Toka kwenye akaunti</button></div></aside>

    {mobileOpen && <div className="fixed inset-0 z-50 lg:hidden"><button aria-label="Funga menu" onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-[#071a18]/60 backdrop-blur-sm" /><aside className="relative flex h-full w-[280px] flex-col bg-[#071a18] px-4 py-6 text-white shadow-2xl"><div className="flex items-center justify-between px-3"><Brand /><button aria-label="Funga menu" onClick={() => setMobileOpen(false)} className="rounded-lg p-2 text-slate-300 hover:bg-white/10"><X size={20} /></button></div><div className="my-8 h-px bg-white/10" />{navigation(true)}<button onClick={handleLogout} className="mt-auto flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-400 hover:text-red-300"><LogOut size={18} />Toka kwenye akaunti</button></aside></div>}

    <div className="lg:pl-[248px]"><header className="sticky top-0 z-30 border-b border-slate-200/80 bg-[#f7f9f8]/90 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8"><div className="flex items-center justify-between"><button aria-label="Fungua menu" onClick={() => setMobileOpen(true)} className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm lg:hidden"><Menu size={20} /></button><div className="flex items-center gap-3"><div className="hidden items-center gap-2 text-sm font-medium text-slate-500 lg:flex"><span className="text-emerald-700">MavunoOne</span><span>/</span><span>{pathname === "/boss" ? "Boss dashboard" : "Boss workspace"}</span></div>{pathname !== "/boss" && <Link href="/boss" className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-bold text-emerald-800 shadow-sm transition hover:bg-emerald-50"><ArrowLeft size={15} />Dashboard</Link>}</div><div className="ml-auto flex items-center gap-2 sm:gap-3"><Link aria-label="Taarifa" href="/boss/notifications" className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm hover:text-emerald-700"><Bell size={18} />{unreadCount > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white">{unreadCount > 99 ? "99+" : unreadCount}</span>}</Link><button aria-label="Badilisha theme" onClick={toggleTheme} className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm hover:text-emerald-700">{theme === "light" ? <Moon size={18} /> : <Sun size={18} />}</button><Link aria-label="Mipangilio" href="/boss/settings" className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm hover:text-emerald-700"><Settings size={18} /></Link><div className="hidden h-8 w-px bg-slate-200 sm:block" /><div className="hidden text-sm font-semibold text-slate-700 md:block">{userName}</div></div></div></header>{children}</div>
  </div></AuthGuard>;
}
