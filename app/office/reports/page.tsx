"use client";

import { AlertTriangle, Download, Loader2, Printer, TrendingUp } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

const money = (value: number) => `TZS ${value.toLocaleString()}`;

export default function ReportsPage() {
  const analyticsQuery = trpc.analytics.summary.useQuery();
  const stockQuery = trpc.products.lowStock.useQuery();
  const analytics = analyticsQuery.data;
  const daily = analytics?.daily ?? [];
  const maxSales = Math.max(...daily.map((day) => day.sales), 1);
  const averageSales = daily.length ? (analytics?.totalSales ?? 0) / daily.length : 0;
  const averageExpenses = daily.length ? (analytics?.totalExpenses ?? 0) / daily.length : 0;
  const margin = analytics?.totalSales ? ((analytics.totalProfit / analytics.totalSales) * 100).toFixed(1) : "0.0";
  const bestDay = daily.reduce((best, day) => day.profit > (best?.profit ?? -Infinity) ? day : best, daily[0]);
  const [exporting, setExporting] = useState<string | null>(null);
  const [exportError, setExportError] = useState("");

  const downloadReport = async (format: "pdf" | "csv" | "json") => {
    const from = daily[0]?.date ?? new Date().toISOString().slice(0, 10);
    const to = daily[daily.length - 1]?.date ?? from;
    const payload = { period: `${from} to ${to}`, reports: daily.map((day) => ({ date: day.date, totalSales: day.sales, totalExpenses: day.expenses, profit: day.profit, transactions: 0, topProduct: "—" })), summary: { totalRevenue: analytics?.totalSales ?? 0, totalExpenses: analytics?.totalExpenses ?? 0, netProfit: analytics?.totalProfit ?? 0, averageTransaction: 0, topProducts: [], customerCount: 0 } };
    setExporting(format);
    setExportError("");
    try {
      const response = await fetch("/api/analytics/export", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: payload, format, period: { from, to } }) });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => null) as { error?: string; message?: string } | null;
        throw new Error(errorBody?.error || errorBody?.message || `Export failed (${response.status})`);
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `mavunoone-analytics-${from}-${to}.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "Report export failed");
    } finally {
      setExporting(null);
    }
  };

  if (analyticsQuery.isLoading) return <div className="flex min-h-[320px] items-center justify-center gap-2 text-slate-500"><Loader2 className="animate-spin" size={20} />Inapakia ripoti...</div>;
  if (analyticsQuery.error) return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">Ripoti haikuweza kupakiwa. Hakikisha umeingia kama staff na database inapatikana.</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Business intelligence</p><h1 className="mt-1 text-3xl font-black text-slate-900">Ripoti za biashara</h1><p className="mt-2 text-slate-500">Mauzo, matumizi na faida halisi za siku saba zilizopita.</p></div><div className="flex flex-wrap gap-2"><button type="button" disabled={Boolean(exporting)} onClick={() => void downloadReport("pdf")} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60"><Download size={17} />{exporting === "pdf" ? "Inatengeneza PDF..." : "Download PDF"}</button><button type="button" disabled={Boolean(exporting)} onClick={() => void downloadReport("csv")} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"><Download size={16} />CSV</button><button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"><Printer size={17} />Print</button></div></div>{exportError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">PDF/export haikufanikiwa: {exportError}</div>}

      <div className="grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-emerald-700 p-5 text-white shadow-lg"><p className="text-sm text-emerald-100">Jumla ya mauzo</p><p className="mt-2 text-3xl font-black">{money(analytics?.totalSales ?? 0)}</p><p className="mt-1 text-xs text-emerald-100">Siku 7 zilizopita</p></div><div className="rounded-2xl bg-slate-900 p-5 text-white shadow-lg"><p className="text-sm text-slate-300">Jumla ya matumizi</p><p className="mt-2 text-3xl font-black">{money(analytics?.totalExpenses ?? 0)}</p><p className="mt-1 text-xs text-slate-400">Gharama zilizorekodiwa</p></div><div className="rounded-2xl bg-amber-500 p-5 text-slate-950 shadow-lg"><p className="text-sm text-amber-950/70">Faida ya kipindi</p><p className="mt-2 text-3xl font-black">{money(analytics?.totalProfit ?? 0)}</p><p className="mt-1 text-xs text-amber-950/70">Margin {margin}%</p></div></div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-6 flex items-center gap-2"><TrendingUp className="text-emerald-600" size={20} /><h2 className="text-lg font-black text-slate-900">Mauzo kwa siku</h2></div>{daily.every((day) => day.sales === 0) ? <div className="rounded-xl bg-slate-50 p-10 text-center text-sm text-slate-500">Hakuna mauzo yaliyorekodiwa kwenye siku saba zilizopita.</div> : <div className="flex h-64 items-end gap-2">{daily.map((day) => <div key={day.date} className="flex flex-1 flex-col items-center gap-2"><div className="flex h-full w-full items-end"><div className="w-full rounded-t-xl bg-gradient-to-t from-emerald-700 to-emerald-400 transition hover:opacity-80" style={{ height: `${Math.max((day.sales / maxSales) * 100, day.sales ? 4 : 1)}%` }} title={`${day.date}: ${money(day.sales)}`} /></div><span className="text-[10px] font-semibold text-slate-500">{day.date.slice(5)}</span></div>)}</div>}</section>

      <div className="grid gap-6 lg:grid-cols-2"><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="mb-4 text-lg font-black text-slate-900">Muhtasari wa kipindi</h2><div className="space-y-3"><div className="flex justify-between rounded-xl bg-emerald-50 p-4"><span className="text-sm text-slate-600">Wastani wa mauzo kwa siku</span><strong className="text-emerald-700">{money(averageSales)}</strong></div><div className="flex justify-between rounded-xl bg-orange-50 p-4"><span className="text-sm text-slate-600">Wastani wa matumizi kwa siku</span><strong className="text-orange-700">{money(averageExpenses)}</strong></div><div className="flex justify-between rounded-xl bg-purple-50 p-4"><span className="text-sm text-slate-600">Siku bora</span><strong className="text-purple-700">{bestDay ? `${bestDay.date} — ${money(bestDay.profit)}` : "Hakuna data"}</strong></div></div></section><section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm"><div className="mb-4 flex items-center gap-2"><AlertTriangle className="text-amber-600" size={20} /><h2 className="text-lg font-black text-amber-950">Stock ya kuangalia</h2></div>{stockQuery.isLoading ? <p className="text-sm text-amber-800">Inapakia stock...</p> : stockQuery.data?.length ? <div className="space-y-3">{stockQuery.data.slice(0, 5).map((product) => <div key={product.id} className="flex items-center justify-between rounded-xl bg-white p-3"><span className="font-semibold text-slate-800">{product.name}</span><span className="rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-700">{product.currentStock} {product.unit}</span></div>)}</div> : <p className="text-sm text-emerald-800">Hakuna bidhaa iliyo chini ya threshold.</p>}</section></div>
    </div>
  );
}
