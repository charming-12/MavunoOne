"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, CheckCircle, AlertCircle, Zap, Printer, Scale, ShieldCheck } from "lucide-react";

type WizardStep = "welcome" | "database" | "hardware" | "payments" | "notifications" | "complete";

export default function SetupWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>("welcome");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [config, setConfig] = useState({
    businessName: "",
    location: "",
    timezone: "Africa/Dar_es_Salaam",
    thermalPrinter: { enabled: false, model: "ESC/POS", connectionType: "network", ipAddress: "", port: "9100", paperWidth: "80mm", autoCut: true },
    scale: { enabled: false, model: "URID" },
    payment: { enabled: false, provider: "mpesa", integrationMode: "manual", environment: "sandbox", merchantName: "", merchantNumber: "", merchantNameMpesa: "", merchantNumberMpesa: "", merchantNameTigo: "", merchantNumberTigo: "", apiBaseUrl: "", apiKey: "", apiSecret: "", webhookSecret: "", webhookUrl: "" },
    cctv: { enabled: false, brand: "hikvision", protocol: "rtsp", gatewayUrl: "", streamName: "camera_1", host: "", port: "554", username: "", password: "", streamPath: "" },
    gps: { enabled: false, mode: "existing_platform", provider: "teltonika", protocol: "http_webhook", serverUrl: "", webhookToken: "", deviceId: "", vehiclePlateNumber: "", username: "", password: "" },
    notifications: { enabled: false, resendApiKey: "" },
  });

  const steps: WizardStep[] = ["welcome", "database", "hardware", "payments", "notifications", "complete"];

  const handleNext = () => {
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  const handleSaveConfig = async (sectionName: string) => {
    try {
      if (sectionName === "Malipo na Lipa Number" && config.payment.enabled) {
        const p = config.payment;
        const merchantReady = p.provider === "both"
          ? Boolean(p.merchantNameMpesa.trim() && p.merchantNumberMpesa.trim() && p.merchantNameTigo.trim() && p.merchantNumberTigo.trim())
          : p.provider === "mpesa"
            ? Boolean(p.merchantNameMpesa.trim() && p.merchantNumberMpesa.trim())
            : p.provider === "tigopesa"
              ? Boolean(p.merchantNameTigo.trim() && p.merchantNumberTigo.trim())
              : Boolean(p.merchantName.trim() && p.merchantNumber.trim());
        if (!merchantReady) throw new Error("Jaza jina na Lipa Number ya provider uliyochagua kwanza.");
        if (p.integrationMode === "gateway" && (!p.apiBaseUrl.trim() || !p.apiKey.trim() || !p.apiSecret.trim() || !p.webhookSecret.trim())) {
          throw new Error("Gateway mode inahitaji API base URL, API key, API secret na webhook signing secret.");
        }
        if (p.integrationMode === "gateway" && p.environment === "production" && !p.webhookUrl.trim().startsWith("https://")) {
          throw new Error("Production gateway inahitaji webhook URL inayoanza na https://.");
        }
      }
      setSaving(true);
      setSaveMessage("");
      const response = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "SETUP_WIZARD_CONFIG",
          value: JSON.stringify({
            ...config,
            payment: { ...config.payment, apiKey: undefined, apiSecret: undefined, webhookSecret: undefined },
            cctv: { ...config.cctv, password: undefined },
            gps: { ...config.gps, password: undefined },
            notifications: { ...config.notifications, resendApiKey: undefined },
          }),
          description: "Initial MavunoOne setup configuration",
          isEncrypted: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save setup configuration");
      }

      const secretProfiles = [
        { key: "PAYMENT_PROVIDER_SECRETS", value: { apiKey: config.payment.apiKey, apiSecret: config.payment.apiSecret, webhookSecret: config.payment.webhookSecret } },
        { key: "CCTV_CONNECTION_SECRETS", value: { username: config.cctv.username, password: config.cctv.password } },
        { key: "GPS_CONNECTION_SECRETS", value: { username: config.gps.username, password: config.gps.password, webhookToken: config.gps.webhookToken } },
        { key: "NOTIFICATION_SECRETS", value: { resendApiKey: config.notifications.resendApiKey } },
      ];

      for (const profile of secretProfiles) {
        const secretResponse = await fetch("/api/config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            key: profile.key,
            value: JSON.stringify(profile.value),
            description: `Encrypted ${profile.key.toLowerCase()} profile`,
            isEncrypted: true,
          }),
        });
        if (!secretResponse.ok) throw new Error(`Failed to save ${profile.key}`);
      }

      setSaveMessage(`${sectionName} imehifadhiwa kwa mafanikio. Fields ambazo hazijajazwa bado zimeachwa bila kubadilishwa.`);
      handleNext();
    } catch (error) {
      console.error("Setup wizard config save failed:", error);
      setSaveMessage(error instanceof Error ? error.message : "Haikuweza kuhifadhi section hii. Kagua connection kisha jaribu tena.");
    } finally {
      setSaving(false);
    }
  };

  const finishWizard = () => {
    router.push("/office");
  };

  return (
    <div className="min-h-screen bg-[#041915] px-4 py-8 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 rounded-2xl border border-emerald-500/30 bg-[#0a1f1a]/80 p-5 shadow-2xl backdrop-blur-sm">
          <div className="mb-4 flex items-center justify-between">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-black transition ${
                    steps.indexOf(step) >= i
                      ? "bg-amber-400 text-emerald-950"
                      : "bg-emerald-900/60 text-emerald-100"
                  }`}
                >
                  {i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`mx-2 h-1 w-10 rounded-full ${
                      steps.indexOf(step) > i ? "bg-amber-400" : "bg-emerald-800"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-sm font-semibold uppercase tracking-[0.2em] text-emerald-200">
            Step {steps.indexOf(step) + 1} of {steps.length}
          </p>
        </div>

        {saveMessage && <div className="mb-4 flex items-start gap-3 rounded-xl border border-emerald-400/40 bg-emerald-500/10 p-4 text-sm text-emerald-100"><CheckCircle size={18} className="mt-0.5 shrink-0 text-emerald-300" /><span>{saveMessage}</span></div>}

        <div className="overflow-hidden rounded-2xl border border-emerald-500/30 bg-[#0a1f1a]/80 shadow-2xl">
          {step === "welcome" && (
            <div className="p-10 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 text-amber-300">
                <Zap size={40} />
              </div>
              <h1 className="mb-4 text-4xl font-black text-white">Karibu MavunoOne!</h1>
              <p className="mb-2 text-lg text-emerald-100">Waziri wa biashara ya nafaka na bidhaa za kilimo</p>
              <p className="mb-8 text-emerald-200/80">
                Tunakusaidia kuweka mfumo wako kwa usalama, kuvuka mitandao, na kukupa njia ya kazi ya moja kwa moja.
              </p>
              <button
                onClick={handleNext}
                className="mx-auto flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-8 py-3 font-black text-emerald-950 transition hover:brightness-110"
              >
                Endelea <ChevronRight size={20} />
              </button>
            </div>
          )}

          {step === "database" && (
            <div className="p-8">
              <h2 className="mb-6 text-2xl font-black text-amber-300">Taarifa za Biashara</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-emerald-200">Jina la Biashara</label>
                  <input
                    type="text"
                    value={config.businessName}
                    onChange={(e) => setConfig({ ...config, businessName: e.target.value })}
                    placeholder="MavunoOne Dar es Salaam"
                    className="w-full rounded-lg border border-emerald-800 bg-[#041915] px-4 py-3 text-white placeholder-emerald-600 outline-none ring-0 transition focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-emerald-200">Mahali</label>
                  <input
                    type="text"
                    value={config.location}
                    onChange={(e) => setConfig({ ...config, location: e.target.value })}
                    placeholder="Dar es Salaam, Tanzania"
                    className="w-full rounded-lg border border-emerald-800 bg-[#041915] px-4 py-3 text-white placeholder-emerald-600 outline-none transition focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-emerald-200">Timezone</label>
                  <select
                    value={config.timezone}
                    onChange={(e) => setConfig({ ...config, timezone: e.target.value })}
                    className="w-full rounded-lg border border-emerald-800 bg-[#041915] px-4 py-3 text-white outline-none transition focus:border-amber-400"
                  >
                    <option value="Africa/Dar_es_Salaam">Afrika/Dar es Salaam</option>
                    <option value="Africa/Nairobi">Afrika/Nairobi</option>
                    <option value="Africa/Lagos">Afrika/Lagos</option>
                  </select>
                </div>
              </div>
              <div className="mt-8 flex gap-4">
                <button
                  onClick={handleBack}
                  className="flex-1 rounded-lg border border-emerald-700 bg-emerald-950/50 px-4 py-3 font-bold text-emerald-100 transition hover:bg-emerald-900"
                >
                  Rudi
                </button>
                <button
                  onClick={() => handleSaveConfig("Taarifa za biashara")}
                  disabled={saving}
                  className="flex-1 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-3 font-black text-emerald-950 transition hover:brightness-110 disabled:opacity-60"
                >
                  {saving ? "Inahifadhi section..." : "Hifadhi biashara na endelea"}
                </button>
              </div>
            </div>
          )}

          {step === "hardware" && (
            <div className="p-8">
              <h2 className="mb-6 text-2xl font-black text-amber-300">Vifaa vya Kazi</h2>
              <div className="space-y-6">
                <div className="rounded-xl border border-emerald-800 bg-[#041915] p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 text-amber-300">
                      <Printer size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white">Printa ya Mkazo</h3>
                      <p className="mt-1 text-sm text-emerald-200">ESC/POS printa kwa tikiti na risiti.</p>
                      <label className="mt-3 flex items-center gap-2 text-sm text-emerald-100">
                        <input
                          type="checkbox"
                          checked={config.thermalPrinter.enabled}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              thermalPrinter: { ...config.thermalPrinter, enabled: e.target.checked },
                            })
                          }
                          className="h-4 w-4 accent-amber-400"
                        />
                        Niko na printa
                      </label>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <select value={config.thermalPrinter.connectionType} onChange={(e) => setConfig({ ...config, thermalPrinter: { ...config.thermalPrinter, connectionType: e.target.value } })} className="rounded-lg border border-emerald-800 bg-[#071f19] px-3 py-2 text-sm text-white"><option value="network">Network / Ethernet</option><option value="usb">USB kupitia desktop bridge</option></select>
                        <input value={config.thermalPrinter.model} onChange={(e) => setConfig({ ...config, thermalPrinter: { ...config.thermalPrinter, model: e.target.value } })} className="rounded-lg border border-emerald-800 bg-[#071f19] px-3 py-2 text-sm text-white placeholder-emerald-600" placeholder="Model: Epson TM-T20" />
                        {config.thermalPrinter.connectionType === "network" && <input value={config.thermalPrinter.ipAddress} onChange={(e) => setConfig({ ...config, thermalPrinter: { ...config.thermalPrinter, ipAddress: e.target.value } })} className="rounded-lg border border-emerald-800 bg-[#071f19] px-3 py-2 text-sm text-white placeholder-emerald-600" placeholder="Printer IP: 192.168.1.80" />}
                        {config.thermalPrinter.connectionType === "network" && <input value={config.thermalPrinter.port} onChange={(e) => setConfig({ ...config, thermalPrinter: { ...config.thermalPrinter, port: e.target.value } })} className="rounded-lg border border-emerald-800 bg-[#071f19] px-3 py-2 text-sm text-white placeholder-emerald-600" placeholder="Port: 9100" />}
                        <select value={config.thermalPrinter.paperWidth} onChange={(e) => setConfig({ ...config, thermalPrinter: { ...config.thermalPrinter, paperWidth: e.target.value } })} className="rounded-lg border border-emerald-800 bg-[#071f19] px-3 py-2 text-sm text-white"><option value="58mm">Paper 58mm</option><option value="80mm">Paper 80mm</option></select>
                        <label className="flex items-center gap-2 text-sm text-emerald-100"><input type="checkbox" checked={config.thermalPrinter.autoCut} onChange={(e) => setConfig({ ...config, thermalPrinter: { ...config.thermalPrinter, autoCut: e.target.checked } })} className="h-4 w-4 accent-amber-400" />Auto-cut risiti</label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-800 bg-[#041915] p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 text-amber-300">
                      <Scale size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white">Kiwanja cha Kupima</h3>
                      <p className="mt-1 text-sm text-emerald-200">Pima uzito kwa usahihi wa bidhaa.</p>
                      <label className="mt-3 flex items-center gap-2 text-sm text-emerald-100">
                        <input
                          type="checkbox"
                          checked={config.scale.enabled}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              scale: { ...config.scale, enabled: e.target.checked },
                            })
                          }
                          className="h-4 w-4 accent-amber-400"
                        />
                        Niko na scale
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-sky-800 bg-[#041915] p-5">
                  <h3 className="font-bold text-white">CCTV / Kamera</h3>
                  <p className="mt-1 text-xs text-emerald-200">Weka taarifa za DVR/NVR; credentials zitaenda kwenye secret profile.</p>
                  <label className="mt-4 flex items-center gap-2 text-sm text-emerald-100"><input type="checkbox" checked={config.cctv.enabled} onChange={(e) => setConfig({ ...config, cctv: { ...config.cctv, enabled: e.target.checked } })} className="h-4 w-4 accent-amber-400" />Washa CCTV</label>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <input value={config.cctv.gatewayUrl} onChange={(e) => setConfig({ ...config, cctv: { ...config.cctv, gatewayUrl: e.target.value } })} className="rounded-lg border border-emerald-800 bg-[#071f19] px-3 py-2 text-sm text-white placeholder-emerald-600 sm:col-span-2" placeholder="Gateway HTTPS URL (mfano https://...trycloudflare.com)" />
                    <input value={config.cctv.streamName} onChange={(e) => setConfig({ ...config, cctv: { ...config.cctv, streamName: e.target.value } })} className="rounded-lg border border-emerald-800 bg-[#071f19] px-3 py-2 text-sm text-white placeholder-emerald-600" placeholder="Stream name: camera_1" />
                    <select value={config.cctv.brand} onChange={(e) => setConfig({ ...config, cctv: { ...config.cctv, brand: e.target.value } })} className="rounded-lg border border-emerald-800 bg-[#071f19] px-3 py-2 text-sm text-white"><option value="hikvision">Hikvision</option><option value="dahua">Dahua</option><option value="uniview">Uniview</option><option value="cp_plus">CP Plus</option><option value="generic_onvif">Generic ONVIF</option><option value="other">Other</option></select>
                    <select value={config.cctv.protocol} onChange={(e) => setConfig({ ...config, cctv: { ...config.cctv, protocol: e.target.value } })} className="rounded-lg border border-emerald-800 bg-[#071f19] px-3 py-2 text-sm text-white"><option value="gateway_hls">HTTPS Gateway / HLS</option><option value="gateway_webrtc">HTTPS Gateway / WebRTC</option><option value="rtsp">RTSP (DVR/NVR local)</option><option value="onvif">ONVIF</option><option value="hls">HLS URL</option><option value="http">HTTP</option></select>
                    <input value={config.cctv.host} onChange={(e) => setConfig({ ...config, cctv: { ...config.cctv, host: e.target.value } })} className="rounded-lg border border-emerald-800 bg-[#071f19] px-3 py-2 text-sm text-white placeholder-emerald-600" placeholder="IP / hostname" />
                    <input value={config.cctv.port} onChange={(e) => setConfig({ ...config, cctv: { ...config.cctv, port: e.target.value } })} className="rounded-lg border border-emerald-800 bg-[#071f19] px-3 py-2 text-sm text-white placeholder-emerald-600" placeholder="Port: 554" />
                    <input value={config.cctv.username} onChange={(e) => setConfig({ ...config, cctv: { ...config.cctv, username: e.target.value } })} className="rounded-lg border border-emerald-800 bg-[#071f19] px-3 py-2 text-sm text-white placeholder-emerald-600" placeholder="Username" />
                    <input type="password" value={config.cctv.password} onChange={(e) => setConfig({ ...config, cctv: { ...config.cctv, password: e.target.value } })} className="rounded-lg border border-emerald-800 bg-[#071f19] px-3 py-2 text-sm text-white placeholder-emerald-600" placeholder="Password" />
                    <input value={config.cctv.streamPath} onChange={(e) => setConfig({ ...config, cctv: { ...config.cctv, streamPath: e.target.value } })} className="rounded-lg border border-emerald-800 bg-[#071f19] px-3 py-2 text-sm text-white placeholder-emerald-600 sm:col-span-2" placeholder="Stream path (optional)" />
                  </div>
                </div>
                <div className="rounded-xl border border-sky-800 bg-[#041915] p-5">
                  <h3 className="font-bold text-white">GPS Tracker</h3>
                  <p className="mt-1 text-xs text-emerald-200">Chagua mojawapo ya njia mbili kulingana na kama GPS ina platform tayari au itatuma data moja kwa moja.</p>
                  <label className="mt-4 flex items-center gap-2 text-sm text-emerald-100"><input type="checkbox" checked={config.gps.enabled} onChange={(e) => setConfig({ ...config, gps: { ...config.gps, enabled: e.target.checked } })} className="h-4 w-4 accent-amber-400" />Washa GPS</label>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <label className="sm:col-span-2"><span className="mb-2 block text-xs font-bold uppercase tracking-wide text-emerald-200">Njia ya kuunganisha GPS</span><select value={config.gps.mode} onChange={(e) => setConfig({ ...config, gps: { ...config.gps, mode: e.target.value } })} className="w-full rounded-lg border border-emerald-800 bg-[#071f19] px-3 py-2 text-sm text-white"><option value="existing_platform">Existing Platform / App</option><option value="direct_webhook">Direct Webhook kwenda MavunoOne</option></select></label>
                    {config.gps.mode === "existing_platform" ? <div className="rounded-lg border border-sky-700/60 bg-sky-500/10 p-3 text-xs text-sky-100 sm:col-span-2">Tumia mode hii kama provider tayari ana app/server. Weka platform URL, provider, credentials, IMEI na plate number. Hakuna coding ya ziada kwa setup ya kawaida.</div> : <div className="rounded-lg border border-amber-700/60 bg-amber-500/10 p-3 text-xs text-amber-100 sm:col-span-2"><p className="font-bold">Direct Webhook</p><p className="mt-1">MavunoOne itapokea GPS data moja kwa moja. Installer ataweka webhook URL na token hizi kwenye tracker au gateway.</p><p className="mt-2 break-all font-mono text-amber-200">Webhook URL: {typeof window !== "undefined" ? `${window.location.origin}/api/integrations/gps/webhook` : "/api/integrations/gps/webhook"}</p></div>}
                    <select value={config.gps.provider} onChange={(e) => setConfig({ ...config, gps: { ...config.gps, provider: e.target.value } })} className="rounded-lg border border-emerald-800 bg-[#071f19] px-3 py-2 text-sm text-white"><option value="teltonika">Teltonika</option><option value="concox">Concox</option><option value="gt06">GT06 / TK103</option><option value="traccar">Traccar</option><option value="coban">Coban</option><option value="other">Other</option></select>
                    <select value={config.gps.protocol} onChange={(e) => setConfig({ ...config, gps: { ...config.gps, protocol: e.target.value } })} className="rounded-lg border border-emerald-800 bg-[#071f19] px-3 py-2 text-sm text-white"><option value="http_webhook">HTTP webhook</option><option value="traccar_api">Traccar API</option><option value="tcp">TCP gateway</option><option value="other">Other</option></select>
                    <input value={config.gps.serverUrl} onChange={(e) => setConfig({ ...config, gps: { ...config.gps, serverUrl: e.target.value } })} className="rounded-lg border border-emerald-800 bg-[#071f19] px-3 py-2 text-sm text-white placeholder-emerald-600 sm:col-span-2" placeholder={config.gps.mode === "direct_webhook" ? "Gateway/server URL (optional)" : "Existing platform URL / API endpoint"} />
                    {config.gps.mode === "direct_webhook" && <input type="password" value={config.gps.webhookToken} onChange={(e) => setConfig({ ...config, gps: { ...config.gps, webhookToken: e.target.value } })} className="rounded-lg border border-emerald-800 bg-[#071f19] px-3 py-2 text-sm text-white placeholder-emerald-600 sm:col-span-2" placeholder="Webhook token ya siri (optional lakini inapendekezwa)" />}
                    <input value={config.gps.deviceId} onChange={(e) => setConfig({ ...config, gps: { ...config.gps, deviceId: e.target.value } })} className="rounded-lg border border-emerald-800 bg-[#071f19] px-3 py-2 text-sm text-white placeholder-emerald-600" placeholder="Device ID / IMEI" />
                    <input value={config.gps.vehiclePlateNumber} onChange={(e) => setConfig({ ...config, gps: { ...config.gps, vehiclePlateNumber: e.target.value } })} className="rounded-lg border border-emerald-800 bg-[#071f19] px-3 py-2 text-sm text-white placeholder-emerald-600" placeholder="Vehicle plate: T 123 ABC" />
                    <input value={config.gps.username} onChange={(e) => setConfig({ ...config, gps: { ...config.gps, username: e.target.value } })} className="rounded-lg border border-emerald-800 bg-[#071f19] px-3 py-2 text-sm text-white placeholder-emerald-600" placeholder="Platform username (optional)" />
                    <input type="password" value={config.gps.password} onChange={(e) => setConfig({ ...config, gps: { ...config.gps, password: e.target.value } })} className="rounded-lg border border-emerald-800 bg-[#071f19] px-3 py-2 text-sm text-white placeholder-emerald-600" placeholder="Platform password (optional)" />
                  </div>
                  <div className="mt-4 flex items-start gap-3 rounded-lg border border-emerald-800 bg-emerald-950/50 p-3 text-xs text-emerald-100"><div className={`mt-0.5 h-2.5 w-2.5 rounded-full ${config.gps.enabled && config.gps.deviceId ? "bg-amber-300" : "bg-slate-500"}`} /><div><p className="font-bold">{!config.gps.enabled ? "GPS imezimwa" : config.gps.deviceId ? "Ready for first location" : "Waiting for device ID / IMEI"}</p><p className="mt-1 text-emerald-200">Baada ya tracker kutuma data, dashboard itaonyesha last location, speed na muda wa update.</p></div></div>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button
                  onClick={handleBack}
                  className="flex-1 rounded-lg border border-emerald-700 bg-emerald-950/50 px-4 py-3 font-bold text-emerald-100 transition hover:bg-emerald-900"
                >
                  Rudi
                </button>
                <button
                  onClick={() => handleSaveConfig("Vifaa vya kazi, CCTV na GPS")}
                  disabled={saving}
                  className="flex-1 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-3 font-black text-emerald-950 transition hover:brightness-110 disabled:opacity-60"
                >
                  {saving ? "Inahifadhi section..." : "Hifadhi vifaa na endelea"}
                </button>
              </div>
            </div>
          )}

          {step === "payments" && (
            <div className="p-8">
              <h2 className="mb-4 text-2xl font-black text-amber-300">Malipo</h2>
              <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-400/40 bg-amber-500/10 p-4 text-amber-100">
                <AlertCircle className="mt-0.5" size={20} />
                <div>
                  <p className="font-bold">API keys ni siri</p>
                  <p className="text-sm text-amber-100/80">Hifadhi katika .env, usiweke kwenye repo au logs.</p>
                </div>
              </div>
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-sm font-semibold text-emerald-100"><input type="checkbox" checked={config.payment.enabled} onChange={(e) => setConfig({ ...config, payment: { ...config.payment, enabled: e.target.checked } })} className="h-4 w-4 accent-amber-400" />Washa malipo ya simu</label>
                <div className="grid gap-4 rounded-xl border border-emerald-800 bg-[#041915] p-4 sm:grid-cols-2">
                  <div><label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-emerald-200">Njia ya malipo</label><select value={config.payment.integrationMode} onChange={(e) => setConfig({ ...config, payment: { ...config.payment, integrationMode: e.target.value } })} className="w-full rounded-lg border border-emerald-800 bg-[#071f19] px-3 py-2 text-sm text-white"><option value="manual">Manual Lipa Number — Finance athibitishe</option><option value="gateway">API Gateway — automatic callback</option></select></div>
                  <div><label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-emerald-200">Environment</label><select value={config.payment.environment} onChange={(e) => setConfig({ ...config, payment: { ...config.payment, environment: e.target.value } })} className="w-full rounded-lg border border-emerald-800 bg-[#071f19] px-3 py-2 text-sm text-white"><option value="sandbox">Sandbox / Testing — hakuna fedha halisi</option><option value="production">Production — fedha halisi</option></select></div>
                  {config.payment.integrationMode === "gateway" && <>
                    <div className="sm:col-span-2 rounded-lg border border-sky-700/60 bg-sky-500/10 p-3 text-xs leading-5 text-sky-100"><p className="font-black">Gateway setup</p><p className="mt-1">Provider atakupa API base URL, API key/secret na webhook secret. MavunoOne itatumia HTTPS callback hii kuunganisha payment na order:</p><p className="mt-1 break-all font-mono text-sky-200">{typeof window !== "undefined" ? `${window.location.origin}/api/payment/webhook` : "/api/payment/webhook"}</p><p className="mt-1">Usiweke API secret kwenye maelezo ya kawaida; itaenda kwenye encrypted secret profile.</p></div>
                    <div className="sm:col-span-2"><label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-emerald-200">Webhook URL (copy kwa provider)</label><input value={config.payment.webhookUrl || (typeof window !== "undefined" ? `${window.location.origin}/api/payment/webhook` : "/api/payment/webhook")} onChange={(e) => setConfig({ ...config, payment: { ...config.payment, webhookUrl: e.target.value } })} className="w-full rounded-lg border border-emerald-800 bg-[#071f19] px-3 py-2 text-sm text-white" /></div>
                    <div><label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-emerald-200">API secret</label><input type="password" value={config.payment.apiSecret} onChange={(e) => setConfig({ ...config, payment: { ...config.payment, apiSecret: e.target.value } })} className="w-full rounded-lg border border-emerald-800 bg-[#071f19] px-3 py-2 text-sm text-white placeholder-emerald-600" placeholder="Provider API secret" /></div>
                    <div><label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-emerald-200">Webhook signing secret</label><input type="password" value={config.payment.webhookSecret} onChange={(e) => setConfig({ ...config, payment: { ...config.payment, webhookSecret: e.target.value } })} className="w-full rounded-lg border border-emerald-800 bg-[#071f19] px-3 py-2 text-sm text-white placeholder-emerald-600" placeholder="Webhook secret" /></div>
                  </>}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div><label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-emerald-200">Provider</label><select value={config.payment.provider} onChange={(e) => setConfig({ ...config, payment: { ...config.payment, provider: e.target.value } })} className="w-full rounded-lg border border-emerald-800 bg-[#041915] px-4 py-3 text-white"><option value="mpesa">Vodacom M-Pesa</option><option value="tigopesa">Tigo Pesa / Mixx by Yas</option><option value="both">M-Pesa na Tigo Pesa</option><option value="other">Other provider</option></select></div>
                  {(config.payment.provider === "mpesa" || config.payment.provider === "both") && <div className="sm:col-span-2 rounded-xl border border-red-900/60 bg-red-950/20 p-4"><p className="mb-3 text-sm font-black text-red-200">Vodacom M-Pesa</p><div className="grid gap-4 sm:grid-cols-2"><div><label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-emerald-200">Jina la M-Pesa</label><input value={config.payment.merchantNameMpesa} onChange={(e) => setConfig({ ...config, payment: { ...config.payment, merchantNameMpesa: e.target.value } })} className="w-full rounded-lg border border-emerald-800 bg-[#041915] px-4 py-3 text-white placeholder-emerald-600" placeholder="Mfano: MavunoOne M-Pesa" /></div><div><label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-emerald-200">Lipa Number ya M-Pesa</label><input value={config.payment.merchantNumberMpesa} onChange={(e) => setConfig({ ...config, payment: { ...config.payment, merchantNumberMpesa: e.target.value } })} className="w-full rounded-lg border border-emerald-800 bg-[#041915] px-4 py-3 text-white placeholder-emerald-600" placeholder="07XXXXXXXX" /></div></div></div>}
                  {(config.payment.provider === "tigopesa" || config.payment.provider === "both") && <div className="sm:col-span-2 rounded-xl border border-blue-900/60 bg-blue-950/20 p-4"><p className="mb-3 text-sm font-black text-blue-200">Tigo Pesa / Mixx by Yas</p><div className="grid gap-4 sm:grid-cols-2"><div><label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-emerald-200">Jina la Tigo Pesa</label><input value={config.payment.merchantNameTigo} onChange={(e) => setConfig({ ...config, payment: { ...config.payment, merchantNameTigo: e.target.value } })} className="w-full rounded-lg border border-emerald-800 bg-[#041915] px-4 py-3 text-white placeholder-emerald-600" placeholder="Mfano: MavunoOne Tigo Pesa" /></div><div><label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-emerald-200">Lipa Number ya Tigo Pesa</label><input value={config.payment.merchantNumberTigo} onChange={(e) => setConfig({ ...config, payment: { ...config.payment, merchantNumberTigo: e.target.value } })} className="w-full rounded-lg border border-emerald-800 bg-[#041915] px-4 py-3 text-white placeholder-emerald-600" placeholder="06XXXXXXXX" /></div></div></div>}
                  {config.payment.provider === "other" && <div className="sm:col-span-2 grid gap-4 sm:grid-cols-2"><div><label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-emerald-200">Jina la payment provider</label><input value={config.payment.merchantName} onChange={(e) => setConfig({ ...config, payment: { ...config.payment, merchantName: e.target.value } })} className="w-full rounded-lg border border-emerald-800 bg-[#041915] px-4 py-3 text-white placeholder-emerald-600" placeholder="Jina la provider" /></div><div><label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-emerald-200">Merchant number</label><input value={config.payment.merchantNumber} onChange={(e) => setConfig({ ...config, payment: { ...config.payment, merchantNumber: e.target.value } })} className="w-full rounded-lg border border-emerald-800 bg-[#041915] px-4 py-3 text-white placeholder-emerald-600" placeholder="Namba ya provider" /></div></div>}
                  {config.payment.provider !== "other" && <p className="sm:col-span-2 text-xs text-emerald-200/80">Chagua <strong>Both</strong> kama una namba zote mbili. Kila provider atapata jina na Lipa Number yake tofauti.</p>}
                </div>
                <div><label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-emerald-200">Provider API base URL (optional)</label><input value={config.payment.apiBaseUrl} onChange={(e) => setConfig({ ...config, payment: { ...config.payment, apiBaseUrl: e.target.value } })} className="w-full rounded-lg border border-emerald-800 bg-[#041915] px-4 py-3 text-white placeholder-emerald-600" placeholder="Weka tu kama provider amekupa API endpoint" /></div>
                <div><label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-emerald-200">API key / secret (optional)</label><input type="password" value={config.payment.apiKey} onChange={(e) => setConfig({ ...config, payment: { ...config.payment, apiKey: e.target.value } })} className="w-full rounded-lg border border-emerald-800 bg-[#041915] px-4 py-3 text-white placeholder-emerald-600" placeholder="Itahifadhiwa kama secret profile" /></div>
                <p className="text-xs text-amber-100/80">Jina la Lipa Number na namba vitaonekana kwenye payment instructions za mteja. Ukiweka Gateway, bado automatic confirmation itaanza tu baada ya provider ku-approve account, webhook iwe configured, na sandbox test ipite.</p>
              </div>

              <div className="mt-8 flex gap-4">
                <button onClick={handleBack} className="flex-1 rounded-lg border border-emerald-700 bg-emerald-950/50 px-4 py-3 font-bold text-emerald-100 hover:bg-emerald-900">
                  Rudi
                </button>
                <button onClick={() => handleSaveConfig("Malipo na Lipa Number")} disabled={saving} className="flex-1 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-3 font-black text-emerald-950 hover:brightness-110 disabled:opacity-60">
                  {saving ? "Inahifadhi section..." : "Hifadhi malipo na endelea"}
                </button>
              </div>
            </div>
          )}

          {step === "notifications" && (
            <div className="p-8">
              <h2 className="mb-6 text-2xl font-black text-amber-300">Ujumbe na Alert</h2>
              <div className="rounded-xl border border-emerald-800 bg-[#041915] p-5">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-emerald-300" />
                  <div>
                    <h3 className="font-bold text-white">Mfumo umewekwa kwa usalama</h3>
                    <p className="text-sm text-emerald-200">Admin na boss wataendelea kuonekana kama watumiaji wakuu wa mfumo.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button onClick={handleBack} className="flex-1 rounded-lg border border-emerald-700 bg-emerald-950/50 px-4 py-3 font-bold text-emerald-100 hover:bg-emerald-900">
                  Rudi
                </button>
                <button onClick={() => handleSaveConfig("Ujumbe na alerts")} disabled={saving} className="flex-1 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-3 font-black text-emerald-950 hover:brightness-110 disabled:opacity-60">
                  {saving ? "Inahifadhi section..." : "Hifadhi alerts na maliza"}
                </button>
              </div>
            </div>
          )}

          {step === "complete" && (
            <div className="p-12 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 text-amber-300">
                <CheckCircle size={40} />
              </div>
              <h2 className="mb-3 text-3xl font-black text-white">Mfumo umewekwa tayari</h2>
              <p className="mb-8 text-emerald-200">
                Admin, boss, na watumiaji wengine wanaweza kuingia kwenye portal inayofaa kwa kila sehemu.
              </p>
              <button
                onClick={finishWizard}
                className="rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-8 py-3 font-black text-emerald-950 transition hover:brightness-110"
              >
                Nenda kwenye Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

