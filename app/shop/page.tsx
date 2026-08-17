"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Search, MapPin, Phone, Clock, ArrowRight } from "lucide-react";
import Image from "next/image";
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
  { id: 2, name: "Alizeti", price: 4500, image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80", inStock: true },
  { id: 3, name: "Unga wa Mahindi", price: 1800, image: "https://images.unsplash.com/photo-1528747045269-390fe33c19f2?auto=format&fit=crop&w=900&q=80", inStock: true },
  { id: 4, name: "Uduvi", price: 5000, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80", inStock: true },
  { id: 5, name: "Chakula cha Wanyama", price: 8000, image: "https://images.unsplash.com/photo-1461354464878-ad92f492a5a0?auto=format&fit=crop&w=900&q=80", inStock: true },
  { id: 6, name: "Chokaa", price: 3200, image: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&w=900&q=80", inStock: true },
  { id: 7, name: "Mafuta ya Alizeti", price: 12000, image: "/oil-ref.jpg", inStock: true },
];

export default function ShopPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("mavunoone-shop-cart");
      if (saved) window.setTimeout(() => setCart(JSON.parse(saved) as CartItem[]), 0);
    } catch {
      window.setTimeout(() => setCart([]), 0);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("mavunoone-shop-cart", JSON.stringify(cart));
  }, [cart]);

  const filteredProducts = mockProducts.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddToCart = (product: Product) => {
    setCart((current) => {
      const existing = current.find((c) => c.id === product.id);
      if (existing) return current.map((c) => (c.id === product.id ? { ...c, quantity: c.quantity + 1 } : c));
      return [...current, { ...product, quantity: 1 }];
    });
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-[#07150f] text-white">
      <header className="border-b border-emerald-900/40 bg-gradient-to-r from-[#0a1e18] via-[#0c2a24] to-[#0b241d] shadow-2xl">
        <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-amber-300">MavunoOne</p>
              <h1 className="mt-2 text-3xl font-black text-white">Shop ya Bidhaa</h1>
            </div>

            <Link href="/shop/cart">
              <button className="relative inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2.5 font-bold text-emerald-950 shadow-lg transition hover:brightness-110">
                <ShoppingCart size={18} />
                Kikapu
                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white">
                    {cartCount}
                  </span>
                )}
              </button>
            </Link>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3 text-emerald-300" size={20} />
            <input
              type="text"
              placeholder="Tafuta bidhaa, pembejeo au chakula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-emerald-800 bg-[#041915] py-3 pl-10 pr-4 text-white placeholder-emerald-500 outline-none ring-0 transition focus:border-amber-400"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 rounded-2xl border border-emerald-800 bg-[#0a1e18]/80 p-6 shadow-xl">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-300">Premium Produce</p>
              <h2 className="mt-2 text-2xl font-black text-white">Bidhaa za kilimo, biashara na usalama wa soko</h2>
            </div>
            <button className="inline-flex items-center gap-2 rounded-lg border border-emerald-700 bg-emerald-900/50 px-4 py-2 text-sm font-bold text-emerald-100 transition hover:bg-emerald-800">
              Fanya oda <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`overflow-hidden rounded-2xl border ${
                product.inStock ? "border-emerald-800 bg-[#0a1e18]/80" : "border-gray-700 bg-[#0a1e18]/50 opacity-70"
              } shadow-lg transition hover:-translate-y-1 hover:border-amber-400/60`}
            >
              <div className="relative h-40 w-full overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#041915] via-transparent to-transparent" />
              </div>

              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-black text-white">{product.name}</h3>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${product.inStock ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"}`}>
                    {product.inStock ? "ipo" : "haipo"}
                  </span>
                </div>

                <p className="text-2xl font-black text-amber-300">TZS {product.price.toLocaleString()}</p>

                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={!product.inStock}
                  className={`w-full rounded-lg py-2.5 font-bold transition ${
                    product.inStock
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:brightness-110"
                      : "cursor-not-allowed bg-gray-700 text-gray-400"
                  }`}
                >
                  {product.inStock ? "Ongeza kwa Kikapu" : "Bidhaa Haipo"}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-emerald-800 bg-[#0a1e18]/80 p-5 text-center shadow-lg">
            <Clock className="mx-auto mb-3 text-amber-300" size={28} />
            <h3 className="text-lg font-black text-white">Huduma ya Haraka</h3>
            <p className="mt-2 text-sm text-emerald-200">Uwasilishaji ulio karibu na huduma ya moja kwa moja.</p>
          </div>

          <div className="rounded-2xl border border-emerald-800 bg-[#0a1e18]/80 p-5 text-center shadow-lg">
            <Phone className="mx-auto mb-3 text-amber-300" size={28} />
            <h3 className="text-lg font-black text-white">Msaada wa Wateja</h3>
            <p className="mt-2 text-sm text-emerald-200">0712 345 678</p>
          </div>

          <div className="rounded-2xl border border-emerald-800 bg-[#0a1e18]/80 p-5 text-center shadow-lg">
            <MapPin className="mx-auto mb-3 text-amber-300" size={28} />
            <h3 className="text-lg font-black text-white">Mahali</h3>
            <p className="mt-2 text-sm text-emerald-200">Dar es Salaam, Tanzania</p>
          </div>
        </div>
      </main>
    </div>
  );
}
