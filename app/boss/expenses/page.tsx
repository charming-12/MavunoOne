"use client";

import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { trpc } from "@/lib/trpc";

const money = (value: number) => `TZS ${Math.round(value).toLocaleString("en-TZ")}`;
const date = (value: string | Date) => new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));

export default function BossExpensesPage() {
  const query = trpc.expenses.list.useQuery({});
  const rows = query.data ?? [];
  const total = rows.reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
  return <main className="min-h-screen bg-[#f7f9f8] px-4 py-6 text-slate-900 sm:px-6 lg:px-8 lg:py-8"><div className="mx-auto max-w-[1400px] space-y-6"><Link href="/boss" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700"><ArrowLeft size={16} /> Rudi Command Center</Link><header className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Executive visibility</p><h1 className="mt-2 flex items-center gap-3 text-3xl font-bold tracking-tight text-slate-950"><FileText className="text-amber-600" /> Executive Expenses</h1><p className="mt-2 text-sm text-slate-500">Read-only view ya bills, utilities na gharama zote zilizoingizwa na Finance.</p></div><div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4"><p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Total expenses</p><p className="mt-1 text-2xl font-bold text-amber-950">{money(total)}</p></div></header><section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-4">Tarehe</th><th className="px-5 py-4">Category</th><th className="px-5 py-4">Description</th><th className="px-5 py-4 text-right">Amount</th></tr></thead><tbody className="divide-y divide-slate-100">{query.isLoading ? <tr><td colSpan={4} className="px-5 py-10 text-center text-sm text-slate-500">Inapakia ledger...</td></tr> : rows.map((row) => <tr key={row.id} className="hover:bg-slate-50"><td className="px-5 py-4 text-sm text-slate-600">{date(row.date)}</td><td className="px-5 py-4"><span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold capitalize text-amber-800">{row.category}</span></td><td className="px-5 py-4 text-sm font-semibold text-slate-800">{row.description || "—"}</td><td className="px-5 py-4 text-right text-sm font-bold text-slate-950">{money(Number(row.amount ?? 0))}</td></tr>)}{!query.isLoading && rows.length === 0 && <tr><td colSpan={4} className="px-5 py-10 text-center text-sm text-slate-500">Hakuna gharama zilizorekodiwa kwenye database.</td></tr>}</tbody></table></div></section></div></main>;
}
