"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Clock, Loader2, MapPin, Phone, Search, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/lib/trpc";

type CartItem = { id: number; name: string; price: number; quantity: number; unit: string; packageSizeKg: number; image?: string; inStock?: boolean };
const typeLabel: Record<string, string> = { animal_feed: "Animal Feed", byproduct: "By-product", raw_material: "Raw Material", finished_goods: "Finished Goods", packaging: "Packaging", service: "Service" };
const CART_KEY = "mavunoone-shop-cart";
const visualStyles = ["from-emerald-700 to-teal-500", "from-amber-600 to-yellow-400", "from-sky-700 to-cyan-400", "from-slate-800 to-slate-500"];
const productImages: Array<{ keywords: string[]; src: string; alt: string }> = [
  // Chokaa is its own feed-ingredient product and must never inherit the generic animal-feed image.
  { keywords: ["chokaa", "choka"], src: "/products/chokaa-feed-grade.jpg", alt: "Chokaa ya feed-grade kwa matumizi ya animal feed" },
  // Use product-specific, neutral assets before the generic feed fallback.
  { keywords: ["mchanganyiko wa chakula", "mixed animal feed", "mixed feed", "complete feed", "complete animal feed", "chakula kilichochanganywa"], src: "/products/mixed-animal-feed-commons.jpg", alt: "Mchanganyiko wa chakula cha mifugo" },
  { keywords: ["mashudu", "sunflower cake", "sunflower meal", "sunflower oilcake", "oilcake"], src: "/products/sunflower-meal-commons.jpg", alt: "Mashudu ya alizeti kwa animal feed" },
  { keywords: ["pumba", "maize bran", "corn bran", "bran", "corn by-product", "by-product", "byproduct", "udaga"], src: "/products/maize-byproduct-livestock-feed.jpg", alt: "Pumba ya mahindi kwa animal feed" },
  { keywords: ["soya cake", "soya", "soybean cake", "soy", "soybean", "soyabean"], src: "/products/soya-cake-neutral.jpeg", alt: "Soya cake kwa matumizi ya animal feed" },
  { keywords: ["uduv", "uduvi", "dagaa", "fishmeal", "fish meal"], src: "/products/uduv-fishmeal-neutral.jpg", alt: "Uduvi na fishmeal kwa matumizi ya animal feed" },
  // Keep generic animal-feed terms after ingredient-specific terms so each ingredient keeps its own image.
  { keywords: ["animal feed", "animal feeds", "animal food", "feeds", "feed", "chakula cha mifugo", "chakula cha wanyama", "chakula cha kuku", "chakula cha ng'ombe", "mifugo", "cake"], src: "/products/animal-feeds.jpg", alt: "Animal feeds kwa mifugo" },
  { keywords: ["mafuta", "oil"], src: "/products/sunflower-oil-sizes.jpg", alt: "Mafuta ya alizeti kwenye chupa na gallon za sizes tofauti" },
  { keywords: ["unga", "flour", "meal"], src: "/products/maize-flour.jpg", alt: "Unga wa mahindi" },
  { keywords: ["mahindi", "mahindi ya nafaka", "maize", "corn", "grain"], src: "/products/maize-cobs-commons.jpg", alt: "Mahindi ya nafaka na magunzi" },
  { keywords: ["alizeti", "sunflower", "seed"], src: "/products/sunflower-flower-commons.jpg", alt: "Ua la alizeti" },
];
const normalizeProductName = (name: string) => name.trim().toLowerCase() === "alizeti green" ? "Alizeti" : name.trim();
const imageForProduct = (name: string) => {
  const normalized = name.toLowerCase().replace(/[–—]/g, "-");
  return productImages.find((item) => item.keywords.some((keyword) => normalized.includes(keyword)));
};

export default function ShopPage() {
  const productsQuery = trpc.products.publicList.useQuery();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CART_KEY);
      if (saved) window.setTimeout(() => setCart(JSON.parse(saved) as CartItem[]), 0);
    } catch {
      window.setTimeout(() => setCart([]), 0);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const products = useMemo(() => (productsQuery.data ?? []).map((product) => ({
    id: product.id,
    name: normalizeProductName(product.name),
    price: Number(product.sellPrice ?? 0),
    stock: product.available ? 1 : 0,
    productType: product.productType,
    unit: product.unit,
    packageSizeKg: Number(product.packageSizeKg ?? 1),
    image: product.imageUrl || imageForProduct(product.name)?.src,
    imageAlt: product.imageUrl ? `${product.name} — picha ya bidhaa` : imageForProduct(product.name)?.alt ?? product.name,
  })), [productsQuery.data]);
  const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToCart = (product: (typeof products)[number]) => {
    if (product.stock <= 0) return;
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...current, { id: product.id, name: product.name, price: product.price, quantity: 1, unit: product.unit, packageSizeKg: product.packageSizeKg, image: product.image, inStock: true }];
    });
  };

  return <div className="min-h-screen bg-[#07150f] text-white"><header className="border-b border-emerald-900/40 bg-gradient-to-r from-[#0a1e18] via-[#0c2a24] to-[#0b241d] shadow-2xl"><div className="mx-auto max-w-6xl px-4 py-6 md:py-8"><div className="mb-6 flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.35em] text-amber-300">MavunoOne Marketplace</p><h1 className="mt-2 text-3xl font-black text-white">Shop ya Bidhaa</h1><p className="mt-1 text-sm text-emerald-200">Tabora, Tanzania · Bidhaa halisi na oda salama</p></div><div className="flex items-center gap-2"><Link href="/" className="rounded-lg border border-emerald-700 px-3 py-2 text-sm font-bold text-emerald-100 hover:bg-emerald-800">Home</Link><Link href="/shop/account" className="rounded-lg border border-emerald-700 px-3 py-2 text-sm font-bold text-emerald-100 hover:bg-emerald-800">Akaunti</Link><Link href="/shop/cart" className="relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2.5 font-bold text-emerald-950 shadow-lg transition hover:brightness-110"><ShoppingCart size={18} />Kikapu{cartCount > 0 && <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white">{cartCount}</span>}</Link></div></div><div className="relative"><Search className="absolute left-3 top-3 text-emerald-300" size={20} /><input type="text" placeholder="Tafuta bidhaa, pembejeo au chakula..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="w-full rounded-xl border border-emerald-800 bg-[#041915] py-3 pl-10 pr-4 text-white placeholder-emerald-500 outline-none transition focus:border-amber-400" /></div></div></header><main className="mx-auto max-w-6xl px-4 py-8"><div className="mb-8 flex flex-col gap-3 rounded-2xl border border-emerald-800 bg-[#0a1e18]/80 p-6 shadow-xl md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-300">Fresh inventory</p><h2 className="mt-2 text-2xl font-black text-white">Bidhaa kutoka stock ya MavunoOne</h2><p className="mt-2 text-sm text-emerald-200">Bei na upatikanaji vinafichua hali halisi ya inventory.</p></div><Link href="/shop/cart" className="inline-flex items-center gap-2 rounded-lg border border-emerald-700 bg-emerald-900/50 px-4 py-2 text-sm font-bold text-emerald-100 transition hover:bg-emerald-800">Fanya oda <ArrowRight size={16} /></Link></div>{productsQuery.isLoading ? <div className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-800 bg-[#0a1e18]/80 p-16 text-emerald-200"><Loader2 className="animate-spin" size={20} />Inapakia bidhaa...</div> : productsQuery.error ? <div className="rounded-2xl border border-red-800 bg-red-950/40 p-6 text-red-200">Bidhaa hazikuweza kupakiwa. Tafadhali jaribu tena baadaye.</div> : filteredProducts.length === 0 ? <div className="rounded-2xl border border-emerald-800 bg-[#0a1e18]/80 p-16 text-center text-emerald-200">Hakuna bidhaa inayolingana na utafutaji wako.</div> : <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{filteredProducts.map((product, index) => { const available = product.stock > 0; return <div key={product.id} className={`overflow-hidden rounded-2xl border ${available ? "border-emerald-800 bg-[#0a1e18]/80" : "border-gray-700 bg-[#0a1e18]/50 opacity-70"} shadow-lg transition hover:-translate-y-1 hover:border-amber-400/60`}>{product.image ? <div className="relative h-40 overflow-hidden bg-[#f6efe0]"><Image src={product.image} alt={product.imageAlt} fill unoptimized onError={(event) => { event.currentTarget.src = imageForProduct(product.name)?.src ?? "/products/animal-feeds.jpg"; }} sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw" className="object-cover transition duration-500 hover:scale-105" /></div> : <div className={`flex h-40 items-end bg-gradient-to-br ${visualStyles[index % visualStyles.length]} p-5`}><div><p className="text-xs font-bold uppercase tracking-[0.25em] text-white/70">MavunoOne</p><p className="mt-1 text-2xl font-black text-white">{product.name.slice(0, 1).toUpperCase()}</p></div></div>}<div className="space-y-3 p-4"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">{typeLabel[product.productType] || "Agribusiness product"}</p><div className="mt-1 flex items-start justify-between gap-2"><h3 className="text-lg font-black text-white">{product.name}</h3><span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${available ? "bg-emerald-500/15 text-emerald-300" : "bg-red-500/15 text-red-300"}`}>{available ? "ipo" : "haipo"}</span></div><p className="text-2xl font-black text-amber-300">TZS {product.price.toLocaleString()} <span className="text-xs font-semibold text-emerald-300">/ {product.unit}</span></p><button onClick={() => handleAddToCart(product)} disabled={!available} className={`w-full rounded-lg py-2.5 font-bold transition ${available ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:brightness-110" : "cursor-not-allowed bg-gray-700 text-gray-400"}`}>{available ? "Ongeza kwa Kikapu" : "Bidhaa Haipo"}</button></div></div></div>; })}</div>}<div className="grid grid-cols-1 gap-4 md:grid-cols-3"><div className="rounded-2xl border border-emerald-800 bg-[#0a1e18]/80 p-5 text-center shadow-lg"><Clock className="mx-auto mb-3 text-amber-300" size={28} /><h3 className="text-lg font-black text-white">Huduma ya Haraka</h3><p className="mt-2 text-sm text-emerald-200">Uwasilishaji unaoratibiwa kwa ufanisi.</p></div><div className="rounded-2xl border border-emerald-800 bg-[#0a1e18]/80 p-5 text-center shadow-lg"><Phone className="mx-auto mb-3 text-amber-300" size={28} /><h3 className="text-lg font-black text-white">Msaada wa Wateja</h3><p className="mt-2 text-sm text-emerald-200">0712 345 678</p></div><div className="rounded-2xl border border-emerald-800 bg-[#0a1e18]/80 p-5 text-center shadow-lg"><MapPin className="mx-auto mb-3 text-amber-300" size={28} /><h3 className="text-lg font-black text-white">Mahali</h3><p className="mt-2 text-sm text-emerald-200">Tabora, Tanzania</p></div></div></main></div>;
}
