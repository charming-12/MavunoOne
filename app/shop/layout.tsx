"use client";

import Link from "next/link";
import { Home, PackageSearch, ShoppingBag, User } from "lucide-react";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#07150f] to-[#0a1e18] pb-20">
      <header className="sticky top-0 z-10 border-b border-emerald-900/30 bg-gradient-to-r from-[#07150f] to-[#0a1e18] p-5 text-white shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link href="/" className="group">
            <h1 className="text-2xl font-black transition group-hover:text-amber-300">MavunoOne — Duka</h1>
            <p className="mt-1 text-sm font-semibold text-emerald-300">Tabora, Tanzania · Nunua kwa urahisi</p>
          </Link>
          <Link href="/" className="hidden rounded-xl border border-emerald-700 px-3 py-2 text-sm font-bold text-emerald-100 transition hover:bg-emerald-900/60 sm:inline-flex">Home</Link>
        </div>
      </header>

      <main>{children}</main>

      {/* Public customer navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-emerald-900/30 bg-[#07150f]/95 shadow-2xl backdrop-blur-md">
        <div className="mx-auto grid max-w-xl grid-cols-4">
          <Link href="/" className="flex flex-col items-center gap-1 px-2 py-3 text-emerald-400 transition hover:bg-emerald-500/10 hover:text-amber-300">
            <Home size={21} />
            <span className="text-[11px] font-semibold">Home</span>
          </Link>
          <Link href="/shop" className="flex flex-col items-center gap-1 px-2 py-3 text-emerald-400 transition hover:bg-emerald-500/10 hover:text-amber-300">
            <ShoppingBag size={21} />
            <span className="text-[11px] font-semibold">Shop</span>
          </Link>
          <Link href="/shop/order" className="flex flex-col items-center gap-1 px-2 py-3 text-emerald-400 transition hover:bg-emerald-500/10 hover:text-amber-300">
            <PackageSearch size={21} />
            <span className="text-[11px] font-semibold">Agiza</span>
          </Link>
          <Link href="/shop/account" className="flex flex-col items-center gap-1 px-2 py-3 text-emerald-400 transition hover:bg-emerald-500/10 hover:text-amber-300">
            <User size={21} />
            <span className="text-[11px] font-semibold">Akaunti</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
