"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, CheckCircle, AlertCircle, Zap, Printer, Scale, ShieldCheck } from "lucide-react";

type WizardStep = "welcome" | "database" | "hardware" | "payments" | "notifications" | "complete";

export default function SetupWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>("welcome");
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    businessName: "",
    location: "",
    timezone: "Africa/Dar_es_Salaam",
    thermalPrinter: { enabled: false, model: "ESC/POS" },
    scale: { enabled: false, model: "URID" },
    mpesa: { enabled: false, apiKey: "" },
    resend: { enabled: false, apiKey: "" },
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

  const handleSaveConfig = async () => {
    try {
      setSaving(true);
      const response = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "SETUP_WIZARD_CONFIG",
          value: JSON.stringify(config),
          description: "Initial MavunoOne setup configuration",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save setup configuration");
      }

      handleNext();
    } catch (error) {
      console.error("Setup wizard config save failed:", error);
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
                  onClick={handleSaveConfig}
                  disabled={saving}
                  className="flex-1 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-3 font-black text-emerald-950 transition hover:brightness-110 disabled:opacity-60"
                >
                  {saving ? "Inahifadhi..." : "Hifadhi na Endelea"}
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

              <div className="mt-8 flex gap-4">
                <button
                  onClick={handleBack}
                  className="flex-1 rounded-lg border border-emerald-700 bg-emerald-950/50 px-4 py-3 font-bold text-emerald-100 transition hover:bg-emerald-900"
                >
                  Rudi
                </button>
                <button
                  onClick={handleSaveConfig}
                  disabled={saving}
                  className="flex-1 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-3 font-black text-emerald-950 transition hover:brightness-110 disabled:opacity-60"
                >
                  {saving ? "Inahifadhi..." : "Hifadhi na Endelea"}
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
                <div>
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-emerald-200">LIPA API</label>
                  <input
                    type="text"
                    value={config.mpesa.apiKey}
                    onChange={(e) => setConfig({ ...config, mpesa: { ...config.mpesa, apiKey: e.target.value } })}
                    className="w-full rounded-lg border border-emerald-800 bg-[#041915] px-4 py-3 text-white placeholder-emerald-600 outline-none focus:border-amber-400"
                    placeholder="Enter Lipa API key"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-emerald-200">Resend API</label>
                  <input
                    type="text"
                    value={config.resend.apiKey}
                    onChange={(e) => setConfig({ ...config, resend: { ...config.resend, apiKey: e.target.value } })}
                    className="w-full rounded-lg border border-emerald-800 bg-[#041915] px-4 py-3 text-white placeholder-emerald-600 outline-none focus:border-amber-400"
                    placeholder="Enter Resend key"
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <button onClick={handleBack} className="flex-1 rounded-lg border border-emerald-700 bg-emerald-950/50 px-4 py-3 font-bold text-emerald-100 hover:bg-emerald-900">
                  Rudi
                </button>
                <button onClick={handleSaveConfig} disabled={saving} className="flex-1 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-3 font-black text-emerald-950 hover:brightness-110 disabled:opacity-60">
                  {saving ? "Inahifadhi..." : "Hifadhi na Endelea"}
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
                <button onClick={handleSaveConfig} disabled={saving} className="flex-1 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-3 font-black text-emerald-950 hover:brightness-110 disabled:opacity-60">
                  {saving ? "Inahifadhi..." : "Hifadhi na Maliza"}
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

