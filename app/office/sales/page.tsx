"use client";

import { useState } from "react";
import { Download, Eye, Loader2, X } from "lucide-react";
import { trpc } from "@/lib/trpc";

const money = (value: number) => `TZS ${Math.round(value).toLocaleString("en-TZ")}`;
const dateLabel = (value: string | Date) => new Intl.DateTimeFormat("sw-TZ", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
type SaleRow = { id: number; invoiceNumber: string; customerName: string; totalAmount: string; itemCount: number; createdAt: string | Date; paymentMethod: string; paymentStatus: string };

export default function SalesHistoryPage() {
  const salesQuery = trpc.sales.list.useQuery();
  const [selectedSale, setSelectedSale] = useState<SaleRow | null>(null);
  const sales = salesQuery.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">Sales ledger</p>
        <h1 className="mt-1 text-3xl font-black text-slate-900">Historia ya Mauzo</h1>
        <p className="mt-2 text-slate-600">Hapa ndipo mauzo yaliyokamilishwa kwenye POS yanahifadhiwa na kuonekana kwa staff wenye ruhusa.</p>
      </div>

      {salesQuery.isLoading ? <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-10 text-slate-600"><Loader2 className="animate-spin text-emerald-600" size={20} />Inapakia sales ledger...</div> : salesQuery.error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">Imeshindikana kupakia historia ya mauzo. Tafadhali refresh au wasiliana na Admin.</div> : <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div><h2 className="text-lg font-black text-slate-900">Miamala halisi ya database</h2><p className="mt-1 text-sm text-slate-500">{sales.length} sale zilizopatikana · Cashier, Admin, Finance, Operations Manager na Boss huona kulingana na ruhusa.</p></div><span className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">Live database</span></div>
        <div className="overflow-x-auto"><table className="min-w-[900px] w-full text-left"><thead className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Invoice</th><th className="px-5 py-3">Mteja</th><th className="px-5 py-3">Jumla</th><th className="px-5 py-3">Bidhaa</th><th className="px-5 py-3">Tarehe</th><th className="px-5 py-3">Malipo</th><th className="px-5 py-3">Hali</th><th className="px-5 py-3 text-right">Hatua</th></tr></thead><tbody className="divide-y divide-slate-100">{sales.map((sale) => { const paid = sale.paymentStatus === "paid"; return <tr key={sale.id} className="hover:bg-emerald-50/30"><td className="px-5 py-4 font-bold text-emerald-700">{sale.invoiceNumber}</td><td className="px-5 py-4 text-sm text-slate-700">{sale.customerName}</td><td className="px-5 py-4 font-black text-slate-900">{money(Number(sale.totalAmount))}</td><td className="px-5 py-4 text-sm text-slate-600">{sale.itemCount} item(s)</td><td className="px-5 py-4 text-sm text-slate-600">{dateLabel(sale.createdAt)}</td><td className="px-5 py-4 text-sm capitalize text-slate-600">{sale.paymentMethod}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-black ${paid ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`}>{paid ? "Paid" : "Pending"}</span></td><td className="px-5 py-4"><div className="flex justify-end gap-2"><button type="button" onClick={() => setSelectedSale(sale)} className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:border-emerald-300 hover:text-emerald-700" aria-label={`View ${sale.invoiceNumber}`}><Eye size={17} /></button><button type="button" onClick={() => window.print()} className="rounded-lg border border-slate-200 p-2 text-emerald-700 hover:border-emerald-300" aria-label={`Print ${sale.invoiceNumber}`}><Download size={17} /></button></div></td></tr>; })}{sales.length === 0 && <tr><td colSpan={8} className="px-5 py-12 text-center text-sm text-slate-500">Hakuna sale iliyohifadhiwa bado. Sale itatokea hapa baada ya Cashier kubonyeza Kamilisha Mauzo.</td></tr>}</tbody></table></div>
      </div>}

      {selectedSale && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true"><div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-600">Sale details</p><h2 className="mt-1 text-2xl font-black text-slate-900">{selectedSale.invoiceNumber}</h2></div><button type="button" onClick={() => setSelectedSale(null)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close"><X size={18} /></button></div><div className="mt-5 grid grid-cols-2 gap-3 text-sm"><div className="rounded-xl bg-slate-50 p-3"><span className="block text-xs text-slate-500">Mteja</span><strong>{selectedSale.customerName}</strong></div><div className="rounded-xl bg-slate-50 p-3"><span className="block text-xs text-slate-500">Total</span><strong>{money(Number(selectedSale.totalAmount))}</strong></div><div className="rounded-xl bg-slate-50 p-3"><span className="block text-xs text-slate-500">Payment</span><strong className="capitalize">{selectedSale.paymentMethod}</strong></div><div className="rounded-xl bg-slate-50 p-3"><span className="block text-xs text-slate-500">Status</span><strong>{selectedSale.paymentStatus === "paid" ? "Paid" : "Pending"}</strong></div></div><p className="mt-5 text-sm leading-6 text-slate-600">Sale hii imehifadhiwa kwenye sales ledger. Bidhaa zake na stock movement ziliandikwa wakati wa kukamilisha sale.</p></div></div>}
    </div>
  );
}
