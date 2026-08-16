"use client";

import { Monitor, AlertTriangle, CheckCircle } from "lucide-react";
import { CCTVCamera } from "@/components/CCTVCamera";

export default function CamerasPage() {
  const cameras = [
    {
      id: "CAM-001",
      location: "Vehicle: KG456AB - Dar es Salaam",
      status: "online" as const,
      lastUpdate: "2 mins ago",
      vehicleId: 1,
    },
    {
      id: "CAM-002",
      location: "Vehicle: TZ789CD - Morogoro Route",
      status: "online" as const,
      lastUpdate: "1 min ago",
      vehicleId: 2,
    },
    {
      id: "CAM-003",
      location: "Vehicle: RO123EF - Iringa",
      status: "recording" as const,
      lastUpdate: "Just now",
      vehicleId: 3,
    },
    {
      id: "CAM-004",
      location: "Warehouse - Entrance",
      status: "online" as const,
      lastUpdate: "30 secs ago",
      vehicleId: null,
    },
    {
      id: "CAM-005",
      location: "Storage Area - Main",
      status: "online" as const,
      lastUpdate: "45 secs ago",
      vehicleId: null,
    },
    {
      id: "CAM-006",
      location: "Loading Dock",
      status: "offline" as const,
      lastUpdate: "2 hours ago",
      vehicleId: null,
    },
  ];

  const onlineCameras = cameras.filter((c) => c.status !== "offline").length;
  const recordingCameras = cameras.filter((c) => c.status === "recording").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Kamera za Usalama</h1>
        <p className="text-gray-600 mt-2">Fuatilia magari na nyumba ya hifadhi</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Jumla ya Kamera</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{cameras.length}</p>
            </div>
            <Monitor className="text-blue-600" size={32} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Online</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{onlineCameras}</p>
              <p className="text-xs text-green-600 mt-1">
                {Math.round((onlineCameras / cameras.length) * 100)}% hutumika
              </p>
            </div>
            <CheckCircle className="text-green-600" size={32} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Recording</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{recordingCameras}</p>
              <p className="text-xs text-red-600 mt-1">🔴 Live monitoring</p>
            </div>
            <AlertTriangle className="text-red-600" size={32} />
          </div>
        </div>
      </div>

      {/* Camera Grid */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Kamera Zote</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cameras.map((camera) => (
            <CCTVCamera
              key={camera.id}
              cameraId={camera.id}
              location={camera.location}
              status={camera.status}
              lastUpdate={camera.lastUpdate}
              resolution="1920x1080"
              fps={30}
            />
          ))}
        </div>
      </div>

      {/* Camera Status Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Hali ya Kamera</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Kamera ID
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Mahali
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Hali
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Kubahatishwa
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Hatua
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cameras.map((camera) => (
                <tr key={camera.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono text-gray-900">
                    {camera.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{camera.location}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        camera.status === "online"
                          ? "bg-green-100 text-green-800"
                          : camera.status === "recording"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {camera.status === "recording"
                        ? "🔴 Recording"
                        : camera.status === "online"
                          ? "Online"
                          : "Offline"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{camera.lastUpdate}</td>
                  <td className="px-6 py-4 text-sm">
                    <button className="text-blue-600 hover:text-blue-800 font-medium">
                      View →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
