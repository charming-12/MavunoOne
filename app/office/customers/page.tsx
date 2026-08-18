"use client";

import { Loader2, Mail, Phone, Plus, TrendingUp, Users } from "lucide-react";
import { trpc } from "@/lib/trpc";

const money = (value: number) => `TZS ${value.toLocaleString()}`;

export default function CustomersPage() {
  const customersQuery = trpc.customers.list.useQuery();
  const customers = customersQuery.data ?? [];

  if (customersQuery.isLoading) return <div className="flex min-h-[320px] items-center justify-center gap-2 text-emerald-700"><Loader2 className="animate-spin" size={20} />Inapakia wateja...</div>;
  if (customersQuery.error) return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">Wateja hawakuweza kupakiwa. Hakikisha umeingia kama staff na database inapatikana.</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Customer operations</p><h1 className="mt-1 text-3xl font-black text-slate-900">Wateja</h1><p className="mt-2 text-slate-500">Customer directory na madeni kutoka database halisi.</p></div><button type="button" className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 font-bold text-white shadow-sm hover:bg-emerald-800"><Plus size={18} />Mteja Mpya</button></div>
      <div className="grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><Users className="text-emerald-600" size={20} /><p className="mt-4 text-sm text-slate-500">Wateja active</p><p className="mt-1 text-3xl font-black text-slate-900">{customers.length}</p></div><div className="rounded-2xl border border-red-100 bg-red-50 p-5 shadow-sm"><TrendingUp className="text-red-600" size={20} /><p className="mt-4 text-sm text-red-700">Jumla ya deni</p><p className="mt-1 text-2xl font-black text-red-900">{money(customers.reduce((sum, customer) => sum + Number(customer.balance || 0), 0))}</p></div><div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 shadow-sm"><p className="text-sm text-amber-800">Wholesale customers</p><p className="mt-1 text-3xl font-black text-amber-950">{customers.filter((customer) => customer.customerType === "wholesale").length}</p></div></div>
      {customers.length === 0 ? <div className="rounded-2xl bg-white p-16 text-center text-slate-500 shadow-sm">Hakuna customer aliyesajiliwa bado.</div> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{customers.map((customer) => { const debt = Number(customer.balance || 0); return <article key={customer.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between gap-3"><div><h2 className="font-black text-slate-900">{customer.name}</h2><p className="mt-1 text-xs font-bold uppercase tracking-wide text-emerald-600">{customer.customerType}</p></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">Active</span></div><div className="mt-5 space-y-2">{customer.phone ? <a href={`tel:${customer.phone}`} className="flex items-center gap-2 text-sm text-slate-600 hover:text-emerald-700"><Phone size={15} className="text-emerald-600" />{customer.phone}</a> : <p className="text-sm text-slate-400">Phone haijawekwa</p>}{customer.email ? <a href={`mailto:${customer.email}`} className="flex min-w-0 items-center gap-2 text-sm text-slate-600 hover:text-emerald-700"><Mail size={15} className="shrink-0 text-sky-600" /><span className="truncate">{customer.email}</span></a> : <p className="text-sm text-slate-400">Email haijawekwa</p>}</div><div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4"><span className="text-sm text-slate-500">Deni</span><strong className={debt > 0 ? "text-red-600" : "text-emerald-700"}>{money(debt)}</strong></div></article>; })}</div>}
    </div>
  );
}
