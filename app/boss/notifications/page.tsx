"use client";

import { AlertCircle, Bell, CheckCircle2, Loader2, TrendingUp } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { readStoredUser } from "@/lib/auth";

const iconForType = (type: string) => type.includes("stock") ? AlertCircle : type.includes("sale") ? TrendingUp : type.includes("error") ? AlertCircle : CheckCircle2;
const colorForType = (type: string) => type.includes("stock") || type.includes("error") ? "border-amber-400 bg-amber-50 text-amber-900" : type.includes("sale") ? "border-sky-400 bg-sky-50 text-sky-900" : "border-emerald-400 bg-emerald-50 text-emerald-900";

export default function BossNotificationsPage() {
  const [storedUser] = useState(() => readStoredUser());
  const query = trpc.notifications.list.useQuery(undefined, { enabled: storedUser?.role === "boss", refetchInterval: 30000 });
  const notifications = query.data ?? [];
  const unread = notifications.filter((item) => !item.isRead).length;
  return <main className="space-y-6 p-4 sm:p-6 lg:p-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Live operations feed</p><h1 className="mt-1 flex items-center gap-2 text-3xl font-black text-slate-900"><Bell className="text-emerald-700" size={30} />Taarifa za biashara</h1><p className="mt-2 text-slate-500">Arifa zinazotoka kwenye database ya MavunoOne—hakuna sample notifications.</p></div><div className="rounded-2xl bg-emerald-700 px-5 py-4 text-white"><p className="text-xs text-emerald-100">Unread</p><p className="mt-1 text-2xl font-black">{unread}</p></div></div>{query.isLoading && <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500"><Loader2 className="animate-spin" size={18} />Inapakia taarifa halisi...</div>}{query.error && <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">Taarifa hazikuweza kupakiwa kutoka database.</div>}{!query.isLoading && !query.error && notifications.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center"><Bell className="mx-auto text-slate-300" size={34} /><h2 className="mt-4 font-black text-slate-900">Hakuna taarifa mpya</h2><p className="mt-1 text-sm text-slate-500">Mabadiliko ya stock, sales, fleet au integrations yataonekana hapa yakitengenezwa na mfumo.</p></div>}<div className="space-y-3">{notifications.map((notification) => { const Icon = iconForType(notification.type); return <article key={notification.id} className={`rounded-2xl border-l-4 p-5 shadow-sm ${colorForType(notification.type)}`}><div className="flex items-start gap-4"><Icon className="mt-0.5 shrink-0" size={22} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><h2 className="font-black">{notification.title}</h2>{!notification.isRead && <span className="rounded-full bg-white/70 px-2 py-1 text-[11px] font-bold">NEW</span>}</div><p className="mt-1 text-sm opacity-80">{notification.message || "Hakuna maelezo ya ziada."}</p><p className="mt-3 text-xs opacity-60">{new Intl.DateTimeFormat("sw-TZ", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Dar_es_Salaam" }).format(new Date(notification.createdAt))}</p></div></div></article>; })}</div></main>;
}
