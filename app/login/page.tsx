"use client";

import { useState } from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DEFAULT_SUPER_ADMIN_EMAIL, DEFAULT_SUPER_ADMIN_PASSWORD, DEFAULT_BOSS_EMAIL, DEFAULT_BOSS_PASSWORD, writeStoredUser } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Barua pepe au neno la siri silizoifikiwa. Jaribu tena.");
      }

      writeStoredUser(result.user);

      const role = result.user.role;

      if (role === "boss" || role === "admin" || role === "owner") {
        router.push("/boss");
        return;
      }

      if (role === "manager" || role === "cashier" || role === "storekeeper" || role === "machine_operator") {
        router.push("/office");
        return;
      }

      router.push("/shop");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Login failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400 opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-400 opacity-5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-black text-white mb-2 tracking-tight">🌾 MavunoOne</h1>
          <p className="text-yellow-300 font-semibold">Mfumo wa Usimamizi wa Biashara</p>
          <p className="text-green-100 text-sm mt-1">Mahindi • Alizeti • Kusaga • Uwasilishaji</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Ingia kwenye Akaunti</h2>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-4 rounded">
              <div className="flex items-center gap-2">
                <AlertCircle className="text-red-600" size={20} />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Barua Pepe
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="admin@mavunoone.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Neno la Siri
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-600 hover:text-gray-900"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="mt-2 text-right">
                <Link href="/forgot-password" className="text-sm text-green-600 hover:text-green-700 font-medium">
                  Badili nenosiri? 🔐
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Ingia..." : "Ingia"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t">
            <p className="text-center text-gray-700 text-sm font-semibold mb-4">� Jinsi ya Kufanya Kazi</p>
            <div className="space-y-3">
              <div className="flex gap-3 bg-gray-50 p-3 rounded-lg">
                <span className="text-2xl flex-shrink-0">1️⃣</span>
                <div>
                  <p className="font-semibold text-gray-900 text-xs">Ingiza Bidhaa</p>
                  <p className="text-gray-600 text-xs mt-0.5">Ongeza mahindi, alizeti, na pembejeo zingine kwenye mfumo</p>
                </div>
              </div>
              <div className="flex gap-3 bg-gray-50 p-3 rounded-lg">
                <span className="text-2xl flex-shrink-0">2️⃣</span>
                <div>
                  <p className="font-semibold text-gray-900 text-xs">Duka Online (Shop)</p>
                  <p className="text-gray-600 text-xs mt-0.5">Wauzaji wanunulia moja kwa moja kwenye huduma ya mteja</p>
                </div>
              </div>
              <div className="flex gap-3 bg-gray-50 p-3 rounded-lg">
                <span className="text-2xl flex-shrink-0">3️⃣</span>
                <div>
                  <p className="font-semibold text-gray-900 text-xs">Usafiri & Uwasilishaji</p>
                  <p className="text-gray-600 text-xs mt-0.5">Kuunda agizo na kutuma kwa wauzaji kwa njia ya GPS</p>
                </div>
              </div>
              <div className="flex gap-3 bg-gray-50 p-3 rounded-lg">
                <span className="text-2xl flex-shrink-0">4️⃣</span>
                <div>
                  <p className="font-semibold text-gray-900 text-xs">Ripoti Haraka</p>
                  <p className="text-gray-600 text-xs mt-0.5">Angalia faida, mauzo, na habari kwa sekunde</p>
                </div>
              </div>
            </div>
            <p className="text-center text-gray-500 text-xs mt-4">✨ Mfumo wa MavunoOne unasaidia wakulima kutoka shambani hadi sokoni</p>
          </div>
        </div>

        {/* Features Info */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white bg-opacity-10 backdrop-blur text-white rounded-lg p-3 text-center">
            <p className="text-2xl mb-1">📊</p>
            <p className="text-xs font-semibold">Ripoti Haraka</p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur text-white rounded-lg p-3 text-center">
            <p className="text-2xl mb-1">🚚</p>
            <p className="text-xs font-semibold">Usafiri GPS</p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur text-white rounded-lg p-3 text-center">
            <p className="text-2xl mb-1">📱</p>
            <p className="text-xs font-semibold">Simu PWA</p>
          </div>
        </div>

        {/* Back to Landing */}
        <div className="text-center mt-6">
          <Link href="/">
            <button className="text-yellow-300 hover:text-yellow-200 text-sm underline transition">
              ← Back
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
