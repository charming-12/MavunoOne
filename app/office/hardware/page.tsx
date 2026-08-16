"use client";

import { useState } from "react";
import { Printer, Scale, Zap, Settings, Check, X, Save } from "lucide-react";

interface HardwareDevice {
  id: string;
  type: "printer" | "scale" | "rfid";
  name: string;
  model: string;
  connectionType: "usb" | "network" | "bluetooth";
  ipAddress?: string;
  port?: string;
  isConnected: boolean;
  lastSeen?: string;
  config: Record<string, string>;
}

export default function HardwareIntegrationPage() {
  const [devices, setDevices] = useState<HardwareDevice[]>([
    {
      id: "printer-01",
      type: "printer",
      name: "Printa ya Tikiti",
      model: "Epson TM-T20III",
      connectionType: "usb",
      isConnected: true,
      lastSeen: "Sasa",
      config: { printWidth: "80mm", autocut: "enabled" },
    },
  ]);

  const [showAddDevice, setShowAddDevice] = useState(false);
  const [editingDevice, setEditingDevice] = useState<HardwareDevice | null>(null);
  const [testOutput, setTestOutput] = useState<string>("");

  const handleTestDevice = async (device: HardwareDevice) => {
    try {
      const response = await fetch("/api/hardware/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: device.id,
          type: device.type,
          config: device.config,
        }),
      });
      const data = await response.json();
      setTestOutput(data.message || "Mtihani umekamilika");
    } catch (error) {
      setTestOutput(`Kosa: ${String(error)}`);
    }
  };

  const handleSaveDevice = async (device: HardwareDevice) => {
    try {
      const response = await fetch("/api/hardware/configure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(device),
      });
      if (response.ok) {
        const updatedDevices = devices.map((d) => (d.id === device.id ? device : d));
        setDevices(updatedDevices);
        setEditingDevice(null);
      }
    } catch (error) {
      console.error("Kosa wakati wa kubahatisha vifaa:", error);
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "printer":
        return <Printer className="text-blue-600" size={24} />;
      case "scale":
        return <Scale className="text-green-600" size={24} />;
      default:
        return <Zap className="text-gray-600" size={24} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="text-blue-600" size={32} />
            Vifaa vya Mtandao
          </h1>
          <p className="text-gray-600 mt-2">Dhibiti printa, kiwanja, na vifaa vingine</p>
        </div>
        <button
          onClick={() => setShowAddDevice(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
        >
          + Kwanza Kiwanja
        </button>
      </div>

      {/* Devices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {devices.map((device) => (
          <div key={device.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    {getDeviceIcon(device.type)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{device.name}</h3>
                    <p className="text-sm text-gray-600">{device.model}</p>
                  </div>
                </div>
                <div
                  className={`w-3 h-3 rounded-full ${device.isConnected ? "bg-green-500" : "bg-red-500"}`}
                />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Aina ya Mipango:</span>
                  <span className="font-medium text-gray-900">{device.connectionType.toUpperCase()}</span>
                </div>
                {device.ipAddress && (
                  <div className="flex justify-between text-gray-600">
                    <span>IP Address:</span>
                    <span className="font-medium text-gray-900">{device.ipAddress}</span>
                  </div>
                )}
                {device.port && (
                  <div className="flex justify-between text-gray-600">
                    <span>Bandari:</span>
                    <span className="font-medium text-gray-900">{device.port}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Hali:</span>
                  <div className="flex items-center gap-1">
                    {device.isConnected ? (
                      <>
                        <Check size={16} className="text-green-600" />
                        <span className="text-green-600 font-medium">Imeunganisha</span>
                      </>
                    ) : (
                      <>
                        <X size={16} className="text-red-600" />
                        <span className="text-red-600 font-medium">Haijaunganishwa</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-gray-50 flex gap-2">
              <button
                onClick={() => handleTestDevice(device)}
                className="flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium rounded-lg transition text-sm"
              >
                Jaribu
              </button>
              <button
                onClick={() => setEditingDevice(device)}
                className="flex-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition text-sm"
              >
                Hariri
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Test Output */}
      {testOutput && (
        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
          <p className="text-blue-900 font-medium">Matokeo ya Mtihani:</p>
          <p className="text-blue-800 mt-1">{testOutput}</p>
        </div>
      )}

      {/* Edit Device Modal */}
      {editingDevice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Hariri {editingDevice.name}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jina</label>
                <input
                  type="text"
                  value={editingDevice.name}
                  onChange={(e) => setEditingDevice({ ...editingDevice, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                <input
                  type="text"
                  value={editingDevice.model}
                  onChange={(e) => setEditingDevice({ ...editingDevice, model: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">IP Address (kwa mtandao)</label>
                <input
                  type="text"
                  value={editingDevice.ipAddress || ""}
                  onChange={(e) => setEditingDevice({ ...editingDevice, ipAddress: e.target.value })}
                  placeholder="192.168.1.100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bandari</label>
                <input
                  type="text"
                  value={editingDevice.port || ""}
                  onChange={(e) => setEditingDevice({ ...editingDevice, port: e.target.value })}
                  placeholder="9100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingDevice(null)}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition"
              >
                Ghairi
              </button>
              <button
                onClick={() => {
                  handleSaveDevice(editingDevice);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition"
              >
                <Save size={16} />
                Hifadhi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Device Modal */}
      {showAddDevice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Kwanza Kiwanja Kipya</h2>

            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-600 hover:bg-blue-50 transition text-center">
                <Printer className="mx-auto mb-2 text-blue-600" size={24} />
                <p className="font-medium text-gray-900">Printa</p>
              </button>
              <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-600 hover:bg-green-50 transition text-center">
                <Scale className="mx-auto mb-2 text-green-600" size={24} />
                <p className="font-medium text-gray-900">Kiwanja</p>
              </button>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowAddDevice(false)}
                className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition"
              >
                Ghairi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
