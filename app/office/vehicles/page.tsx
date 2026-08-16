"use client";

import { MapPin, Camera, AlertTriangle, Navigation } from "lucide-react";
import { CCTVCamera } from "@/components/CCTVCamera";
import Link from "next/link";

export default function VehiclesPage() {
  const vehicles = [
    {
      id: 1,
      plate: "KG456AB",
      type: "Truck",
      driver: "Peter Mwangi",
      location: "Dar es Salaam",
      lat: -6.8,
      lng: 39.3,
      lastUpdate: "2 mins ago",
      status: "Delivering",
      cameraId: "CAM-001",
      speed: 65,
      fuelLevel: 75,
    },
    {
      id: 2,
      plate: "TZ789CD",
      type: "Van",
      driver: "Hassan Ali",
      location: "Morogoro",
      lat: -6.8,
      lng: 37.7,
      lastUpdate: "5 mins ago",
      status: "In Transit",
      cameraId: "CAM-002",
      speed: 45,
      fuelLevel: 60,
    },
    {
      id: 3,
      plate: "RO123EF",
      type: "Truck",
      driver: "Grace Kamau",
      location: "Iringa",
      lat: -8.8,
      lng: 35.7,
      lastUpdate: "15 mins ago",
      status: "Delivering",
      cameraId: "CAM-003",
      speed: 78,
      fuelLevel: 45,
    },
    {
      id: 4,
      plate: "RJ456GH",
      type: "Van",
      driver: "Moses Kimani",
      location: "Off Grid",
      lat: null,
      lng: null,
      lastUpdate: "2 hours ago",
      status: "Offline",
      cameraId: null,
      speed: 0,
      fuelLevel: 0,
    },
  ];

  const activeVehicles = vehicles.filter((v) => v.status !== "Offline").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Magari</h1>
          <p className="text-gray-600 mt-2">Fuatilia magari kwa GPS na CCTV</p>
        </div>
        <Link href="/office/cameras">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
            <Camera size={18} />
            Kamera za Usalama
          </button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-600">
          <p className="text-gray-600 text-sm">Jumla ya Magari</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{vehicles.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-600">
          <p className="text-gray-600 text-sm">Yanayotembea</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{activeVehicles}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-600">
          <p className="text-gray-600 text-sm">Average Speed</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">62 km/h</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-600">
          <p className="text-gray-600 text-sm">Alerts</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">1</p>
        </div>
      </div>

      {/* Vehicle Cards Grid */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Magari Inayotumika</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
            >
              {/* Vehicle Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold">{vehicle.plate}</h3>
                    <p className="text-blue-100 text-sm">{vehicle.type} — {vehicle.driver}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      vehicle.status === "Offline"
                        ? "bg-red-100 text-red-800"
                        : vehicle.status === "Delivering"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {vehicle.status}
                  </span>
                </div>
              </div>

              {/* Vehicle Content */}
              <div className="p-6 space-y-4">
                {/* Location */}
                <div className="flex items-start gap-3">
                  <MapPin className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Mahali Palikopo</p>
                    <p className="font-semibold text-gray-900">{vehicle.location}</p>
                    {vehicle.lat && vehicle.lng && (
                      <p className="text-xs text-gray-500 mt-1 font-mono">
                        {vehicle.lat}, {vehicle.lng}
                      </p>
                    )}
                  </div>
                </div>

                {/* Speed and Fuel */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Speed</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {vehicle.speed} km/h
                    </p>
                    <div className="mt-2 bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-green-500 h-full"
                        style={{ width: `${Math.min(vehicle.speed, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fuel</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {vehicle.fuelLevel}%
                    </p>
                    <div className="mt-2 bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          vehicle.fuelLevel < 30
                            ? "bg-red-500"
                            : vehicle.fuelLevel < 60
                              ? "bg-yellow-500"
                              : "bg-green-500"
                        }`}
                        style={{ width: `${vehicle.fuelLevel}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Last Update */}
                <p className="text-xs text-gray-500">Kubahatishwa: {vehicle.lastUpdate}</p>

                {/* Actions */}
                <div className="border-t pt-4 flex gap-2">
                  {vehicle.lat && vehicle.lng && (
                    <>
                      <button className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition flex items-center justify-center gap-1">
                        <Navigation size={14} />
                        Ramani
                      </button>
                      <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition flex items-center justify-center gap-1">
                        <Camera size={14} />
                        Camera
                      </button>
                    </>
                  )}
                  {vehicle.status === "Offline" && (
                    <button className="flex-1 px-3 py-2 bg-gray-300 text-gray-600 text-sm font-medium rounded cursor-not-allowed">
                      Offline
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CCTV Cameras Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Kamera za Magari</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles
            .filter((v) => v.cameraId)
            .map((vehicle) => (
              <CCTVCamera
                key={vehicle.cameraId}
                cameraId={vehicle.cameraId!}
                location={`${vehicle.plate} - ${vehicle.location}`}
                status={vehicle.status === "Offline" ? "offline" : "online"}
                lastUpdate={vehicle.lastUpdate}
              />
            ))}
        </div>
      </div>

      {/* Alerts Section */}
      <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-yellow-900">Onyo: Fuel Low</h3>
            <p className="text-sm text-yellow-800 mt-1">
              Vehicle RO123EF fuel level ni 45%. Tafadhali jaza fuel mwenyewe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
