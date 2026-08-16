"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, CheckCircle, AlertCircle, Zap, Printer, Scale } from "lucide-react";

type WizardStep = "welcome" | "database" | "hardware" | "payments" | "notifications" | "complete";

export default function SetupWizardPage() {
  const router = useRouter();
  const [step, setStep] = useState<WizardStep>("welcome");
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
      const response = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "SETUP_WIZARD_CONFIG",
          value: JSON.stringify(config),
        }),
      });
      if (response.ok) {
        handleNext();
      }
    } catch (error) {
      console.error("Setup wizard config save failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition ${
                    steps.indexOf(step) >= i
                      ? "bg-blue-600 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`h-1 w-12 mx-2 transition ${
                      steps.indexOf(step) > i ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-sm font-medium text-gray-700">
            Step {steps.indexOf(step) + 1} of {steps.length}
          </p>
        </div>

        {/* Content Cards */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Welcome Step */}
          {step === "welcome" && (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="text-blue-600" size={40} />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Karibu MavunoOne!</h1>
              <p className="text-gray-600 text-lg mb-2">
                Waziri wa biashara ya nafaka na bidhaa za kimataifa
              </p>
              <p className="text-gray-500 mb-8">
                Tutakusaidia kuweka maalum mahali na vifaa kwa ajili ya kufanya kazi bila shida.
              </p>
              <button
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 mx-auto transition"
              >
                Endelea <ChevronRight size={20} />
              </button>
            </div>
          )}

          {/* Database Configuration Step */}
          {step === "database" && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Jifunze Hifadhidata</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jina la Biashara</label>
                  <input
                    type="text"
                    value={config.businessName}
                    onChange={(e) => setConfig({ ...config, businessName: e.target.value })}
                    placeholder="MavunoOne Dar es Salaam"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mahali (Jiji/Kanda)</label>
                  <input
                    type="text"
                    value={config.location}
                    onChange={(e) => setConfig({ ...config, location: e.target.value })}
                    placeholder="Dar es Salaam, Tanzania"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sehemu Nyingi</label>
                  <select
                    value={config.timezone}
                    onChange={(e) => setConfig({ ...config, timezone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Africa/Dar_es_Salaam">Afrika/Dar es Salaam (EAT)</option>
                    <option value="Africa/Nairobi">Afrika/Nairobi (EAT)</option>
                    <option value="Africa/Lagos">Afrika/Lagos (WAT)</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <button
                  onClick={handleBack}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition"
                >
                  Rudi
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
                >
                  Endelea <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Hardware Step */}
          {step === "hardware" && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Vifaa Vya Mtandao</h2>
              <div className="space-y-6">
                {/* Thermal Printer */}
                <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 transition">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Printer className="text-gray-600" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">Printa ya Mkazo</h3>
                      <p className="text-sm text-gray-600 mt-1">USB au Mtandao ESC/POS printa kwa kutolewa tikiti</p>
                      <div className="mt-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={config.thermalPrinter.enabled}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                thermalPrinter: { ...config.thermalPrinter, enabled: e.target.checked },
                              })
                            }
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-gray-700">Unakuwa na printa?</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weighing Scale */}
                <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 transition">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Scale className="text-gray-600" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">Kiwanja cha Kupima</h3>
                      <p className="text-sm text-gray-600 mt-1">Mgawanyiko wa kiwanja kwa ukubwa uliotakiwa na upimaji wa harvested bidhaa</p>
                      <div className="mt-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={config.scale.enabled}
                            onChange={(e) =>
                              setConfig({
                                ...config,
                                scale: { ...config.scale, enabled: e.target.checked },
                              })
                            }
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-gray-700">Unakuwa na kiwanja?</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={handleBack}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition"
                >
                  Rudi
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
                >
                  Endelea <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Payments Step */}
          {step === "payments" && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Njia za Malipo</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                <AlertCircle className="text-blue-600 mt-0.5" size={20} />
                <div>
                  <p className="text-sm font-medium text-blue-900">API Keys ni siri</p>
                  <p className="text-xs text-blue-700 mt-1">Hizi hazitaka kuanguka katika logs au history. Tumia .env faili.</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 cursor-pointer mb-3">
                    <input
                      type="checkbox"
                      checked={config.mpesa.enabled}
                      onChange={(e) =>
                        setConfig({ ...config, mpesa: { ...config.mpesa, enabled: e.target.checked } })
                      }
                      className="w-4 h-4"
                    />
                    <span className="font-medium text-gray-900">M-Pesa API (SAR-PM)</span>
                  </label>
                  {config.mpesa.enabled && (
                    <input
                      type="password"
                      placeholder="API Key (stored securely)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  )}
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={handleBack}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition"
                >
                  Rudi
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
                >
                  Endelea <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Notifications Step */}
          {step === "notifications" && (
            <div className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Taarifa za Haraka</h2>
              <p className="text-gray-600 mb-6">
                Taarifa za SMS na barua pepe kwa ajili ya mauzo, bidhaa chache, na matukio mengine.
              </p>
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="text-green-600" size={20} />
                    <h3 className="font-bold text-gray-900">NextSMS Integration</h3>
                  </div>
                  <p className="text-sm text-gray-700">SMS taarifa kwa mauzo, deni, na bidhaa chache zilisanidiwa tayari.</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <span className="font-medium text-gray-900">Resend (Barua pepe) Integration</span>
                  </label>
                  <p className="text-sm text-gray-600 mt-2">
                    Kupitisha barua pepe kwa kupiga hatua za password reset na kumkamata kosa.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={handleBack}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition"
                >
                  Rudi
                </button>
                <button
                  onClick={handleSaveConfig}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
                >
                  Kamilisha Hifadhidata <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Complete Step */}
          {step === "complete" && (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="text-green-600" size={40} />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Umekamilisha!</h1>
              <p className="text-gray-600 text-lg mb-2">
                MavunoOne imesanidiwa na tayari kwa mauzo.
              </p>
              <p className="text-gray-500 mb-8">
                Unaweza sasa kuanza kutuma, kufanya biashara, na kueneza bidhaa zaidi.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => router.push("/office")}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 mx-auto transition"
                >
                  Kwenda Nyumbani
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
