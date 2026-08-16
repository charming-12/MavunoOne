"use client";

import { useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";

const mockCart = [
  { id: 1, name: "Mahindi", price: 2500, quantity: 2 },
  { id: 2, name: "Unga wa Mahindi", price: 3000, quantity: 1 },
  { id: 6, name: "Mafuta Alizeti", price: 12000, quantity: 1 },
];

export default function CartPage() {
  const [cart, setCart] = useState(mockCart);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.18; // 18% VAT
  const total = subtotal + tax;

  const handleRemove = (id: number) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const handleQuantityChange = (id: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemove(id);
    } else {
      setCart(
        cart.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/shop">
              <button className="p-2 hover:bg-green-500 rounded-lg transition">
                <ArrowLeft size={24} />
              </button>
            </Link>
            <h1 className="text-2xl font-bold">Kikapu Chako</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {cart.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 text-lg">Kikapu chako kina kitu chochote</p>
            <Link href="/shop">
              <button className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition">
                Rudi Kwenye Shop
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="md:col-span-2 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="card flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-green-600 font-bold">
                      TZS {item.price.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity - 1)
                        }
                        className="px-3 py-2 hover:bg-gray-100"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(item.id, parseInt(e.target.value) || 0)
                        }
                        className="w-12 text-center border-l border-r focus:outline-none"
                      />
                      <button
                        onClick={() =>
                          handleQuantityChange(item.id, item.quantity + 1)
                        }
                        className="px-3 py-2 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>

                    <p className="w-24 text-right font-bold text-gray-900">
                      TZS{" "}
                      {(item.price * item.quantity).toLocaleString()}
                    </p>

                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-red-600 hover:text-red-800 p-2"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="card h-fit">
              <h2 className="text-lg font-semibold mb-4">Muhtasari</h2>
              <div className="space-y-3 pb-4 border-b">
                <div className="flex justify-between">
                  <span>Bidhaa ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
                  <span className="font-bold">TZS {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Kodi (18%)</span>
                  <span>TZS {tax.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between text-xl font-bold py-4 mb-4">
                <span>Jumla</span>
                <span className="text-green-600">TZS {total.toLocaleString()}</span>
              </div>

              <Link href="/shop/order">
                <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-semibold">
                  Endelea na Oda
                </button>
              </Link>

              <button className="w-full mt-2 border-2 border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition font-semibold">
                Endelea Kununua
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
