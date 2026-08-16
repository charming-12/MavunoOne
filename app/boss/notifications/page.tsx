"use client";

import { AlertTriangle, TrendingUp, Package } from "lucide-react";

export default function BossNotificationsPage() {
  const notifications = [
    { id: 1, type: "stock", title: "Stock Chini!", message: "Ndizi haina hata 2kg", time: "5 mins ago", icon: AlertTriangle, color: "red" },
    { id: 2, type: "machine", title: "Kazi Kamili", message: "John's mahindi milling complete (90%)", time: "15 mins ago", icon: TrendingUp, color: "green" },
    { id: 3, type: "delivery", title: "Delivery Update", message: "KG456AB arrived at Dar es Salaam", time: "30 mins ago", icon: Package, color: "blue" },
    { id: 4, type: "sales", title: "Mauzo Mkubwa!", message: "INV-001: TZS 450,000 from John Mkwambi", time: "1 hour ago", icon: TrendingUp, color: "green" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-800 text-white p-4">
        <h1 className="text-lg font-bold">Onyo — Zaidi</h1>
      </header>

      <main className="p-4 space-y-3">
        {notifications.map(notification => {
          const Icon = notification.icon;
          return (
            <div key={notification.id} className="bg-white p-4 rounded-lg shadow border-l-4"
              style={{ borderLeftColor: `var(--color-${notification.color})` }}>
              <div className="flex items-start gap-3">
                <Icon className={`text-${notification.color}-600 flex-shrink-0 mt-1`} size={20} />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">{notification.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                </div>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}
