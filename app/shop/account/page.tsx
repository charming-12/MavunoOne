"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Clock3, Home, LockKeyhole, MapPin, PackageSearch, Phone, Search, ShoppingBag, UserRound } from "lucide-react";

export default function ShopAccountPage() {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const handleTrack = (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(phone.trim() ? "Timu yetu itatumia namba hii kuthibitisha oda yako. Order history itaonekana baada ya customer verification." : "Weka namba ya simu uliyoitumia kwenye oda.");
  };

  return (
    <main className="min-h-screen bg-[#07150f] text-white">
      <header className="border-b border-emerald-900/50 bg-[#0a1e18]/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 md:px-8"><div><p className="text-xs font-black uppercase tracking-[0.3em] text-amber-300">MavunoOne Shop</p><h1 className="mt-2 text-2xl font-black md:text-3xl">Akaunti ya mteja</h1><p className="mt-1 text-sm text-emerald-200">Fuatilia oda zako kwa urahisi kutoka Tabora</p></div><div className="flex gap-2"><Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-emerald-700 px-3 py-2 text-sm font-bold text-emerald-100 hover:bg-emerald-900/60"><Home size={16} /> Home</Link><Link href="/shop" className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-black text-emerald-950 hover:bg-amber-300">Shop</Link></div></div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
        <section className="overflow-hidden rounded-[32px] border border-emerald-400/20 bg-[radial-gradient(circle_at_top_right,_rgba(251,191,36,0.16),transparent_35%),linear-gradient(135deg,rgba(16,185,129,0.16),rgba(255,255,255,0.03))] p-6 md:p-10"><div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center"><div><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400 text-emerald-950"><UserRound size={26} /></div><p className="mt-7 text-xs font-black uppercase tracking-[0.25em] text-amber-300">Customer space</p><h2 className="mt-3 max-w-xl text-3xl font-black leading-tight md:text-5xl">Karibu kwenye akaunti yako ya MavunoOne</h2><p className="mt-5 max-w-xl text-base leading-8 text-emerald-100/75">Tumia namba ya simu uliyoandika wakati wa kuagiza ili timu yetu ikusaidie kufuatilia oda na uthibitisho wa malipo.</p></div><form onSubmit={handleTrack} className="rounded-3xl border border-white/10 bg-[#06120d]/70 p-5 md:p-6"><div className="flex items-center gap-3"><PackageSearch className="text-amber-300" size={23} /><div><p className="text-xs font-black uppercase tracking-widest text-emerald-300">Order tracking</p><h3 className="mt-1 text-xl font-black">Fuatilia oda</h3></div></div><label className="mt-6 block"><span className="mb-2 block text-sm font-bold text-emerald-100">Namba ya simu</span><input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="0712 345 678" className="w-full rounded-xl border border-emerald-900 bg-[#07150f] px-4 py-3 text-white outline-none focus:border-amber-300" /></label><button className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 font-black text-emerald-950 hover:bg-amber-300"><Search size={17} /> Angalia status</button>{message && <p className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-xs leading-5 text-emerald-100">{message}</p>}</form></div></section>

        <section className="mt-8 grid gap-4 md:grid-cols-3"><div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5"><Clock3 className="text-amber-300" size={24} /><h3 className="mt-5 font-black">Oda zako</h3><p className="mt-2 text-sm leading-6 text-emerald-100/60">Order history itaonekana baada ya namba ya simu kuthibitishwa.</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5"><MapPin className="text-emerald-300" size={24} /><h3 className="mt-5 font-black">Delivery</h3><p className="mt-2 text-sm leading-6 text-emerald-100/60">Timu itawasiliana nawe kuhusu eneo na muda wa delivery.</p></div><div className="rounded-2xl border border-white/10 bg-white/[0.05] p-5"><LockKeyhole className="text-cyan-300" size={24} /><h3 className="mt-5 font-black">Privacy ya mteja</h3><p className="mt-2 text-sm leading-6 text-emerald-100/60">Ukurasa huu una taarifa za customer tu; data za Office na Boss hazionekani.</p></div></section>

        <section className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.04] p-6 md:p-8"><div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between"><div><p className="text-xs font-black uppercase tracking-widest text-amber-300">Unahitaji msaada?</p><h2 className="mt-2 text-2xl font-black">Timu ya MavunoOne iko tayari kusaidia</h2><p className="mt-2 text-sm text-emerald-100/65">Wasiliana nasi kuhusu bidhaa, malipo au delivery kutoka Tabora.</p></div><div className="flex flex-wrap gap-3"><a href="tel:+255712345678" className="inline-flex items-center gap-2 rounded-xl border border-emerald-700 px-4 py-3 text-sm font-black text-emerald-100 hover:bg-emerald-900/50"><Phone size={17} /> Piga simu</a><Link href="/shop/order" className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-black text-white hover:bg-emerald-400">Anza oda <ArrowRight size={17} /></Link></div></div></section>

        <div className="mt-8 flex flex-wrap justify-center gap-3"><Link href="/shop" className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-emerald-100 hover:bg-white/10"><ShoppingBag size={17} /> Tazama Shop</Link><Link href="/" className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-emerald-100 hover:bg-white/10"><Home size={17} /> Rudi Home</Link></div>
      </div>
    </main>
  );
}
