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
      <div className="min-h-screen bg-gray-50 pb-20">
        <main>{children}</main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
          <div className="flex justify-around">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-1 py-3 px-4 text-gray-600 hover:text-green-600 transition flex-1"
              >
                <Icon size={20} />
                <span className="text-xs text-center">{label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </AuthGuard>
  );
}
