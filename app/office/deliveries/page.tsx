"use client";

import { FormEvent, useState } from "react";
import { Loader2, MapPin, Plus, Truck, X } from "lucide-react";
import { trpc } from "@/lib/trpc";

const initialForm = { vehicleId: "", driverName: "", driverPhone: "", destination: "", totalWeight: "", invoiceNumber: "", recipientPhone: "", notes: "" };
const formatDate = (value: string | Date | null | undefined) => value ? new Intl.DateTimeFormat("sw-TZ", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Dar_es_Salaam" }).format(new Date(value)) : "Haijawekwa";
const statusLabel: Record<string, string> = { scheduled: "Imepangwa", in_transit: "Ipo njiani", delivered: "Imewasilishwa", cancelled: "Imeghairiwa" };

export default function DeliveriesPage() {
  const utils = trpc.useUtils();
  const deliveriesQuery = trpc.deliveries.list.useQuery();
  const vehiclesQuery = trpc.vehicles.list.useQuery();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [notice, setNotice] = useState("");
  const createDelivery = trpc.deliveries.create.useMutation({
    onSuccess: () => {
      utils.deliveries.list.invalidate();
      setForm(initialForm);
      setShowForm(false);
      setNotice("Delivery imehifadhiwa kwenye database na imepangwa.");
    },
    onError: (error) => setNotice(error.message || "Delivery haijahifadhiwa. Tafadhali jaribu tena."),
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setNotice("");
    createDelivery.mutate({
      vehicleId: form.vehicleId ? Number(form.vehicleId) : undefined,
      driverName: form.driverName.trim(),
      driverPhone: form.driverPhone.trim(),
      destination: form.destination.trim(),
      totalWeight: Number(form.totalWeight) || 0,
      invoiceNumber: form.invoiceNumber.trim() || undefined,
      recipientPhone: form.recipientPhone.trim() || undefined,
      notes: form.notes.trim() || undefined,
    });
  };

  const deliveries = deliveriesQuery.data ?? [];
  const vehicles = vehiclesQuery.data ?? [];

  return <div className="space-y-6">
    <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
      <div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Operations logistics</p><h1 className="mt-2 flex items-center gap-3 text-3xl font-black tracking-tight text-slate-950"><Truck className="text-emerald-600" /> Deliveries</h1><p className="mt-2 text-sm text-slate-500">Panga shipment, hifadhi dereva na destination, kisha fuatilia delivery iliyotoka.</p></div>
      <button type="button" onClick={() => { setShowForm((value) => !value); setNotice(""); }} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-black text-white hover:bg-emerald-800">{showForm ? <X size={17} /> : <Plus size={17} />}{showForm ? "Funga form" : "Delivery mpya"}</button>
    </header>

    {notice && <div className={`rounded-xl border px-4 py-3 text-sm font-bold ${notice.includes("haijahifadhiwa") || notice.includes("hairuhusiwi") ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>{notice}</div>}

    {showForm && <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm md:grid-cols-2">
      <div className="md:col-span-2"><h2 className="text-lg font-black text-slate-950">Panga Delivery mpya</h2><p className="mt-1 text-sm text-slate-500">Jaza taarifa za gari, dereva na mahali mzigo unapokwenda. Mfumo utahifadhi status ya mwanzo kama Imepangwa.</p></div>
      <div><label className="label">Gari (optional)</label><select value={form.vehicleId} onChange={(event) => setForm({ ...form, vehicleId: event.target.value })} className="input"><option value="">Chagua gari kama limesajiliwa</option>{vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.plateNumber} {vehicle.model ? `· ${vehicle.model}` : ""}</option>)}</select></div>
      <div><label className="label">Jina la dereva</label><input required value={form.driverName} onChange={(event) => setForm({ ...form, driverName: event.target.value })} className="input" placeholder="Jina kamili la dereva" /></div>
      <div><label className="label">Simu ya dereva</label><input required type="tel" value={form.driverPhone} onChange={(event) => setForm({ ...form, driverPhone: event.target.value })} className="input" placeholder="0712 345 678" /></div>
      <div><label className="label">Destination</label><input required value={form.destination} onChange={(event) => setForm({ ...form, destination: event.target.value })} className="input" placeholder="Mfano: Tabora mjini" /></div>
      <div><label className="label">Uzito wa shipment (kg)</label><input type="number" min="0" step="0.01" value={form.totalWeight} onChange={(event) => setForm({ ...form, totalWeight: event.target.value })} className="input" placeholder="Mfano: 300" /></div>
      <div><label className="label">Invoice reference (optional)</label><input value={form.invoiceNumber} onChange={(event) => setForm({ ...form, invoiceNumber: event.target.value })} className="input" placeholder="INV-2026-0001" /></div>
      <div><label className="label">Simu ya mpokeaji (optional)</label><input type="tel" value={form.recipientPhone} onChange={(event) => setForm({ ...form, recipientPhone: event.target.value })} className="input" placeholder="SMS ya dispatch itumwe hapa" /></div>
      <div className="md:col-span-2"><label className="label">Notes (optional)</label><textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="input min-h-24" placeholder="Maelezo ya mzigo au delivery..." /></div>
      <div className="flex items-center gap-3 md:col-span-2"><button disabled={createDelivery.isPending} className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white disabled:opacity-60">{createDelivery.isPending ? <span className="inline-flex items-center gap-2"><Loader2 size={16} className="animate-spin" />Inahifadhi...</span> : "Hifadhi Delivery"}</button><button type="button" onClick={() => { setShowForm(false); setForm(initialForm); }} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600">Cancel</button></div>
    </form>}

    <section className="grid gap-4 md:grid-cols-3"><div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><Truck className="text-emerald-600" size={21} /><p className="mt-4 text-sm text-slate-500">Deliveries zote</p><p className="mt-1 text-3xl font-black text-slate-950">{deliveries.length}</p></div><div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm"><p className="text-sm font-bold text-amber-800">Zilizopangwa</p><p className="mt-2 text-3xl font-black text-amber-950">{deliveries.filter((delivery) => delivery.status === "scheduled").length}</p></div><div className="rounded-2xl border border-sky-200 bg-sky-50 p-5 shadow-sm"><p className="text-sm font-bold text-sky-800">Ipo njiani</p><p className="mt-2 text-3xl font-black text-sky-950">{deliveries.filter((delivery) => delivery.status === "in_transit").length}</p></div></section>

    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left"><thead className="border-b border-slate-100 bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-4">Delivery</th><th className="px-5 py-4">Dereva</th><th className="px-5 py-4">Destination</th><th className="px-5 py-4">Uzito</th><th className="px-5 py-4">Kuondoka</th><th className="px-5 py-4">Hali</th></tr></thead><tbody className="divide-y divide-slate-100">{deliveriesQuery.isLoading ? <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-500"><span className="inline-flex items-center gap-2"><Loader2 className="animate-spin" size={16} />Inapakia deliveries...</span></td></tr> : deliveries.length === 0 ? <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-500">Hakuna delivery iliyohifadhiwa bado. Bonyeza <strong>Delivery mpya</strong> kuanza.</td></tr> : deliveries.map((delivery) => <tr key={delivery.id} className="hover:bg-slate-50"><td className="px-5 py-4"><p className="font-black text-emerald-700">DEL-{String(delivery.id).padStart(4, "0")}</p><p className="text-xs text-slate-500">{delivery.invoiceNumber ? `Invoice: ${delivery.invoiceNumber}` : "Invoice haijawekwa"}</p></td><td className="px-5 py-4"><p className="font-bold text-slate-900">{delivery.driverName || "Haijawekwa"}</p><p className="text-xs text-slate-500">{delivery.driverPhone || "Simu haijawekwa"}</p></td><td className="px-5 py-4 text-sm text-slate-700"><span className="inline-flex items-center gap-1"><MapPin size={15} className="text-emerald-600" />{delivery.destination || "Haijawekwa"}</span></td><td className="px-5 py-4 text-sm font-bold text-slate-900">{Number(delivery.totalWeight ?? 0).toLocaleString()} kg</td><td className="px-5 py-4 text-sm text-slate-600">{formatDate(delivery.departureTime)}</td><td className="px-5 py-4"><span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-black text-amber-800">{statusLabel[delivery.status ?? "scheduled"] || delivery.status || "Imepangwa"}</span></td></tr>)}</tbody></table></div></section>
    <style jsx>{`.label{display:block;margin-bottom:.35rem;font-size:.75rem;font-weight:700;color:#475569}.input{width:100%;border:1px solid #dbe4e0;border-radius:.75rem;background:#fff;padding:.7rem .8rem;font-size:.875rem;color:#0f172a;outline:none}.input:focus{border-color:#10b981;box-shadow:0 0 0 3px rgba(16,185,129,.12)}`}</style>
  </div>;
}
