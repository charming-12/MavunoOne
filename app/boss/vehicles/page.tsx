"use client";

import { MapPin } from "lucide-react";

export default function BossVehiclesPage() {
  const vehicles = [
    { id: 1, plate: "KG456AB", driver: "Peter Mwangi", location: "Dar es Salaam", status: "Delivering", speed: "45 km/h" },
    { id: 2, plate: "TZ789CD", driver: "Hassan Ali", location: "Morogoro", status: "In Transit", speed: "55 km/h" },
    { id: 3, plate: "RO123EF", driver: "Grace Kamau", location: "Iringa", status: "Delivering", speed: "40 km/h" },
    { id: 4, plate: "RJ456GH", driver: "Moses Kimani", location: "Offline", status: "Offline", speed: "— " },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-800 text-white p-4">
        <h1 className="text-lg font-bold">Magari — Realtime</h1>
      </header>

      <main className="p-4 space-y-3">
        {vehicles.map(vehicle => (
          <div key={vehicle.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-start gap-3 mb-3">
              <div className={`w-3 h-3 rounded-full mt-1 ${
                vehicle.status === "Offline"
                  ? "bg-red-600"
                  : "bg-green-600"
              }`}></div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">{vehicle.plate}</p>
                <p className="text-xs text-gray-600">{vehicle.driver}</p>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded bg-blue-100 text-blue-800">
                {vehicle.speed}
              </span>
            </div>

            <div className="bg-gray-50 p-2 rounded flex items-center gap-2 mb-2">
              <MapPin className="text-blue-600" size={16} />
              <span className="text-sm text-gray-700">{vehicle.location}</span>
            </div>

            <div className="text-right">
              <button className="text-blue-600 text-sm font-medium hover:underline">
                Angalia Ramani →
              </button>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
