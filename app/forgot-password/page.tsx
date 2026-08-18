"use client";

import { useState } from "react";
import { Mail, Phone, ArrowLeft, Loader } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: method === "email" ? email : undefined,
          phone: method === "phone" ? phone : undefined,
          method,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: "error", text: data.message });
      } else {
        setMessage({ type: "success", text: data.message });
        if (method === "phone") {
          router.push("/reset-password?method=sms");
          return;
        }
        setSent(true);
        // Reset form
        setTimeout(() => {
          setEmail("");
          setPhone("");
          setSent(false);
        }, 3000);
      }
    } catch {
      setMessage({ type: "error", text: "Hitilafu inatokea. Jaribu tena." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/login"
            className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-4"
          >
            <ArrowLeft size={18} />
            Rudi kwenye kuingia
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Kumbuka Neno Lako</h1>
          <p className="text-gray-600 mt-2">
            Chagua njia ya kupata neno jipya
          </p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Method Selection */}
        <div className="space-y-3 mb-6">
          <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition" style={{borderColor: method === "email" ? "#16a34a" : "#d1d5db"}}>
            <input
              type="radio"
              name="method"
              value="email"
              checked={method === "email"}
              onChange={() => setMethod("email")}
              className="w-4 h-4"
            />
            <Mail size={20} className="ml-3 text-green-600" />
            <span className="ml-3 font-medium">Kupitia Barua Pepe</span>
          </label>

          <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition" style={{borderColor: method === "phone" ? "#16a34a" : "#d1d5db"}}>
            <input
              type="radio"
              name="method"
              value="phone"
              checked={method === "phone"}
              onChange={() => setMethod("phone")}
              className="w-4 h-4"
            />
            <Phone size={20} className="ml-3 text-green-600" />
            <span className="ml-3 font-medium">Kupitia SMS</span>
          </label>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {method === "email" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Barua Pepe Yako
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@mavunoone.com"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nambari ya Simu
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+255700000000"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading || sent}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader size={18} className="animate-spin" />
                Inapokea...
              </>
            ) : sent ? (
              "✅ Imechelewakwa"
            ) : (
              "Pata Kiunga cha Kuubadilisha"
            )}
          </button>
        </form>

        {/* Footer Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
          <p className="font-semibold mb-2">💡 Dalili za Usalama:</p>
          <ul className="space-y-1 text-xs">
            <li>✓ Kiunga kitaishia baada ya dakika 15</li>
            <li>✓ Moja tu kiunga kwa akaunti</li>
            <li>✓ Hainayshi kuashiria kwa mtu mwingine</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
