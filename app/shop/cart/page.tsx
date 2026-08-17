"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";

type CartItem = { id: number; name: string; price: number; quantity: number; image?: string; inStock?: boolean };
const CART_KEY = "mavunoone-shop-cart";

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CART_KEY);
      if (saved) window.setTimeout(() => setCart(JSON.parse(saved) as CartItem[]), 0);
    } catch {
      window.setTimeout(() => setCart([]), 0);
    } finally {
      window.setTimeout(() => setReady(true), 0);
    }
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, ready]);

  const handleRemove = (id: number) => setCart((current) => current.filter((item) => item.id !== id));
  const handleQuantityChange = (id: number, quantity: number) => setCart((current) => current.flatMap((item) => item.id !== id ? [item] : quantity <= 0 ? [] : [{ ...item, quantity }]));
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  return <div className="min-h-screen bg-slate-50"><header className="bg-gradient-to-r from-emerald-800 to-emerald-700 text-white shadow-lg"><div className="mx-auto max-w-4xl px-4 py-6"><div className="flex items-center gap-4"><Link href="/shop" className="rounded-lg p-2 hover:bg-emerald-600"><ArrowLeft size={24} /></Link><h1 className="text-2xl font-black">Kikapu Chako</h1></div></div></header><main className="mx-auto max-w-4xl px-4 py-8">{!ready ? <div className="rounded-2xl bg-white p-12 text-center text-slate-500">Inapakia kikapu...</div> : cart.length === 0 ? <div className="rounded-2xl bg-white py-12 text-center shadow-sm"><p className="text-lg text-slate-600">Kikapu chako hakina bidhaa.</p><Link href="/shop" className="mt-4 inline-block rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white">Rudi kwenye Shop</Link></div> : <div className="grid gap-6 md:grid-cols-3"><div className="space-y-4 md:col-span-2">{cart.map((item) => <div key={item.id} className="flex items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm"><div className="min-w-0 flex-1"><h3 className="font-bold text-slate-900">{item.name}</h3><p className="font-semibold text-emerald-700">TZS {item.price.toLocaleString()}</p></div><div className="flex items-center gap-3"><input type="number" min="1" value={item.quantity} onChange={(event) => handleQuantityChange(item.id, Number(event.target.value))} className="w-16 rounded-lg border border-slate-200 px-2 py-2 text-center" /><p className="w-24 text-right font-black text-slate-900">TZS {(item.price * item.quantity).toLocaleString()}</p><button type="button" onClick={() => handleRemove(item.id)} className="p-2 text-red-600"><Trash2 size={20} /></button></div></div>)}</div><div className="h-fit rounded-2xl bg-white p-5 shadow-sm"><h2 className="mb-4 text-lg font-black text-slate-900">Muhtasari</h2><div className="space-y-3 border-b border-slate-200 pb-4 text-sm"><div className="flex justify-between"><span>Bidhaa</span><strong>{cart.reduce((sum, item) => sum + item.quantity, 0)}</strong></div><div className="flex justify-between text-slate-500"><span>Kodi (18%)</span><span>TZS {tax.toLocaleString()}</span></div></div><div className="flex justify-between py-4 text-xl font-black"><span>Jumla</span><span className="text-emerald-700">TZS {total.toLocaleString()}</span></div><Link href="/shop/order" className="block w-full rounded-xl bg-emerald-600 py-3 text-center font-bold text-white hover:bg-emerald-700">Endelea na Oda</Link><Link href="/shop" className="mt-2 block w-full rounded-xl border-2 border-slate-200 py-2 text-center font-bold text-slate-700">Endelea Kununua</Link></div></div>}</main></div>;
}
