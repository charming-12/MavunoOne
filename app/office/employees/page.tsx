"use client";

import { useEffect, useState } from "react";
import { Copy, Loader2, ShieldCheck, UserPlus, Users } from "lucide-react";
import { readStoredUser } from "@/lib/auth";

type StaffUser = { id: number; name: string; email: string; phone: string | null; jobTitle: string | null; role: string; createdAt: string };

const roleLabels: Record<string, string> = { admin: "Admin", owner: "Owner", boss: "Boss", manager: "Manager", cashier: "Cashier", storekeeper: "Storekeeper", machine_operator: "Machine Operator", customer: "Customer" };
const titleLabels: Record<string, string> = { finance: "Finance", operations_manager: "Operations Manager", storekeeper: "Storekeeper", cashier: "Cashier", machine_operator: "Machine Operator", administrator: "Administrator", owner: "Owner", boss: "Boss" };

export default function EmployeesPage() {
  const actor = readStoredUser();
  const canProvision = ["admin", "owner"].includes(actor?.role ?? "");
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [setupUrl, setSetupUrl] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", jobTitle: "cashier", role: "cashier" });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Users could not be loaded");
      setUsers(data.users ?? []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Users could not be loaded");
    } finally { setLoading(false); }
  };

  useEffect(() => { const timer = window.setTimeout(() => { void loadUsers(); }, 0); return () => window.clearTimeout(timer); }, []);

  const createInvitation = async (event: React.FormEvent) => {
    event.preventDefault(); setMessage(""); setSetupUrl("");
    const response = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await response.json();
    if (!response.ok) { setMessage(data.message || "Account could not be created"); return; }
    setSetupUrl(data.setupUrl); setMessage("Account imeundwa. Mtumie staff link ya kuweka password ndani ya saa 24."); setForm({ name: "", email: "", phone: "", jobTitle: "cashier", role: "cashier" }); void loadUsers();
  };

  return <div className="space-y-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Identity & access</p><h1 className="mt-1 flex items-center gap-2 text-3xl font-black text-slate-900"><Users size={28} className="text-emerald-600" />Accounts za staff</h1><p className="mt-2 text-slate-500">Kila mtu ana account yake; hakuna password ya pamoja ya Boss au Admin.</p></div></div>
    {!canProvision && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900"><ShieldCheck className="mb-2 text-amber-700" size={20} /><p>Unaweza kuona account list, lakini Admin/Owner pekee ndiye anayeweza kutengeneza invitation.</p></div>}
    {message && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{message}</div>}
    {setupUrl && <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5"><p className="font-bold text-sky-950">One-time password setup link</p><p className="mt-1 text-sm text-sky-800">Mtumie staff link hii kupitia njia salama. Itamalizika ndani ya saa 24 na staff ataweka password yake mwenyewe.</p><div className="mt-3 flex flex-col gap-2 sm:flex-row"><input readOnly value={setupUrl} className="min-w-0 flex-1 rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm text-slate-700" /><button type="button" onClick={() => void navigator.clipboard.writeText(setupUrl)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-700 px-4 py-2 text-sm font-bold text-white"><Copy size={16} />Copy link</button></div></div>}
    {canProvision && <form onSubmit={createInvitation} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-2"><UserPlus className="text-emerald-600" size={20} /><h2 className="text-lg font-black text-slate-900">Tengeneza staff account</h2></div><div className="grid gap-3 sm:grid-cols-2"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jina kamili" className="rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-emerald-600" /><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email ya staff" className="rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-emerald-600" /><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone (optional)" className="rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-emerald-600" /><select value={form.jobTitle} onChange={(e) => { const jobTitle = e.target.value; setForm({ ...form, jobTitle, role: jobTitle === "finance" || jobTitle === "operations_manager" ? "manager" : jobTitle }); }} className="rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-emerald-600"><option value="finance">Finance — Manager permissions</option><option value="operations_manager">Operations Manager</option><option value="storekeeper">Storekeeper</option><option value="cashier">Cashier</option><option value="machine_operator">Machine Operator</option><option value="boss">Boss</option><option value="admin">Admin</option></select></div><button type="submit" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 font-bold text-white hover:bg-emerald-800"><UserPlus size={18} />Create invitation</button></form>}
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-black text-slate-900">Watumiaji wa mfumo</h2><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{users.length} accounts</span></div>{loading ? <div className="flex items-center gap-2 py-10 text-slate-500"><Loader2 className="animate-spin" size={18} />Inapakia users...</div> : users.length === 0 ? <p className="py-10 text-center text-slate-500">Hakuna user record.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left"><thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-3 py-3">Jina</th><th className="px-3 py-3">Email</th><th className="px-3 py-3">Cheo / permissions</th><th className="px-3 py-3">Created</th></tr></thead><tbody className="divide-y divide-slate-100">{users.map((user) => <tr key={user.id}><td className="px-3 py-4 font-bold text-slate-800">{user.name}</td><td className="px-3 py-4 text-slate-600">{user.email}</td><td className="px-3 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${user.jobTitle === "finance" ? "bg-amber-50 text-amber-800" : "bg-slate-100 text-slate-700"}`}>{titleLabels[user.jobTitle ?? ""] ?? roleLabels[user.role] ?? user.role}{user.jobTitle === "finance" && <span className="ml-1 text-[10px] opacity-70">· Manager access</span>}</span></td><td className="px-3 py-4 text-sm text-slate-500">{new Date(user.createdAt).toLocaleDateString("sw-TZ")}</td></tr>)}</tbody></table></div>}</section>
  </div>;
}
