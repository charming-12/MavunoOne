"use client";

import { useEffect, useState } from "react";
import { CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

type ProviderInstruction = { name: string | null; number: string | null };
type PaymentInstructions = { enabled: boolean; provider: string | null; merchantName: string | null; merchantNumber: string | null; mpesa: ProviderInstruction | null; tigopesa: ProviderInstruction | null };

export default function OrderPage() {
  const [step, setStep] = useState(1);
  const [cartTotal, setCartTotal] = useState(0);
  const [paymentInstructions, setPaymentInstructions] = useState<PaymentInstructions>({ enabled: false, provider: null, merchantName: null, merchantNumber: null, mpesa: null, tigopesa: null });

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("mavunoone-shop-cart");
      const items = saved ? (JSON.parse(saved) as Array<{ price: number; quantity: number }>) : [];
      window.setTimeout(() => setCartTotal(items.reduce((sum, item) => sum + item.price * item.quantity, 0)), 0);
    } catch {
      window.setTimeout(() => setCartTotal(0), 0);
    }
  }, []);

  useEffect(() => {
    fetch("/api/payment/instructions")
      .then((response) => response.json())
      .then((data) => setPaymentInstructions(data))
      .catch(() => setPaymentInstructions({ enabled: false, provider: null, merchantName: null, merchantNumber: null, mpesa: null, tigopesa: null }));
  }, []);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    paymentMethod: "cash",
  });
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [submitError, setSubmitError] = useState("");
  const activePayment = formData.paymentMethod === "mpesa" ? paymentInstructions.mpesa : formData.paymentMethod === "tigopesa" ? paymentInstructions.tigopesa : null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    try {
      const saved = window.localStorage.getItem("mavunoone-shop-cart");
      const cartItems = saved ? (JSON.parse(saved) as Array<{ id: number; quantity: number }>) : [];
      if (cartItems.length === 0) {
        setSubmitError("Kikapu chako hakina bidhaa. Rudi Shop uanze tena.");
        return;
      }
      const response = await fetch("/api/shop/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, items: cartItems.map((item) => ({ productId: item.id, quantity: item.quantity })) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Oda haikuweza kuhifadhiwa.");
      window.localStorage.removeItem("mavunoone-shop-cart");
      setOrderNumber(data.orderNumber || "");
      setOrderPlaced(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Oda haikuweza kuhifadhiwa.");
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="card text-center max-w-md">
          <CheckCircle className="mx-auto text-green-600 mb-4" size={64} />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Oda yako imepokelewa</h1>
          <p className="text-gray-600 mb-4">
            Jina la Oda: <strong>{orderNumber || "Linasubiri"}</strong>
          </p>
          <p className="text-gray-600 mb-6">
            Timu ya MavunoOne itawasiliana nawe kuthibitisha malipo na muda wa delivery.
          </p>
          <div className="space-y-3">
            <Link href="/shop">
              <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold">
                Rudi Kwenye Shop
              </button>
            </Link>
            <Link href="/" className="block text-sm font-semibold text-emerald-700 hover:text-emerald-800">
              Rudi Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
            <Link href="/shop/cart">
              <button className="p-2 hover:bg-green-500 rounded-lg transition">
                <ArrowLeft size={24} />
              </button>
            </Link>
            <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-100">MavunoOne Shop</p><h1 className="text-2xl font-bold">Kamilisha oda yako</h1></div>
            </div>
            <Link href="/" className="rounded-lg border border-white/20 px-3 py-2 text-sm font-bold text-emerald-50 hover:bg-white/10">Home</Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                  step >= i ? "bg-green-600" : "bg-gray-300"
                }`}
              >
                {i}
              </div>
              <div
                className={`flex-1 h-1 mx-2 ${
                  step > i ? "bg-green-600" : "bg-gray-300"
                }`}
              />
            </div>
          ))}
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
              step >= 3 ? "bg-green-600" : "bg-gray-300"
            }`}
          >
            3
          </div>
        </div>

        {/* Form */}
        {submitError && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{submitError}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Personal Info */}
          {step >= 1 && (
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Taarifa za Mteja</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jina Kamili *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder="Jina lako"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Namba ya Simu *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder="0712345678"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="jina@example.com"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Delivery Address */}
          {step >= 2 && (
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Anwani ya delivery</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Anwani Kamili *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    placeholder="Mtaa, kijiji, wilaya au eneo la delivery"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jiji / Wilaya *
                  </label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  >
                    <option value="">-- Chagua --</option>
                    <option value="tabora">Tabora</option>
                    <option value="dar">Dar es Salaam</option>
                    <option value="morogoro">Morogoro</option>
                    <option value="iringa">Iringa</option>
                    <option value="dodoma">Dodoma</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Payment Method */}
          {step >= 3 && (
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Njia ya Malipo</h2>
              <div className="space-y-3">
                {["cash", "mpesa", "tigopesa", "bank"].map((method) => (
                  <label key={method} className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50" style={{
                    borderColor: formData.paymentMethod === method ? '#16a34a' : '#e5e7eb'
                  }}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={formData.paymentMethod === method}
                      onChange={handleInputChange}
                      className="mr-3"
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        {method === "cash" && "Pesa Taslimu (COD)"}
                        {method === "mpesa" && "M-Pesa"}
                        {method === "tigopesa" && "Tigo Pesa / Mixx by Yas"}
                        {method === "bank" && "Benki"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {method === "cash" && "Lipi mlangoni"}
                        {method === "mpesa" && "Lipa kwa namba ya Vodacom M-Pesa"}
                        {method === "tigopesa" && "Lipa kwa namba ya Tigo Pesa / Mixx by Yas"}
                        {method === "bank" && "Toka benki yako"}
                      </p>
                    </div>
                  </label>
                ))}
                {(formData.paymentMethod === "mpesa" || formData.paymentMethod === "tigopesa") && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"><p className="font-bold">Maelekezo ya {formData.paymentMethod === "mpesa" ? "M-Pesa" : "Tigo Pesa / Mixx by Yas"}</p>{paymentInstructions.enabled && activePayment?.number ? <p className="mt-1">Tuma TZS {cartTotal.toLocaleString()} kwenda <strong>{activePayment.number}</strong>{activePayment.name ? <> ({activePayment.name})</> : null}. Tutathibitisha oda baada ya mawasiliano ya simu.</p> : <p className="mt-1">Lipa Number ya {formData.paymentMethod === "mpesa" ? "M-Pesa" : "Tigo Pesa"} bado haijawekwa. Admin aweke namba yake kwenye Setup Wizard.</p>}</div>}
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="card border-l-4 border-green-600 shadow-lg">
            <div className="flex justify-between mb-2">
              <span>Jumla Bidhaa</span>
              <span className="font-bold">TZS {cartTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between mb-4 text-gray-600 text-sm">
              <span>Kodi (18%)</span>
              <span>TZS {(cartTotal * 0.18).toLocaleString()}</span>
            </div>
            <div className="border-t pt-4 flex justify-between text-xl font-bold">
              <span>Jumla Malipo</span>
              <span className="text-green-600">TZS {(cartTotal * 1.18).toLocaleString()}</span>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition font-semibold"
              >
                Nyuma
              </button>
            )}

            <button
              type="submit"
              className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold"
            >
              {step < 3 ? "Endelea" : "Hifadhi Oda"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
