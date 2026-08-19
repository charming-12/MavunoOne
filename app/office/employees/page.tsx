"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Check, Copy, Loader2, ShieldCheck, Square, Trash2, UserPlus, Users, X } from "lucide-react";
import { readStoredUser } from "@/lib/auth";

type StaffUser = { id: number; name: string; email: string; phone: string | null; jobTitle: string | null; role: string; isActive: boolean; createdAt: string };

const roleLabels: Record<string, string> = { admin: "Admin", owner: "Owner", boss: "Boss", manager: "Manager", cashier: "Cashier", storekeeper: "Storekeeper", machine_operator: "Machine Operator", customer: "Customer" };
const titleLabels: Record<string, string> = { finance: "Finance", operations_manager: "Operations Manager", storekeeper: "Storekeeper", cashier: "Cashier", machine_operator: "Machine Operator", administrator: "Administrator", owner: "Owner", boss: "Boss" };
const protectedRoles = new Set(["boss", "admin", "owner"]);

export default function EmployeesPage() {
  const actor = readStoredUser();
  const canProvision = ["admin", "owner"].includes(actor?.role ?? "");
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [setupUrl, setSetupUrl] = useState("");
  const [cleaning, setCleaning] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", jobTitle: "cashier", role: "cashier" });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Users could not be loaded");
      setUsers(data.users ?? []);
      setSelectedIds([]);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Users could not be loaded"); }
    finally { setLoading(false); }
  };

  useEffect(() => { const timer = window.setTimeout(() => { void loadUsers(); }, 0); return () => window.clearTimeout(timer); }, []);

  const removableUsers = useMemo(() => users.filter((user) => user.isActive && !protectedRoles.has(user.role) && user.id !== actor?.id), [users, actor?.id]);
  const allRemovableSelected = removableUsers.length > 0 && removableUsers.every((user) => selectedIds.includes(user.id));
  const toggleSelected = (id: number) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const toggleAll = () => setSelectedIds(allRemovableSelected ? [] : removableUsers.map((user) => user.id));

  const removeUsers = async (ids: number[]) => {
    if (!ids.length) return;
    const label = ids.length === 1 ? "account hii" : `accounts ${ids.length}`;
    if (!window.confirm(`Una uhakika unataka kuondoa access ya ${label}? Business records zitahifadhiwa kwa audit, lakini user hataweza kuingia tena.`)) return;
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/admin/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Accounts could not be removed");
      setMessage(data.message); await loadUsers();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Accounts could not be removed"); }
    finally { setBusy(false); }
  };

  const removeSeededMockAccounts = async () => {
    if (!window.confirm("Ondoa sample/mock accounts zilizowekwa na mfumo? Boss na Admin hazitaguswa.")) return;
    setCleaning(true); setMessage("");
    try {
      const response = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "remove-seeded-mock-accounts" }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Mock accounts could not be removed");
      setMessage(data.message); await loadUsers();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Mock accounts could not be removed"); }
    finally { setCleaning(false); }
  };

  const createInvitation = async (event: FormEvent) => {
    event.preventDefault(); setMessage(""); setSetupUrl("");
    const response = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await response.json();
    if (!response.ok) { setMessage(data.message || "Account could not be created"); return; }
    setSetupUrl(data.setupUrl); setMessage(data.emailSent ? "Account imeundwa na invitation imetumwa kwenye email ya staff. Staff ataweka password yake mwenyewe." : "Account imeundwa, lakini email haikutumwa. Tumia link ya setup kwa njia salama."); setForm({ name: "", email: "", phone: "", jobTitle: "cashier", role: "cashier" }); await loadUsers();
  };

  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Identity & access</p><h1 className="mt-1 flex items-center gap-2 text-3xl font-black text-slate-900"><Users size={28} className="text-emerald-600" />Accounts za staff</h1><p className="mt-2 text-slate-500">Kila staff ana account yake; access inaweza kuondolewa bila kufuta historia ya biashara.</p></div></div>
    {!canProvision && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900"><ShieldCheck className="mb-2 text-amber-700" size={20} /><p>Unaweza kuona account list, lakini Admin/Owner pekee ndiye anayeweza kutengeneza invitation au kuondoa access.</p></div>}
    {message && <div className="flex items-start justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><span>{message}</span><button onClick={() => setMessage("")} aria-label="Close message"><X size={17} /></button></div>}
    {setupUrl && <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5"><p className="font-bold text-sky-950">One-time password setup link</p><p className="mt-1 text-sm text-sky-800">Mtumie staff link hii kupitia njia salama. Itamalizika ndani ya saa 24 na staff ataweka password yake mwenyewe.</p><div className="mt-3 flex flex-col gap-2 sm:flex-row"><input readOnly value={setupUrl} className="min-w-0 flex-1 rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm text-slate-700" /><button type="button" onClick={() => void navigator.clipboard.writeText(setupUrl)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-700 px-4 py-2 text-sm font-bold text-white"><Copy size={16} />Copy link</button></div></div>}
    {canProvision && <form onSubmit={createInvitation} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-2"><UserPlus className="text-emerald-600" size={20} /><h2 className="text-lg font-black text-slate-900">Tengeneza staff account</h2></div><div className="grid gap-3 sm:grid-cols-2"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jina kamili" className="rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-emerald-600" /><input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email ya staff" className="rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-emerald-600" /><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone (optional)" className="rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-emerald-600" /><select value={form.jobTitle} onChange={(e) => { const jobTitle = e.target.value; setForm({ ...form, jobTitle, role: jobTitle === "finance" || jobTitle === "operations_manager" ? "manager" : jobTitle }); }} className="rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-emerald-600"><option value="finance">Finance — Manager permissions</option><option value="operations_manager">Operations Manager</option><option value="storekeeper">Storekeeper</option><option value="cashier">Cashier</option><option value="machine_operator">Machine Operator</option></select></div><button type="submit" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 font-bold text-white hover:bg-emerald-800"><UserPlus size={18} />Create invitation</button></form>}
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-black text-slate-900">Watumiaji wa mfumo</h2><p className="mt-1 text-xs text-slate-500">Boss, Admin na Owner wa msingi hawawezi kuondolewa. Staff wenye records huondolewa access tu ili audit ibaki.</p></div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{users.filter((user) => user.isActive).length} active</span>{canProvision && <button type="button" disabled={cleaning} onClick={() => void removeSeededMockAccounts()} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-50">{cleaning ? "Inaondoa..." : "Ondoa sample accounts"}</button>}{canProvision && selectedIds.length > 0 && <button type="button" disabled={busy} onClick={() => void removeUsers(selectedIds)} className="inline-flex items-center gap-2 rounded-lg bg-red-700 px-3 py-2 text-xs font-bold text-white hover:bg-red-800 disabled:opacity-50"><Trash2 size={14} />Ondoa zilizochaguliwa ({selectedIds.length})</button>}</div></div>
      {loading ? <div className="flex items-center gap-2 py-10 text-slate-500"><Loader2 className="animate-spin" size={18} />Inapakia users...</div> : users.length === 0 ? <p className="py-10 text-center text-slate-500">Hakuna user record.</p> : <div className="overflow-x-auto"><table className="w-full min-w-[780px] text-left"><thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500"><tr><th className="w-12 px-3 py-3"><button type="button" onClick={toggleAll} disabled={!canProvision || removableUsers.length === 0} aria-label="Select removable accounts" className="text-slate-500 disabled:opacity-30">{allRemovableSelected ? <Check size={18} /> : <Square size={18} />}</button></th><th className="px-3 py-3">Jina</th><th className="px-3 py-3">Email</th><th className="px-3 py-3">Cheo / permissions</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{users.map((user) => { const protectedAccount = protectedRoles.has(user.role) || user.id === actor?.id; return <tr key={user.id} className={!user.isActive ? "bg-slate-50 opacity-60" : ""}><td className="px-3 py-4"><button type="button" onClick={() => toggleSelected(user.id)} disabled={!canProvision || protectedAccount || !user.isActive} aria-label={`Select ${user.name}`} className="text-slate-500 disabled:opacity-30">{selectedIds.includes(user.id) ? <Check size={18} className="text-red-700" /> : <Square size={18} />}</button></td><td className="px-3 py-4 font-bold text-slate-800">{user.name}</td><td className="px-3 py-4 text-slate-600">{user.email}</td><td className="px-3 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${protectedAccount ? "bg-blue-50 text-blue-800" : "bg-slate-100 text-slate-700"}`}>{titleLabels[user.jobTitle ?? ""] ?? roleLabels[user.role] ?? user.role}{protectedAccount && <span className="ml-1 text-[10px] opacity-70">· protected</span>}</span></td><td className="px-3 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${user.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>{user.isActive ? "Active" : "Access removed"}</span></td><td className="px-3 py-4">{canProvision && !protectedAccount && user.isActive ? <button type="button" disabled={busy} onClick={() => void removeUsers([user.id])} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-2.5 py-2 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"><Trash2 size={14} />Ondoa</button> : <span className="text-xs font-semibold text-slate-400">{protectedAccount ? "Imelindwa" : "Imezimwa"}</span>}</td></tr>; })}</tbody></table></div>}
    </section>
  </div>;
}
