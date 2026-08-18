"use client";

import { useMemo, useState } from "react";
import { AlertCircle, Calendar, CheckCircle2, Loader2, Plus, Receipt, Save, Wallet } from "lucide-react";
import { trpc } from "@/lib/trpc";

const categories = [
  "Umeme", "Maji", "Internet", "Simu", "Kodi ya Pango", "Mafuta ya Magari",
  "Transport", "Maintenance", "Security", "Usafi", "Insurance", "Leseni na Vibali",
  "Supplies", "Mishahara", "Marketing", "Bank Charges", "Supplier", "Nyingine",
];

export default function ExpensesPage() {
  const expensesQuery = trpc.expenses.list.useQuery({});
  const createExpense = trpc.expenses.create.useMutation({ onSuccess: () => void expensesQuery.refetch() });
  const [showForm, setShowForm] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [form, setForm] = useState({ category: "", amount: "", date: new Date().toISOString().slice(0, 10), provider: "", reference: "", description: "", recurring: false });

  const rows = useMemo(() => (expensesQuery.data ?? []).map((expense) => ({
    ...expense,
    amountNumber: Number(expense.amount || 0),
  })), [expensesQuery.data]);
  const filteredExpenses = useMemo(() => rows.filter((expense) => filterCategory === "all" || expense.category === filterCategory).sort((a, b) => sortBy === "amount" ? b.amountNumber - a.amountNumber : sortBy === "category" ? a.category.localeCompare(b.category) : new Date(b.date).getTime() - new Date(a.date).getTime()), [rows, filterCategory, sortBy]);
  const total = rows.reduce((sum, expense) => sum + expense.amountNumber, 0);
  const largest = rows.length ? Math.max(...rows.map((expense) => expense.amountNumber)) : 0;
  const average = rows.length ? total / rows.length : 0;
  const categoryBreakdown = categories.map((category) => ({ category, amount: rows.filter((expense) => expense.category === category).reduce((sum, expense) => sum + expense.amountNumber, 0), count: rows.filter((expense) => expense.category === category).length })).filter((item) => item.count > 0);

  const submitExpense = async (event: React.FormEvent) => {
    event.preventDefault();
    const amount = Number(form.amount);
    if (!form.category || !Number.isFinite(amount) || amount <= 0) return;
    const detail = [form.provider && `Provider: ${form.provider}`, form.reference && `Reference: ${form.reference}`, form.recurring && "Recurring: monthly", form.description].filter(Boolean).join(" • ");
    await createExpense.mutateAsync({ category: form.category, amount, description: detail || undefined, date: form.date ? new Date(`${form.date}T12:00:00`).toISOString() : undefined });
    setForm({ category: "", amount: "", date: new Date().toISOString().slice(0, 10), provider: "", reference: "", description: "", recurring: false });
    setShowForm(false);
  };

  return <div className="space-y-6">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Bills & expenses</p><h1 className="mt-1 flex items-center gap-2 text-3xl font-black text-slate-900"><Receipt className="text-orange-600" size={30} /> Bills na Gharama</h1><p className="mt-2 text-slate-500">Rekodi umeme, maji, internet, kodi, mafuta, suppliers na gharama nyingine kutoka database halisi.</p></div><button type="button" onClick={() => setShowForm((value) => !value)} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white shadow-sm hover:bg-emerald-800"><Plus size={18} /> Rekodi bill/gharama</button></header>

    {expensesQuery.isLoading && <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500"><Loader2 className="animate-spin" size={18} />Inapakia bills na expenses...</div>}
    {expensesQuery.error && <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"><AlertCircle size={18} />Bills hazikuweza kupakiwa kutoka database.</div>}
    {createExpense.error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Gharama haijahifadhiwa. Tafadhali jaribu tena.</div>}

    {showForm && <form onSubmit={submitExpense} className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm"><div className="mb-4 flex items-center gap-2"><Wallet className="text-emerald-700" size={20} /><h2 className="text-lg font-black text-emerald-950">Rekodi bill au gharama mpya</h2></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><select required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="rounded-lg border border-emerald-200 bg-white px-3 py-3 text-sm"><option value="">Chagua category</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select><input required type="number" min="1" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder="Kiasi (TZS)" className="rounded-lg border border-emerald-200 bg-white px-3 py-3 text-sm" /><input required type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className="rounded-lg border border-emerald-200 bg-white px-3 py-3 text-sm" /><input value={form.provider} onChange={(event) => setForm({ ...form, provider: event.target.value })} placeholder="Provider/Muuzaji" className="rounded-lg border border-emerald-200 bg-white px-3 py-3 text-sm" /><input value={form.reference} onChange={(event) => setForm({ ...form, reference: event.target.value })} placeholder="Invoice/reference number" className="rounded-lg border border-emerald-200 bg-white px-3 py-3 text-sm" /><input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Maelezo ya bill" className="rounded-lg border border-emerald-200 bg-white px-3 py-3 text-sm" /></div><label className="mt-4 flex items-center gap-2 text-sm font-semibold text-emerald-950"><input type="checkbox" checked={form.recurring} onChange={(event) => setForm({ ...form, recurring: event.target.checked })} className="h-4 w-4 accent-emerald-700" />Hii ni bill inayojirudia kila mwezi</label><div className="mt-5 flex flex-wrap gap-3"><button type="submit" disabled={createExpense.isPending} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white disabled:opacity-60"><Save size={17} />{createExpense.isPending ? "Inahifadhi..." : "Hifadhi bill"}</button><button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700">Ghairi</button></div></form>}

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Total recorded</p><p className="mt-2 text-2xl font-black text-slate-900">TZS {total.toLocaleString()}</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">Bills/expenses</p><p className="mt-2 text-2xl font-black text-slate-900">{rows.length}</p></div><div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm"><p className="text-sm text-amber-700">Largest entry</p><p className="mt-2 text-2xl font-black text-amber-950">TZS {largest.toLocaleString()}</p></div><div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm"><p className="text-sm text-emerald-700">Average entry</p><p className="mt-2 text-2xl font-black text-emerald-950">TZS {Math.round(average).toLocaleString()}</p></div></div>

    <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setFilterCategory("all")} className={`rounded-xl px-3 py-2 text-sm font-bold ${filterCategory === "all" ? "bg-slate-900 text-white" : "bg-white text-slate-600"}`}>Zote</button>{categories.slice(0, 6).map((category) => <button type="button" key={category} onClick={() => setFilterCategory(category)} className={`rounded-xl px-3 py-2 text-sm font-bold ${filterCategory === category ? "bg-emerald-700 text-white" : "bg-white text-slate-600"}`}>{category}</button>)}</div><select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"><option value="date">Mpya kwanza</option><option value="amount">Kiasi kikubwa</option><option value="category">Category</option></select></div>

    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="min-w-[760px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-4">Category</th><th className="px-5 py-4">Maelezo/Provider</th><th className="px-5 py-4">Tarehe</th><th className="px-5 py-4 text-right">Kiasi</th><th className="px-5 py-4">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredExpenses.length ? filteredExpenses.map((expense) => <tr key={expense.id} className="hover:bg-emerald-50/30"><td className="px-5 py-4"><span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-800">{expense.category}</span></td><td className="max-w-[380px] px-5 py-4 text-slate-600">{expense.description || "—"}</td><td className="px-5 py-4 text-slate-500"><span className="inline-flex items-center gap-1"><Calendar size={14} />{new Date(expense.date).toLocaleDateString()}</span></td><td className="px-5 py-4 text-right font-black text-slate-900">TZS {expense.amountNumber.toLocaleString()}</td><td className="px-5 py-4"><span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800"><CheckCircle2 size={13} />Recorded</span></td></tr>) : <tr><td colSpan={5} className="px-6 py-14 text-center text-slate-500">Hakuna bills/expenses za kuonyesha. Anza kwa kubonyeza “Rekodi bill/gharama”.</td></tr>}</tbody></table></div></div>

    {categoryBreakdown.length > 0 && <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-black text-slate-900">Gharama kwa category</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{categoryBreakdown.map((item) => <div key={item.category} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"><span className="text-sm font-semibold text-slate-700">{item.category} <span className="text-xs text-slate-400">({item.count})</span></span><span className="text-sm font-black text-slate-900">TZS {item.amount.toLocaleString()}</span></div>)}</div></section>}
  </div>;
}
