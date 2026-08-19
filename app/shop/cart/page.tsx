"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Minus, Plus, ShoppingCart, ShieldCheck, Trash2 } from "lucide-react";

type CartItem = { id: number; name: string; price: number; quantity: number; image?: string; inStock?: boolean };
type PaymentInstructions = { enabled: boolean; mpesa: { name: string | null; number: string | null } | null; tigopesa: { name: string | null; number: string | null } | null };
const emptyPayments: PaymentInstructions = { enabled: false, mpesa: null, tigopesa: null };
const CART_KEY = "mavunoone-shop-cart";

const money = (value: number) => `TZS ${Math.round(value).toLocaleString("en-TZ")}`;

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentInstructions, setPaymentInstructions] = useState<PaymentInstructions>(emptyPayments);
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

  useEffect(() => {
    fetch("/api/payment/instructions", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : emptyPayments))
      .then((data) => setPaymentInstructions(data as PaymentInstructions))
      .catch(() => setPaymentInstructions(emptyPayments));
  }, []);

  const updateQuantity = (id: number, quantity: number) => {
    setCart((current) => current.flatMap((item) => item.id !== id ? [item] : quantity <= 0 ? [] : [{ ...item, quantity }]));
  };
  const handleRemove = (id: number) => setCart((current) => current.filter((item) => item.id !== id));
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-[calc(100vh-92px)] bg-[#07150f] text-white">
      <div className="border-b border-emerald-900/40 bg-[#0a1e18]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <Link href="/shop" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-200 transition hover:text-amber-300">
            <ArrowLeft size={17} /> Rudi kwenye Shop
          </Link>
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <ShoppingCart size={18} className="text-amber-300" /> Kikapu
            {itemCount > 0 && <span className="rounded-full bg-amber-400 px-2 py-0.5 text-xs text-emerald-950">{itemCount}</span>}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8 pb-28 sm:px-6 lg:py-12">
        {!ready ? (
          <div className="mx-auto max-w-xl rounded-3xl border border-emerald-800 bg-[#0a1e18] p-12 text-center shadow-xl">
            <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-full bg-emerald-100" />
            <p className="text-sm font-semibold text-emerald-200">Inapakia kikapu chako...</p>
          </div>
        ) : cart.length === 0 ? (
          <section className="mx-auto max-w-2xl rounded-3xl border border-emerald-800 bg-[#0a1e18] px-6 py-14 text-center shadow-xl sm:px-12">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 text-amber-300">
              <ShoppingCart size={34} strokeWidth={1.7} />
            </div>
            <p className="mt-7 text-xs font-black uppercase tracking-[0.22em] text-amber-300">Kikapu chako</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">Bado hujaongeza bidhaa</h1>
            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-emerald-200">Chagua bidhaa kutoka Shop ili uanze oda yako. Utaona bei na availability ya bidhaa kabla ya kuendelea.</p>
            <Link href="/shop" className="mt-8 inline-flex rounded-xl bg-amber-400 px-6 py-3 text-sm font-black text-emerald-950 shadow-lg shadow-amber-400/20 transition hover:bg-amber-300">Angalia bidhaa</Link>
          </section>
        ) : (
          <>
            <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-300">Oda yako</p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Kagua kikapu chako</h1>
                <p className="mt-2 text-sm text-emerald-200">Thibitisha bidhaa na quantity kabla ya kuendelea na oda.</p>
              </div>
              <Link href="/shop" className="text-sm font-bold text-amber-300 hover:text-amber-200">+ Ongeza bidhaa nyingine</Link>
            </div>

            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
              <section className="space-y-3">
                {cart.map((item) => (
                  <article key={item.id} className="flex gap-4 rounded-2xl border border-emerald-800 bg-[#0a1e18] p-4 shadow-xl sm:p-5">
                    {item.image ? <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl"><Image src={item.image} alt="" fill unoptimized sizes="80px" className="object-cover" /></div> : <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><ShoppingCart size={24} /></div>}
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate font-black text-white">{item.name}</h2>
                      <p className="mt-1 text-sm font-bold text-amber-300">{money(item.price)} <span className="font-medium text-slate-400">/ unit</span></p>
                      <button type="button" onClick={() => handleRemove(item.id)} className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-300 transition hover:text-red-300"><Trash2 size={14} /> Ondoa</button>
                    </div>
                    <div className="flex shrink-0 flex-col items-end justify-between gap-3">
                      <p className="font-black text-white">{money(item.price * item.quantity)}</p>
                      <div className="flex items-center rounded-xl border border-emerald-700 bg-[#07150f]">
                        <button type="button" aria-label="Punguza quantity" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 text-emerald-300 hover:text-amber-300"><Minus size={15} /></button>
                        <span className="min-w-8 text-center text-sm font-black text-white">{item.quantity}</span>
                        <button type="button" aria-label="Ongeza quantity" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 text-emerald-300 hover:text-amber-300"><Plus size={15} /></button>
                      </div>
                    </div>
                  </article>
                ))}
              </section>

              <aside className="rounded-3xl border border-emerald-800 bg-[#0a1e18] p-5 shadow-xl sm:p-6">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-300">Muhtasari wa oda</p>
                <div className="mt-5 space-y-3 border-b border-emerald-800 pb-5 text-sm"><div className="flex justify-between"><span className="text-emerald-200">Bidhaa</span><strong className="text-white">{itemCount}</strong></div><div className="flex justify-between"><span className="text-emerald-200">Subtotal</span><strong className="text-white">{money(subtotal)}</strong></div><div className="flex justify-between text-emerald-200"><span>Kodi (18%)</span><span>{money(tax)}</span></div></div>
                <div className="flex justify-between py-5 text-xl font-black"><span className="text-white">Jumla</span><span className="text-amber-300">{money(total)}</span></div>
                {paymentInstructions.enabled && (paymentInstructions.mpesa || paymentInstructions.tigopesa) && <div className="mb-5 rounded-2xl border border-emerald-800 bg-[#07150f] p-4"><p className="text-xs font-black uppercase tracking-wide text-amber-300">Njia za malipo</p><div className="mt-3 space-y-2 text-xs">{paymentInstructions.mpesa && <div className="rounded-xl bg-emerald-50 px-3 py-2 font-semibold text-emerald-900"><span className="font-black">M-Pesa:</span> {paymentInstructions.mpesa.number}</div>}{paymentInstructions.tigopesa && <div className="rounded-xl bg-sky-50 px-3 py-2 font-semibold text-sky-900"><span className="font-black">Tigo Pesa:</span> {paymentInstructions.tigopesa.number}</div>}</div></div>}
                <Link href="/shop/order" className="block w-full rounded-xl bg-amber-400 py-3.5 text-center text-sm font-black text-emerald-950 transition hover:bg-amber-300">Endelea na oda</Link>
                <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-emerald-300"><ShieldCheck size={15} className="text-emerald-600" /> Taarifa zako zitatumika kwa oda yako tu.</div>
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
