"use client";

import Link from "next/link";
import { Home, ShoppingBag, User } from "lucide-react";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#07150f] to-[#0a1e18] pb-20">
      <header className="bg-gradient-to-r from-[#07150f] to-[#0a1e18] border-b border-emerald-900/30 text-white p-5 sticky top-0 z-10 shadow-lg">
        <h1 className="text-2xl font-black">MavunoOne — Duka</h1>
        <p className="text-emerald-300 text-sm mt-1 font-semibold">Karibu, kuna bidhaa nzuri!</p>
      </header>

      <main>{children}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#07150f]/95 backdrop-blur-md border-t border-emerald-900/30 shadow-2xl">
        <div className="flex justify-around">
          <Link
            href="/shop"
            className="flex flex-col items-center gap-1 py-4 px-4 text-emerald-400 hover:text-amber-300 transition flex-1 hover:bg-emerald-500/10"
          >
            <Home size={22} />
            <span className="text-xs font-semibold">Nyumbani</span>
          </Link>
          <Link
            href="/shop/order"
            className="flex flex-col items-center gap-1 py-4 px-4 text-emerald-400 hover:text-amber-300 transition flex-1 hover:bg-emerald-500/10"
          >
            <ShoppingBag size={22} />
            <span className="text-xs font-semibold">Agiza</span>
          </Link>
          <Link
            href="/shop/account"
            className="flex flex-col items-center gap-1 py-4 px-4 text-emerald-400 hover:text-amber-300 transition flex-1 hover:bg-emerald-500/10"
          >
            <User size={22} />
            <span className="text-xs font-semibold">Akaunti</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
