"use client";

import Link from "next/link";
import { Home, ShoppingCart, Package, Truck, Menu } from "lucide-react";
import { AuthGuard } from "@/components/AuthGuard";

const navItems = [
  { href: "/boss", label: "Nyumbani", icon: Home },
  { href: "/boss/sales", label: "Mauzo", icon: ShoppingCart },
  { href: "/boss/stock", label: "Stock", icon: Package },
  { href: "/boss/vehicles", label: "Magari", icon: Truck },
  { href: "/boss/notifications", label: "Zaidi", icon: Menu },
];

export default function BossLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={["boss", "admin"]}>
      <div className="min-h-screen bg-gradient-to-br from-[#07150f] to-[#0a1e18] pb-20">
        <header className="sticky top-0 z-20 border-b border-emerald-900/30 bg-[#07150f]/95 backdrop-blur-md px-6 py-4">
          <div>
            <h1 className="text-2xl font-black text-white">🌾 MavunoOne</h1>
            <p className="text-emerald-300 text-xs mt-1 font-semibold uppercase tracking-wider">Boss Dashboard</p>
          </div>
        </header>
        <main>{children}</main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-[#07150f]/95 backdrop-blur-md border-t border-emerald-900/30 shadow-2xl">
          <div className="flex justify-around">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-1 py-4 px-4 text-emerald-400 hover:text-amber-300 transition flex-1 hover:bg-emerald-500/10"
              >
                <Icon size={22} />
                <span className="text-xs text-center font-semibold">{label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </AuthGuard>
  );
}
