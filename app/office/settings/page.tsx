"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, Trash2, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";

interface Configuration {
  id: number;
  key: string;
  value: string;
  description: string | null;
  isEncrypted: boolean;
  updatedAt: string;
}

export default function SettingsPage() {
  const [configs, setConfigs] = useState<Configuration[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});
  const [readyState, setReadyState] = useState<{ ready: boolean; missing: string[] }>({
    ready: false,
    missing: [],
  });

  // Form states
  const [formData, setFormData] = useState({
    key: "",
    value: "",
    description: "",
    isEncrypted: false,
  });

  const fetchConfigs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/config");
      const data = await response.json();
      setConfigs(data);
    } catch {
      setMessage({ type: "error", text: "Imeshindwa kupakua mipangilio" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadConfigs = async () => {
      await fetchConfigs();
    };

    const loadReadyState = async () => {
      try {
        const response = await fetch("/api/config/ready");
        const data = await response.json();
        setReadyState({
          ready: Boolean(data.ready),
          missing: Array.isArray(data.missing) ? data.missing : [],
        });
      } catch {
        setReadyState({ ready: false, missing: [] });
      }
    };

    void loadConfigs();
    void loadReadyState();
  }, [fetchConfigs]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.key || !formData.value) {
      setMessage({ type: "error", text: "Jina na thamani vinahitajika" });
      return;
    }

    try {
      setSaving(true);
      const response = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save");

      setMessage({ type: "success", text: "Mipangilio iliyosimuliwa" });
      setFormData({ key: "", value: "", description: "", isEncrypted: false });
      await fetchConfigs();
    } catch {
      setMessage({ type: "error", text: "Imeshindwa kuokoa mipangilio" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (key: string) => {
    if (!confirm(`Unakakukataa kufuta '${key}'?`)) return;

    try {
      const response = await fetch(`/api/config?key=${key}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete");

      setMessage({ type: "success", text: "Mipangilio iliyofutwa" });
      await fetchConfigs();
    } catch {
      setMessage({ type: "error", text: "Imeshindwa kufuta mipangilio" });
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">⚙️ Mipangilio ya Mfumo</h1>
        <p className="text-gray-600 mt-2">Pange akaunti za fedha, SMS, na kamera bila kuandika nambari mbili</p>
      </div>

      <div
        className={`mb-6 rounded-lg border p-4 ${
          readyState.ready
            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
            : "border-amber-200 bg-amber-50 text-amber-900"
        }`}
      >
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide">
              {readyState.ready ? "Ready Mode" : "Setup Wizard Required"}
            </p>
            <p className="text-sm mt-1">
              {readyState.ready
                ? "Mfumo umewekwa tayari na unafanya kazi kwa kasi ya moja kwa moja."
                : "Baadhi ya mipangilio bado inakosekana; weka credentials kabla ya kuanza kwa kutumia dynamic config."}
            </p>
          </div>
          {readyState.ready ? (
            <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">READY</span>
          ) : (
            <span className="rounded-full bg-amber-600 px-3 py-1 text-xs font-bold text-white">SETUP</span>
          )}
        </div>

        {readyState.missing.length > 0 && (
          <div className="mt-3 text-sm">
            <p className="font-medium">Zinazokosa:</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {readyState.missing.map((key) => (
                <span key={key} className="rounded-full bg-white px-2 py-1 text-xs font-medium text-amber-700 border border-amber-200">
                  {key}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Message Alert */}
      {message && (
        <div
          className={`mb-4 p-4 rounded-lg flex items-center gap-3 ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Ongeza Mipangilio Mpya</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jina la Funguo
              </label>
              <input
                type="text"
                value={formData.key}
                onChange={(e) =>
                  setFormData({ ...formData, key: e.target.value.toUpperCase() })
                }
                placeholder="LIPA_NUMBER, CAMERA_IP, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thamani
              </label>
              <textarea
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
                placeholder="Ingiza thamani..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maelezo (Kawaida)
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Maelezo kuhusu parameta hii..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isEncrypted}
                onChange={(e) =>
                  setFormData({ ...formData, isEncrypted: e.target.checked })
                }
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">Matibabu kama siri (iliyosimbwa)</span>
            </label>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? "Inakosavua..." : "Okoa Mipangilio"}
            </button>
          </form>
        </div>

        {/* List Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Mipangilio Iliyookoa</h2>
          {loading ? (
            <p className="text-gray-500">Inapakua...</p>
          ) : configs.length === 0 ? (
            <p className="text-gray-500">Hakuna mipangilio iliyookoa</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {configs.map((config) => (
                <div
                  key={config.id}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{config.key}</p>
                      {config.description && (
                        <p className="text-sm text-gray-600">{config.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type={showValues[config.key] ? "text" : "password"}
                          value={config.value}
                          readOnly
                          className="text-xs bg-gray-100 p-1 rounded w-32"
                        />
                        <button
                          onClick={() =>
                            setShowValues({
                              ...showValues,
                              [config.key]: !showValues[config.key],
                            })
                          }
                          className="text-gray-500 hover:text-gray-700"
                        >
                          {showValues[config.key] ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(config.key)}
                      className="text-red-600 hover:text-red-700 ml-2"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recommended Settings */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">💡 Mipangilio Inayopendekezwa</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-medium">Mkopo wa Fedha</p>
            <p className="text-gray-600">LIPA_NUMBER, LIPA_BUSINESS_KEY, LIPA_PASSWORD</p>
          </div>
          <div>
            <p className="font-medium">Kamera/CCTV</p>
            <p className="text-gray-600">CAMERA_IP, CAMERA_PORT, CAMERA_USERNAME</p>
          </div>
          <div>
            <p className="font-medium">API Za Juu</p>
            <p className="text-gray-600">API_KEY_EXTERNAL, WEBHOOK_URL</p>
          </div>
        </div>
      </div>
    </div>
  );
}
