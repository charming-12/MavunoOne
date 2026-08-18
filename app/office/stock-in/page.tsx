"use client";

import { Plus, Loader2, PackageOpen } from "lucide-react";
import { trpc } from "@/lib/trpc";

const money = (value: number) => `TZS ${value.toLocaleString()}`;

export default function StockInPage() {
  const recordsQuery = trpc.stock.stockIn.list.useQuery();
  const productsQuery = trpc.products.list.useQuery();
  const products = new Map((productsQuery.data ?? []).map((product) => [product.id, product]));

  if (recordsQuery.isLoading || productsQuery.isLoading) {
    return <div className="flex min-h-[320px] items-center justify-center gap-2 text-emerald-700"><Loader2 className="animate-spin" size={20} />Inapakia stock in...</div>;
  }

  if (recordsQuery.error || productsQuery.error) {
    return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">Stock in haikuweza kupakiwa. Hakikisha umeingia na database inapatikana.</div>;
  }

  const records = recordsQuery.data ?? [];
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Inventory control</p><h1 className="text-3xl font-black text-slate-900">Stock In</h1><p className="mt-2 text-slate-600">Rekodi halisi za bidhaa zinazoingia kwenye biashara.</p></div>
        <button type="button" className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 font-bold text-white shadow-sm hover:bg-emerald-800"><Plus size={20} />Stock Mpya</button>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-black text-slate-900">Mizigo ya karibuni</h2><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{records.length} records</span></div>
        {records.length === 0 ? <div className="rounded-xl bg-slate-50 p-10 text-center text-slate-500"><PackageOpen className="mx-auto mb-3" size={32} /><p>Hakuna stock-in iliyorekodiwa bado.</p></div> : <div className="overflow-x-auto"><table className="w-full min-w-[760px]"><thead className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Bidhaa</th><th className="px-4 py-3">Kiasi</th><th className="px-4 py-3">Supplier</th><th className="px-4 py-3">Bei/unit</th><th className="px-4 py-3">Jumla</th><th className="px-4 py-3">Tarehe</th></tr></thead><tbody className="divide-y divide-slate-100">{records.map((record) => { const product = products.get(record.productId); return <tr key={record.id} className="hover:bg-slate-50"><td className="px-4 py-4 font-semibold text-slate-800">{product?.name ?? `Product #${record.productId}`}</td><td className="px-4 py-4 text-slate-600">{Number(record.quantity).toLocaleString()} {record.entryUnit ?? product?.unit ?? "unit"}<span className="block text-xs text-slate-500">= {Number(record.baseQuantity ?? record.quantity).toLocaleString()} kg base</span></td><td className="px-4 py-4 text-slate-600">{record.supplierName ?? "—"}</td><td className="px-4 py-4 text-slate-600">{money(Number(record.costPerUnit ?? 0))}</td><td className="px-4 py-4 font-bold text-slate-800">{money(Number(record.totalCost ?? 0))}</td><td className="px-4 py-4 text-slate-600">{new Date(record.date).toLocaleDateString("sw-TZ")}</td></tr>; })}</tbody></table></div>}
      </div>
    </div>
  );
}
