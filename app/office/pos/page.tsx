"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, ShoppingCart, Trash2, DollarSign } from "lucide-react";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  // Mock products
  const products = [
    { id: 1, name: "Mahindi (Raw)", price: 9000, quantity: 50 },
    { id: 2, name: "Unga wa Mahindi", price: 18000, quantity: 12 },
    { id: 3, name: "Uduvi (Bran)", price: 4500, quantity: 8 },
    { id: 4, name: "Pumba (Meal)", price: 15000, quantity: 5 },
    { id: 5, name: "Kahdarikaa", price: 12000, quantity: 25 },
    { id: 6, name: "Alizeti (Raw)", price: 30000, quantity: 10 },
    { id: 7, name: "Mafuta Alizeti", price: 65000, quantity: 3 },
    { id: 8, name: "Chokaa (Limestone)", price: 2500, quantity: 40 },
    { id: 9, name: "Animal Feeds", price: 25000, quantity: 15 },
  ];

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: typeof products[0]) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1, total: item.price * (item.quantity + 1) }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1, total: product.price }]);
    }
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">POS - Mauzo</h1>
        <p className="text-gray-600 mt-2">Ongeza bidhaa kwenye karata</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Products */}
        <div className="col-span-2">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tafuta bidhaa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition cursor-pointer"
                onClick={() => addToCart(product)}>
                <div className="relative h-24 w-full bg-gray-200">
                  <Image
                    src={
                      product.id % 3 === 0
                        ? "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop"
                        : product.id % 3 === 1
                        ? "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&h=300&fit=crop"
                        : "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop"
                    }
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition"></div>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-gray-900 text-sm">{product.name}</h3>
                  <p className="text-green-600 font-bold mt-1">TZS {product.price.toLocaleString()}</p>
                  <p className="text-gray-500 text-xs mt-1">Stock: {product.quantity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div className="bg-white p-6 rounded-lg shadow h-fit sticky top-6">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart size={20} className="text-green-600" />
            <h3 className="text-lg font-bold text-gray-900">Karata</h3>
          </div>

          <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Hakuna bidhaa kwenye karata</p>
            ) : (
              cart.map(item => (
                <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-600">{item.quantity} x TZS {item.price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-green-600">
                      {item.total.toLocaleString()}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-700">Jumla:</span>
              <span className="text-2xl font-bold text-green-600">
                TZS {totalAmount.toLocaleString()}
              </span>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 mb-2">Njia ya Malipo</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              >
                <option value="cash">Pesa Taslimu</option>
                <option value="mpesa">M-Pesa</option>
                <option value="credit">Deni (Credit)</option>
              </select>
            </div>

            <button
              disabled={cart.length === 0}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-300"
            >
              <DollarSign className="inline mr-2" size={20} />
              Kamilisha Malipo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
