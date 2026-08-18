"use client";

import Link from "next/link";
import { ArrowLeft, LockKeyhole, ShoppingBag } from "lucide-react";

export default function ShopAccountPage() {
  return (
    <main className="min-h-[70vh] bg-slate-50 px-4 py-10">
      <section className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          <LockKeyhole size={30} />
        </div>
        <p className="mt-6 text-xs font-black uppercase tracking-[0.22em] text-emerald-700">Customer account</p>
        <h1 className="mt-2 text-2xl font-black text-slate-950">Akaunti ya mteja inalindwa</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Taarifa za oda, madeni, credit limit na malipo zitaonekana tu baada ya akaunti ya mteja kuthibitishwa na kuunganishwa na namba yake ya simu. Hatuonyeshi taarifa za mfano au za mteja mwingine kwa mtu wa umma.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link href="/shop" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-800">
            <ShoppingBag size={17} /> Rudi Shop
          </Link>
          <Link href="/shop/order" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
            Endelea na oda <ArrowLeft className="rotate-180" size={17} />
          </Link>
        </div>
        <p className="mt-6 text-xs text-slate-500">Kwa msaada wa account, wasiliana na MavunoOne kupitia namba ya kampuni iliyo kwenye Shop.</p>
      </section>
    </main>
  );
}
