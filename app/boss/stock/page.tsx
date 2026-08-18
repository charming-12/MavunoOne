"use client";

import Link from "next/link";
import { AlertTriangle, ArrowLeft, Boxes, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function BossStockPage() {
  const productsQuery = trpc.products.list.useQuery();
  const movementQuery = trpc.products.stockMovementSummary.useQuery();
  const products = productsQuery.data ?? [];
  const movementByProduct = new Map((movementQuery.data ?? []).map((movement) => [movement.productId, movement]));
  const lowStock = products.filter((product) => Number(product.currentStock ?? 0) <= Number(product.lowStockThreshold ?? 0));
  const maxStock = Math.max(...products.map((product) => Math.max(Number(product.currentStock ?? 0), Number(product.lowStockThreshold ?? 0))), 1);

  return (
    <main className="min-h-screen bg-[#f7f9f8] p-4 text-slate-900 sm:p-6 lg:p-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Executive inventory</p><h1 className="mt-1 text-3xl font-black">Stock — hali halisi</h1><p className="mt-2 text-sm text-slate-500">Muhtasari wa bidhaa na minimum threshold kutoka database ya MavunoOne. Alert huanza stock ikifika minimum au chini.</p></div>
          <Link href="/boss" className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-bold text-emerald-800 shadow-sm hover:bg-emerald-50"><ArrowLeft size={17} />Dashboard</Link>
        </div>

        {productsQuery.isLoading || movementQuery.isLoading ? <div className="flex items-center justify-center gap-2 rounded-2xl bg-white p-14 text-slate-500 shadow-sm"><Loader2 className="animate-spin" size={20} />Inapakia stock movements...</div> : productsQuery.error || movementQuery.error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">Stock movement haikuweza kupakiwa kutoka database.</div> : <>
          <div className="grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-slate-900 p-5 text-white shadow-lg"><Boxes size={22} className="text-emerald-300" /><p className="mt-4 text-sm text-slate-300">Bidhaa active</p><p className="mt-1 text-3xl font-black">{products.length}</p></div><div className="rounded-2xl bg-amber-500 p-5 text-slate-950 shadow-lg"><AlertTriangle size={22} /><p className="mt-4 text-sm font-semibold text-amber-950/70">Zinazohitaji kuangaliwa</p><p className="mt-1 text-3xl font-black">{lowStock.length}</p></div><div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Status ya inventory</p><p className="mt-2 text-xl font-black text-emerald-700">{products.length ? "Live database" : "Hakuna data"}</p><p className="mt-1 text-xs text-slate-500">Hakuna takwimu za kubuni</p></div></div>
          {lowStock.length > 0 && <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4"><AlertTriangle className="mt-0.5 text-red-600" size={20} /><div><p className="font-bold text-red-800">{lowStock.length} bidhaa ziko kwenye low stock</p><p className="mt-1 text-sm text-red-700">Kagua replenishment kwenye Operations Hub.</p></div></div>}
          <div className="grid gap-4 md:grid-cols-2">{products.length ? products.map((product) => { const stock = Number(product.currentStock ?? 0); const threshold = Number(product.lowStockThreshold ?? 0); const isLow = stock <= threshold; return <div key={product.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h2 className="font-black text-slate-900">{product.name}</h2><p className="mt-1 text-xs text-slate-500">Unit: {product.unit}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${isLow ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>{isLow ? "LOW STOCK" : "OK"}</span></div><div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${isLow ? "bg-red-500" : "bg-emerald-600"}`} style={{ width: `${Math.min((stock / maxStock) * 100, 100)}%` }} /></div><div className="mt-3 grid grid-cols-3 gap-2 text-xs"><div className="rounded-lg bg-emerald-50 p-2"><p className="font-semibold text-emerald-700">Stock In</p><p className="mt-1 font-black text-emerald-950">{(movementByProduct.get(product.id)?.stockInUnits ?? 0).toLocaleString()} {product.unit}</p><p className="text-[10px] text-emerald-700">{(movementByProduct.get(product.id)?.stockInKg ?? 0).toLocaleString()} kg</p></div><div className="rounded-lg bg-slate-100 p-2"><p className="font-semibold text-slate-600">Balance</p><p className="mt-1 font-black text-slate-950">{(stock / Number(product.packageSizeKg ?? 1)).toLocaleString()} {product.unit}</p><p className="text-[10px] text-slate-600">{stock.toLocaleString()} kg</p></div><div className="rounded-lg bg-amber-50 p-2"><p className="font-semibold text-amber-700">Stock Out</p><p className="mt-1 font-black text-amber-950">{(movementByProduct.get(product.id)?.stockOutUnits ?? 0).toLocaleString()} {product.unit}</p><p className="text-[10px] text-amber-700">{(movementByProduct.get(product.id)?.stockOutKg ?? 0).toLocaleString()} kg</p></div></div><div className="mt-3 text-right text-xs text-slate-500">Minimum ya alert: {(threshold / Number(product.packageSizeKg ?? 1)).toLocaleString()} {product.unit} ({threshold.toLocaleString()} kg)</div></div>; }) : <div className="rounded-2xl bg-white p-14 text-center text-slate-500 md:col-span-2">Hakuna bidhaa active kwenye database.</div>}</div>
        </>}
      </div>
    </main>
  );
}
