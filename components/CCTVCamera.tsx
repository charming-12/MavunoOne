"use client";

import { Camera, Clock, AlertCircle, Signal } from "lucide-react";

interface CCTVCameraProps {
  cameraId: string;
  location: string;
  status: "online" | "offline" | "recording";
  lastUpdate: string;
  resolution?: string;
  fps?: number;
}

export function CCTVCamera({
  cameraId,
  location,
  status,
  lastUpdate,
  resolution = "1920x1080",
  fps = 30,
}: CCTVCameraProps) {
  const statusColor = {
    online: "border-green-500 bg-green-50",
    offline: "border-red-500 bg-red-50",
    recording: "border-blue-500 bg-blue-50",
  };

  const statusBgColor = {
    online: "bg-green-100 text-green-800",
    offline: "bg-red-100 text-red-800",
    recording: "bg-blue-100 text-blue-800",
  };

  const statusLabel = {
    online: "Online",
    offline: "Offline",
    recording: "🔴 Recording",
  };

  return (
    <div
      className={`border-2 rounded-lg overflow-hidden shadow-lg ${statusColor[status]}`}
    >
      {/* Camera Feed Placeholder */}
      <div className="bg-gray-900 h-48 relative flex items-center justify-center overflow-hidden">
        {/* Simulated video feed background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900"></div>

        {/* Grid overlay for CCTV aesthetic */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-4 grid-rows-4 h-full w-full border border-green-500">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className="border border-green-500 opacity-30"
              ></div>
            ))}
          </div>
        </div>

        {/* Status indicator */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black bg-opacity-60 px-2 py-1 rounded">
          <Signal
            className={`w-4 h-4 ${
              status === "online"
                ? "text-green-400"
                : status === "recording"
                  ? "text-red-400 animate-pulse"
                  : "text-gray-400"
            }`}
          />
          <span className="text-xs text-green-400 font-mono">
            {resolution} {fps}fps
          </span>
        </div>

        {/* Location overlay */}
        <div className="absolute bottom-3 left-3 bg-black bg-opacity-60 px-2 py-1 rounded">
          <p className="text-xs text-green-400 font-mono">{location}</p>
        </div>

        {/* Center indicator */}
        {status === "online" && (
          <Camera className="w-16 h-16 text-green-500 opacity-30 absolute" />
        )}

        {status === "offline" && (
          <div className="absolute text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
            <p className="text-red-400 text-sm font-medium">Offline</p>
          </div>
        )}

        {/* Timestamp */}
        <div className="absolute top-3 left-3 bg-black bg-opacity-60 px-2 py-1 rounded flex items-center gap-1">
          <Clock className="w-3 h-3 text-green-400" />
          <span className="text-xs text-green-400 font-mono">
            {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Camera Info */}
      <div className="p-4 bg-white">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-semibold text-gray-900">{cameraId}</h4>
            <p className="text-sm text-gray-600">{location}</p>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBgColor[status]}`}>
            {statusLabel[status]}
          </span>
        </div>

        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Resolution:</span>
            <span className="font-mono">{resolution}</span>
          </div>
          <div className="flex justify-between">
            <span>Frame Rate:</span>
            <span className="font-mono">{fps} fps</span>
          </div>
          <div className="flex justify-between">
            <span>Last Update:</span>
            <span>{lastUpdate}</span>
          </div>
        </div>

        {/* Control buttons */}
        <div className="mt-4 flex gap-2">
          <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition">
            Fullscreen
          </button>
          <button className="flex-1 px-3 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded hover:bg-gray-300 transition">
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
