"use client";

import Link from "next/link";
import { Home, ShoppingBag, User } from "lucide-react";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-green-800 text-white p-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold">MavunoOne — Duka</h1>
        <p className="text-xs opacity-80">Karibu, kuna bidhaa mpya!</p>
      </header>

      <main>{children}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="flex justify-around">
          <Link
            href="/shop"
            className="flex flex-col items-center gap-1 py-3 px-4 text-gray-600 hover:text-green-600 transition flex-1"
          >
            <Home size={20} />
            <span className="text-xs">Nyumbani</span>
          </Link>
          <Link
            href="/shop/order"
            className="flex flex-col items-center gap-1 py-3 px-4 text-gray-600 hover:text-green-600 transition flex-1"
          >
            <ShoppingBag size={20} />
            <span className="text-xs">Agiza</span>
          </Link>
          <Link
            href="/shop/account"
            className="flex flex-col items-center gap-1 py-3 px-4 text-gray-600 hover:text-green-600 transition flex-1"
          >
            <User size={20} />
            <span className="text-xs">Akaunti</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
