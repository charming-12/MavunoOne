"use client";

import { useState } from "react";
import { ShoppingCart, Search, MapPin, Phone, Clock } from "lucide-react";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  inStock: boolean;
}

interface CartItem extends Product {
  quantity: number;
}

const mockProducts: Product[] = [
  { id: 1, name: "Mahindi", price: 2500, image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=900&q=80", inStock: true },
  { id: 2, name: "Alizeti", price: 4500, image: "https://images.unsplash.com/photo-1464226184884-fa52ac9c0f6a?auto=format&fit=crop&w=900&q=80", inStock: true },
  { id: 3, name: "Uduvi", price: 5000, image: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?auto=format&fit=crop&w=900&q=80", inStock: true },
  { id: 4, name: "Chakula cha Wanyama", price: 8000, image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=900&q=80", inStock: true },
  { id: 5, name: "Chokaa", price: 3200, image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=900&q=80", inStock: true },
  { id: 6, name: "Mafuta ya Alizeti", price: 12000, image: "https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=900&q=80", inStock: true },
  { id: 7, name: "Sukari", price: 2000, image: "https://images.unsplash.com/photo-1584208124928-20a0d4d9b9f4?auto=format&fit=crop&w=900&q=80", inStock: true },
  { id: 8, name: "Chumvi", price: 1500, image: "https://images.unsplash.com/photo-1604908554102-57c42f0dcb5d?auto=format&fit=crop&w=900&q=80", inStock: true },
];

export default function ShopPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = mockProducts.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddToCart = (product: Product) => {
    const existing = cart.find((c) => c.id === product.id);
    if (existing) {
      setCart(
        cart.map((c) =>
          c.id === product.id ? { ...c, quantity: c.quantity + 1 } : c
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">MavunoOne Shop</h1>
            <Link href="/shop/cart">
              <button className="relative bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center gap-2">
                <ShoppingCart size={20} />
                Kikapu
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </Link>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tafuta bidhaa, pembejeo au chakula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`card flex flex-col items-center justify-between overflow-hidden ${
                !product.inStock ? "opacity-60" : ""
              }`}
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-32 object-cover rounded-t-xl mb-3"
              />
              <div className="px-3 pb-3 w-full">
                <h3 className="font-semibold text-center text-gray-900">
                  {product.name}
                </h3>
                <p className="text-lg font-bold text-green-600 mt-2 text-center">
                  TZS {product.price.toLocaleString()}
                </p>
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={!product.inStock}
                  className={`w-full mt-4 py-2 rounded-lg font-semibold transition ${
                    product.inStock
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-300 text-gray-600 cursor-not-allowed"
                  }`}
                >
                  {product.inStock ? "Kuongeza" : "Haipo"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card text-center">
            <Clock className="mx-auto text-green-600 mb-2" size={32} />
            <h3 className="font-semibold text-gray-900">Haraka Mlangoni</h3>
            <p className="text-sm text-gray-600 mt-1">
              Lugha yote ndani ya Dar es Salaam
            </p>
          </div>

          <div className="card text-center">
            <Phone className="mx-auto text-green-600 mb-2" size={32} />
            <h3 className="font-semibold text-gray-900">Msaada wa Wateja</h3>
            <p className="text-sm text-gray-600 mt-1">0712 345 678</p>
          </div>

          <div className="card text-center">
            <MapPin className="mx-auto text-green-600 mb-2" size={32} />
            <h3 className="font-semibold text-gray-900">Makazi</h3>
            <p className="text-sm text-gray-600 mt-1">Dar es Salaam, TZ</p>
          </div>
        </div>
      </main>
    </div>
  );
}
