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
        <h1 className="text-3xl font-bold text-amber-300 uppercase tracking-wider">Kamera za Usalama</h1>
        <p className="text-emerald-200 mt-2 text-sm font-semibold">Fuatilia magari na nyumba ya hifadhi kwa wakati halisi</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-[#0a1e18] to-[#051511] p-6 rounded-lg border border-emerald-900/40 backdrop-blur-sm shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-300 text-sm font-semibold">Jumla ya Kamera</p>
              <p className="text-3xl font-black text-amber-300 mt-2">{cameras.length}</p>
            </div>
            <Monitor className="text-amber-400" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#0a1e18] to-[#051511] p-6 rounded-lg border border-emerald-900/40 backdrop-blur-sm shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-300 text-sm font-semibold">Online</p>
              <p className="text-3xl font-black text-amber-300 mt-2">{onlineCameras}</p>
              <p className="text-xs text-emerald-400 mt-1 font-semibold">
                {Math.round((onlineCameras / cameras.length) * 100)}% hutumika
              </p>
            </div>
            <CheckCircle className="text-emerald-400" size={32} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#0a1e18] to-[#051511] p-6 rounded-lg border border-emerald-900/40 backdrop-blur-sm shadow-lg hover:border-red-400/50 transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-300 text-sm font-semibold uppercase tracking-wider">Recording</p>
              <p className="text-3xl font-black text-red-400 mt-2">{recordingCameras}</p>
              <p className="text-xs text-red-400 mt-1 font-semibold">🔴 Live monitoring</p>
            </div>
            <AlertTriangle className="text-red-400" size={32} />
          </div>
        </div>
      </div>

      {/* Camera Grid */}
      <div>
        <h2 className="text-2xl font-bold text-amber-300 mb-4 uppercase tracking-wider">Kamera Zote</h2>
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
      <div className="bg-gradient-to-br from-[#0a1e18] to-[#051511] rounded-lg border border-emerald-900/40 backdrop-blur-sm shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-emerald-900/40">
          <h2 className="text-lg font-bold text-amber-300 uppercase tracking-wider">Hali ya Kamera</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-emerald-950/50 border-b border-emerald-900/40">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-amber-300">
                  Kamera ID
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-amber-300">
                  Mahali
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-amber-300">
                  Hali
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-amber-300">
                  Kubahatishwa
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-amber-300">
                  Hatua
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/40">
              {cameras.map((camera) => (
                <tr key={camera.id} className="hover:bg-emerald-900/20 transition">
                  <td className="px-6 py-4 text-sm font-mono text-emerald-200">
                    {camera.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-emerald-300">{camera.location}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        camera.status === "online"
                          ? "bg-emerald-900/40 text-emerald-300"
                          : camera.status === "recording"
                            ? "bg-amber-900/40 text-amber-300"
                            : "bg-red-900/40 text-red-300"
                      }`}
                    >
                      {camera.status === "recording"
                        ? "🔴 Recording"
                        : camera.status === "online"
                          ? "✓ Online"
                          : "✗ Offline"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-emerald-300">{camera.lastUpdate}</td>
                  <td className="px-6 py-4 text-sm">
                    <button className="text-amber-400 hover:text-amber-300 font-semibold transition">
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
