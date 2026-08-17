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
  const [resetting, setResetting] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [lastBackup, setLastBackup] = useState<{ id: number; label: string; createdAt: string } | null>(null);
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

    const loadLastBackup = async () => {
      try {
        const response = await fetch("/api/admin/reset-data");
        if (!response.ok) return;
        const data = await response.json();
        setLastBackup(data.lastBackup ?? null);
      } catch {
        setLastBackup(null);
      }
    };

    void loadConfigs();
    void loadReadyState();
    void loadLastBackup();
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

  const handleResetSampleData = async () => {
    const confirmed = window.confirm(
      "⚠️ ONYO: Je, una uhakika unataka kufuta data zote za majaribio? Hatua hii itasafisha mfumo kabla ya hapo, lakini unaweza kuzirejesha."
    );

    if (!confirmed) return;

    try {
      setResetting(true);
      const response = await fetch("/api/admin/reset-data", { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Reset failed");
      }

      setMessage({ type: "success", text: data.message || "Data zote za majaribio zimesafishwa." });
      const lastBackupResponse = await fetch("/api/admin/reset-data");
      if (lastBackupResponse.ok) {
        const lastBackupData = await lastBackupResponse.json();
        setLastBackup(lastBackupData.lastBackup ?? null);
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Imeshindwa kusafisha data za majaribio.",
      });
    } finally {
      setResetting(false);
    }
  };

  const handleRestoreLastBackup = async () => {
    try {
      setRestoring(true);
      const response = await fetch("/api/admin/restore-backup", { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Restore failed");
      }

      setMessage({ type: "success", text: data.message || "Backup ya mwisho imewekwa tena." });
      const lastBackupResponse = await fetch("/api/admin/reset-data");
      if (lastBackupResponse.ok) {
        const lastBackupData = await lastBackupResponse.json();
        setLastBackup(lastBackupData.lastBackup ?? null);
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Imeshindwa kurejesha backup ya mwisho.",
      });
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-white">⚙️ Mipangilio ya Mfumo</h1>
        <p className="text-emerald-200 mt-3 font-semibold">Pange akaunti za fedha, SMS, na kamera bila kuandika nambari mbili</p>
      </div>

      <div
        className={`mb-6 rounded-lg border p-5 ${
          readyState.ready
            ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-100"
            : "border-amber-400/40 bg-amber-500/15 text-amber-100"
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

      <div className="mb-8 rounded-lg border border-amber-400/40 bg-[#0a1e18]/70 p-6 backdrop-blur-sm shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-black text-amber-300 uppercase tracking-wider">System Safety Tools</h2>
            <p className="mt-2 text-sm text-emerald-200">
              Safisha data za majaribio kwa usalama na urejeshe backup ya mwisho ukihitaji.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleResetSampleData}
              disabled={resetting}
              className="rounded-lg border border-red-400/50 bg-red-500/15 px-4 py-2 text-sm font-bold text-red-200 transition hover:bg-red-500/25 disabled:opacity-60"
            >
              {resetting ? "Inasafisha..." : "Reset Sample Data"}
            </button>

            <button
              type="button"
              onClick={handleRestoreLastBackup}
              disabled={restoring || !lastBackup}
              className="rounded-lg border border-emerald-400/50 bg-emerald-500/15 px-4 py-2 text-sm font-bold text-emerald-200 transition hover:bg-emerald-500/25 disabled:opacity-50"
            >
              {restoring ? "Inarejesha..." : "Restore Last Backup"}
            </button>
          </div>
        </div>

        {lastBackup ? (
          <div className="mt-4 rounded-lg border border-emerald-900/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
            Backup ya mwisho: <span className="font-bold">{lastBackup.label}</span> — {new Date(lastBackup.createdAt).toLocaleString("sw-TZ")}
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-amber-400/30 bg-amber-500/10 p-3 text-sm text-amber-100">
            Hakuna backup ya mwisho iliyohifadhiwa bado.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="bg-[#0a1e18]/60 rounded-lg shadow-lg border border-emerald-900/30 p-6 backdrop-blur-sm">
          <h2 className="text-xl font-black mb-4 text-amber-300 uppercase tracking-wider">Ongeza Mipangilio Mpya</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-emerald-200 mb-2 uppercase tracking-wider">
                Jina la Funguo
              </label>
              <input
                type="text"
                value={formData.key}
                onChange={(e) =>
                  setFormData({ ...formData, key: e.target.value.toUpperCase() })
                }
                placeholder="LIPA_NUMBER, CAMERA_IP, etc."
                className="w-full px-3 py-2 border border-emerald-900/30 rounded-lg bg-[#051511] text-white placeholder-emerald-600 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-emerald-200 mb-2 uppercase tracking-wider">
                Thamani
              </label>
              <textarea
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
                placeholder="Ingiza thamani..."
                rows={3}
                className="w-full px-3 py-2 border border-emerald-900/30 rounded-lg bg-[#051511] text-white placeholder-emerald-600 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-emerald-200 mb-2 uppercase tracking-wider">
                Maelezo (Kawaida)
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Maelezo kuhusu parameta hii..."
                className="w-full px-3 py-2 border border-emerald-900/30 rounded-lg bg-[#051511] text-white placeholder-emerald-600 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isEncrypted}
                onChange={(e) =>
                  setFormData({ ...formData, isEncrypted: e.target.checked })
                }
                className="w-4 h-4 accent-amber-400"
              />
              <span className="text-sm text-emerald-200 font-semibold">Matibabu kama siri (iliyosimbwa)</span>
            </label>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 font-black py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 uppercase tracking-wide"
            >
              <Save size={18} />
              {saving ? "Inakosavua..." : "Okoa Mipangilio"}
            </button>
          </form>
        </div>

        {/* List Section */}
        <div className="bg-[#0a1e18]/60 rounded-lg shadow-lg border border-emerald-900/30 p-6 backdrop-blur-sm">
          <h2 className="text-xl font-black mb-4 text-amber-300 uppercase tracking-wider">Mipangilio Iliyookoa</h2>
          {loading ? (
            <p className="text-emerald-400">Inapakua...</p>
          ) : configs.length === 0 ? (
            <p className="text-emerald-500">Hakuna mipangilio iliyookoa</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {configs.map((config) => (
                <div
                  key={config.id}
                  className="p-3 border border-emerald-900/30 rounded-lg bg-[#051511] hover:bg-emerald-500/10 transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-amber-300">{config.key}</p>
                      {config.description && (
                        <p className="text-sm text-emerald-300">{config.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type={showValues[config.key] ? "text" : "password"}
                          value={config.value}
                          readOnly
                          className="text-xs bg-[#07150f] text-emerald-300 p-1 rounded w-32 border border-emerald-900/30"
                        />
                        <button
                          onClick={() =>
                            setShowValues({
                              ...showValues,
                              [config.key]: !showValues[config.key],
                            })
                          }
                          className="text-emerald-400 hover:text-amber-300 transition"
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
                      className="text-red-400 hover:text-red-300 ml-2 transition"
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
      <div className="mt-8 bg-gradient-to-r from-emerald-500/20 to-amber-500/20 border border-emerald-400/30 rounded-lg p-6">
        <h3 className="font-black text-amber-300 mb-4 uppercase tracking-wider">💡 Mipangilio Inayopendekezwa</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-bold text-emerald-300">Mkopo wa Fedha</p>
            <p className="text-emerald-200 mt-1">LIPA_NUMBER, LIPA_BUSINESS_KEY, LIPA_PASSWORD</p>
          </div>
          <div>
            <p className="font-bold text-emerald-300">Kamera/CCTV</p>
            <p className="text-emerald-200 mt-1">CAMERA_IP, CAMERA_PORT, CAMERA_USERNAME</p>
          </div>
          <div>
            <p className="font-bold text-emerald-300">API Za Juu</p>
            <p className="text-emerald-200 mt-1">API_KEY_EXTERNAL, WEBHOOK_URL</p>
          </div>
        </div>
      </div>
    </div>
  );
}
