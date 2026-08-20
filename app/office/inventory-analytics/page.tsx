"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, BarChart3, Loader2, Package, RefreshCw, TrendingDown, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";

const money = (value: number) => `TZS ${Math.round(value).toLocaleString("en-TZ")}`;

type StockRow = {
  id: number;
  name: string;
  sku: string;
  quantity: number;
  threshold: number;
  unit: string;
  value: number;
};

export default function InventoryAnalyticsPage() {
  const productsQuery = trpc.products.list.useQuery();
  const [sortBy, setSortBy] = useState("name");
  const inventory = useMemo<StockRow[]>(() => (productsQuery.data ?? []).map((product) => {
    const quantity = Number(product.currentStock ?? 0);
    const threshold = Number(product.lowStockThreshold ?? 0);
    return {
      id: product.id,
      name: product.name,
      sku: product.barcode || `PROD-${product.id}`,
      quantity,
      threshold,
      unit: product.unit || "kg",
      value: quantity * Number(product.costPrice ?? 0),
    };
  }), [productsQuery.data]);

  const lowStockItems = inventory.filter((item) => item.quantity <= item.threshold);
  const outOfStockItems = inventory.filter((item) => item.quantity <= 0);
  const totalValue = inventory.reduce((sum, item) => sum + item.value, 0);
  const sortedInventory = useMemo(() => [...inventory].sort((a, b) => {
    if (sortBy === "stock") return a.quantity - b.quantity;
    if (sortBy === "value") return b.value - a.value;
    return a.name.localeCompare(b.name);
  }), [inventory, sortBy]);

  if (productsQuery.isLoading) return <div className="flex min-h-[420px] items-center justify-center"><div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-white px-5 py-4 text-sm font-semibold text-slate-600 shadow-sm"><Loader2 className="animate-spin text-emerald-600" size={18} />Inapakia inventory analytics...</div></div>;
  if (productsQuery.error) return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm font-semibold text-red-700">Inventory analytics haikuweza kupakia data ya bidhaa. Tafadhali jaribu tena.</div>;

  return <main className="space-y-7 pb-10">
    <header className="relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#0a2c24] via-[#0d5f49] to-[#16805e] px-6 py-7 text-white shadow-[0_18px_50px_rgba(13,95,73,.18)] sm:px-8 sm:py-8"><div className="absolute -right-12 -top-20 h-52 w-52 rounded-full bg-emerald-200/10 blur-2xl" /><div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-100">Inventory intelligence</p><h1 className="mt-3 flex items-center gap-3 text-3xl font-black tracking-tight sm:text-4xl"><BarChart3 className="text-amber-300" size={30} />Uchambuzi wa Stock</h1><p className="mt-3 max-w-2xl text-[15px] leading-7 text-emerald-50/80">Taarifa za stock kutoka catalog halisi ya Ipuli Milling and Animal Enterprise. Hakuna sample products wala picha za mapambo.</p></div><span className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-emerald-50"><RefreshCw size={16} className="text-amber-300" />Live catalog</span></div></header>

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-[15px] font-semibold text-slate-600">Bidhaa active</p><p className="mt-2 text-3xl font-black text-slate-950">{inventory.length}</p><p className="mt-2 text-[13px] text-slate-500">Catalog ya sasa</p></div><Package className="rounded-xl bg-emerald-50 p-2 text-emerald-700" size={38} /></div></div><div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-[15px] font-semibold text-amber-800">Stock chini</p><p className="mt-2 text-3xl font-black text-amber-950">{lowStockItems.length}</p><p className="mt-2 text-[13px] text-amber-900/70">Inahitaji review</p></div><AlertTriangle className="rounded-xl bg-white/70 p-2 text-amber-700" size={38} /></div></div><div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-[15px] font-semibold text-red-800">Out of stock</p><p className="mt-2 text-3xl font-black text-red-950">{outOfStockItems.length}</p><p className="mt-2 text-[13px] text-red-900/70">Zinahitaji replenishment</p></div><TrendingDown className="rounded-xl bg-white/70 p-2 text-red-700" size={38} /></div></div><div className="rounded-2xl border border-sky-200 bg-sky-50 p-5 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-[15px] font-semibold text-sky-800">Inventory value</p><p className="mt-2 text-2xl font-black text-sky-950">{money(totalValue)}</p><p className="mt-2 text-[13px] text-sky-900/70">Kwa cost price</p></div><BarChart3 className="rounded-xl bg-white/70 p-2 text-sky-700" size={38} /></div></div></section>

    {lowStockItems.length > 0 && <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm sm:p-6"><div className="flex items-start gap-3"><AlertTriangle className="mt-1 shrink-0 text-amber-700" size={22} /><div><h2 className="text-lg font-black text-amber-950">Stock inayohitaji umakini</h2><p className="mt-1 text-[15px] text-amber-900/75">Bidhaa hizi ziko chini au sawa na threshold iliyowekwa kwenye catalog.</p><div className="mt-4 grid gap-2 sm:grid-cols-2">{lowStockItems.slice(0, 8).map((item) => <div key={item.id} className="flex items-center justify-between rounded-xl bg-white/75 px-4 py-3"><span className="font-bold text-amber-950">{item.name}</span><span className="text-sm font-semibold text-amber-800">{item.quantity.toLocaleString()} {item.unit} · min {item.threshold.toLocaleString()}</span></div>)}</div></div></div></section>}

    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6"><div><h2 className="text-xl font-black text-slate-950">Orodha ya bidhaa na hali ya stock</h2><p className="mt-1 text-[15px] text-slate-500">Panga kwa jina, kiasi kilichopo au thamani ya inventory.</p></div><div className="flex items-center gap-2"><label className="text-[15px] font-semibold text-slate-600" htmlFor="inventory-sort">Panga kwa</label><select id="inventory-sort" value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[15px] font-semibold text-slate-700"><option value="name">Jina</option><option value="stock">Stock ndogo kwanza</option><option value="value">Thamani kubwa kwanza</option></select></div></div><div className="overflow-x-auto"><table className="min-w-[760px] w-full text-left text-[15px]"><thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-4">Bidhaa</th><th className="px-5 py-4">Code</th><th className="px-5 py-4 text-right">Stock</th><th className="px-5 py-4 text-right">Threshold</th><th className="px-5 py-4 text-right">Thamani</th><th className="px-5 py-4">Hali</th></tr></thead><tbody className="divide-y divide-slate-100">{sortedInventory.map((item) => { const critical = item.quantity <= item.threshold; const empty = item.quantity <= 0; return <tr key={item.id} className="hover:bg-emerald-50/30"><td className="px-5 py-4"><span className="flex items-center gap-2 font-bold text-slate-900"><Package size={17} className="text-emerald-700" />{item.name}</span></td><td className="px-5 py-4 font-mono text-sm text-slate-500">{item.sku}</td><td className="px-5 py-4 text-right font-black text-slate-900">{item.quantity.toLocaleString()} {item.unit}</td><td className="px-5 py-4 text-right text-slate-600">{item.threshold.toLocaleString()} {item.unit}</td><td className="px-5 py-4 text-right font-bold text-slate-900">{money(item.value)}</td><td className="px-5 py-4"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${empty ? "bg-red-100 text-red-800" : critical ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>{empty ? "Out of stock" : critical ? "Review stock" : "In range"}</span></td></tr>; })}{sortedInventory.length === 0 && <tr><td colSpan={6} className="px-5 py-14 text-center text-[15px] text-slate-500">Hakuna bidhaa active kwenye catalog.</td></tr>}</tbody></table></div></section>

    <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6"><div className="flex items-start gap-3"><Zap className="mt-1 text-emerald-700" size={22} /><div><h2 className="text-lg font-black text-emerald-950">Hatua inayofuata</h2><p className="mt-1 text-[15px] leading-7 text-emerald-900/75">Tumia Stock In kuongeza inventory, au Products kurekebisha threshold na bei. Mfumo hautengenezi picha au bidhaa za kufikirika; analytics inatumia catalog halisi.</p></div></div></section>
  </main>;
}

