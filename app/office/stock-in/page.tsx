"use client";

import { FormEvent, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Eye, FileText, Filter, Loader2, PackageOpen, Plus, Search, X } from "lucide-react";
import { trpc } from "@/lib/trpc";

const money = (value: number) => `TZS ${Math.round(value).toLocaleString("en-TZ")}`;
const units = ["kg", "litre", "debe", "gunia", "unit"] as const;
const sourceLabels: Record<string, string> = { supplier: "Supplier", farmer: "Mkulima", production: "Production", return: "Return", other: "Other" };

type FormState = {
  productId: string;
  quantity: string;
  entryUnit: (typeof units)[number];
  packageCount: string;
  packageWeightKg: string;
  packageWeightsKg: string;
  supplierName: string;
  supplierPhone: string;
  sourceType: "supplier" | "farmer" | "production" | "return" | "other";
  purchaseReference: string;
  batchNumber: string;
  vehicleReference: string;
  warehouseLocation: string;
  receivedBy: string;
  qualityStatus: "accepted" | "hold" | "rejected";
  costPerUnit: string;
  notes: string;
};

const blankForm: FormState = {
  productId: "", quantity: "", entryUnit: "kg", packageCount: "", packageWeightKg: "", packageWeightsKg: "", supplierName: "", supplierPhone: "", sourceType: "supplier", purchaseReference: "", batchNumber: "", vehicleReference: "", warehouseLocation: "", receivedBy: "", qualityStatus: "accepted", costPerUnit: "", notes: "",
};

export default function StockInPage() {
  const utils = trpc.useUtils();
  const recordsQuery = trpc.stock.stockIn.list.useQuery();
  const productsQuery = trpc.products.list.useQuery();
  const createStockIn = trpc.stock.stockIn.create.useMutation({
    onSuccess: () => {
      void utils.stock.stockIn.list.invalidate();
      void utils.products.list.invalidate();
      setForm(blankForm);
      setFormOpen(false);
      setMessage("Stock-In imehifadhiwa na inventory imeongezwa kwa usahihi.");
    },
  });
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(blankForm);
  const [search, setSearch] = useState("");
  const [qualityFilter, setQualityFilter] = useState("all");
  const [message, setMessage] = useState("");

  const products = useMemo(() => new Map((productsQuery.data ?? []).map((product) => [product.id, product])), [productsQuery.data]);
  const records = useMemo(() => recordsQuery.data ?? [], [recordsQuery.data]);
  const selectedProduct = form.productId ? products.get(Number(form.productId)) : undefined;
  const selectProduct = (value: string) => {
    update("productId", value);
    const product = value ? products.get(Number(value)) : undefined;
    if (product && units.includes(product.unit as (typeof units)[number])) {
      update("entryUnit", product.unit as FormState["entryUnit"]);
    }
  };
  const packageUnit = form.entryUnit === "litre" ? "litre" : "kg";
  const packageCountLabel = form.entryUnit === "litre" ? "Idadi ya containers/ndoo" : form.entryUnit === "gunia" ? "Idadi ya magunia" : "Idadi ya packages";
  const individualPackageWeights = form.packageWeightsKg.split(",").map((value) => Number(value.trim())).filter((value) => Number.isFinite(value) && value > 0);
  const calculatedBaseKg = individualPackageWeights.length > 0
    ? individualPackageWeights.reduce((sum, value) => sum + value, 0)
    : form.packageCount && form.packageWeightKg
      ? Number(form.packageCount) * Number(form.packageWeightKg)
      : form.entryUnit === "kg" ? Number(form.quantity || 0) : Number(form.quantity || 0) * Number(selectedProduct?.packageSizeKg || 1);
  const filteredRecords = useMemo(() => records.filter((record) => {
    const productName = products.get(record.productId)?.name ?? "";
    const needle = search.toLowerCase().trim();
    const matchesSearch = !needle || [productName, record.supplierName, record.purchaseReference, record.batchNumber, record.vehicleReference, record.warehouseLocation].filter(Boolean).some((value) => String(value).toLowerCase().includes(needle));
    const matchesQuality = qualityFilter === "all" || (record.qualityStatus ?? "accepted") === qualityFilter;
    return matchesSearch && matchesQuality;
  }), [records, products, search, qualityFilter]);

  const totals = useMemo(() => ({
    kg: records.filter((record) => record.entryUnit !== "litre").reduce((sum, record) => sum + Number(record.baseQuantity ?? 0), 0),
    litre: records.filter((record) => record.entryUnit === "litre").reduce((sum, record) => sum + Number(record.baseQuantity ?? 0), 0),
    cost: records.reduce((sum, record) => sum + Number(record.totalCost ?? 0), 0),
    accepted: records.filter((record) => (record.qualityStatus ?? "accepted") === "accepted").length,
    hold: records.filter((record) => record.qualityStatus === "hold").length,
  }), [records]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    createStockIn.mutate({
      productId: Number(form.productId), quantity: Number(form.quantity), entryUnit: form.entryUnit, packageCount: form.packageCount ? Number(form.packageCount) : undefined, packageWeightKg: form.packageWeightKg ? Number(form.packageWeightKg) : undefined, packageWeightsKg: form.packageWeightsKg || undefined, supplierName: form.supplierName || undefined, supplierPhone: form.supplierPhone || undefined, sourceType: form.sourceType, purchaseReference: form.purchaseReference || undefined, batchNumber: form.batchNumber || undefined, vehicleReference: form.vehicleReference || undefined, warehouseLocation: form.warehouseLocation || undefined, receivedBy: form.receivedBy || undefined, qualityStatus: form.qualityStatus, costPerUnit: Number(form.costPerUnit || 0), notes: form.notes || undefined,
    });
  };

  if (recordsQuery.isLoading || productsQuery.isLoading) return <div className="flex min-h-[320px] items-center justify-center gap-2 text-emerald-700"><Loader2 className="animate-spin" size={20} />Inapakia stock-in register...</div>;
  if (recordsQuery.error || productsQuery.error) return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">Stock-In haikuweza kupakiwa. Hakikisha umeingia na database inapatikana.</div>;

  return <div className="space-y-6">
    <header className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Inventory receiving register</p><h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Stock-In Documentation</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">Rekodi kila mzigo unaoingia kwa traceability kamili: source, document reference, batch, vehicle, receiver, quality na gharama.</p></div><button type="button" onClick={() => { setFormOpen(true); setMessage(""); }} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 font-black text-white shadow-lg shadow-emerald-900/10 transition hover:bg-emerald-800"><Plus size={19} />Record Stock-In</button></header>

    {message && <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800"><CheckCircle2 size={17} />{message}</div>}
    {createStockIn.error && <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"><AlertTriangle size={17} />{createStockIn.error.message}</div>}

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-wide text-slate-500">Total records</p><p className="mt-2 text-3xl font-black text-slate-950">{records.length.toLocaleString()}</p><p className="mt-1 text-xs text-slate-500">Receiving entries</p></div><div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-wide text-emerald-700">Base stock received</p><p className="mt-2 text-3xl font-black text-emerald-950">{totals.kg > 0 ? `${totals.kg.toLocaleString()} kg` : ""}{totals.kg > 0 && totals.litre > 0 ? " · " : ""}{totals.litre > 0 ? `${totals.litre.toLocaleString()} litre` : ""}{totals.kg === 0 && totals.litre === 0 ? "0" : ""}</p><p className="mt-1 text-xs text-emerald-700">Normalized database quantity</p></div><div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-wide text-amber-700">Documented cost</p><p className="mt-2 text-3xl font-black text-amber-950">{money(totals.cost)}</p><p className="mt-1 text-xs text-amber-700">Stock-in cost basis</p><p className="mt-2 text-sm font-black text-amber-900">Cost ya package/unit na normalized unit inaonekana kwenye kila record</p><p className="mt-1 text-xs text-amber-700">Per kg au per litre kulingana na product</p></div><div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-5 shadow-sm"><p className="text-xs font-black uppercase tracking-wide text-sky-700">Quality control</p><p className="mt-2 text-3xl font-black text-sky-950">{totals.accepted} <span className="text-base">accepted</span></p><p className="mt-1 text-xs text-sky-700">{totals.hold} entries on hold</p></div></div>

    {formOpen && <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-xl shadow-emerald-950/5"><div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-emerald-950 px-5 py-5 text-white sm:px-6"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-300">Receiving document</p><h2 className="mt-1 text-xl font-black">Record new stock-in</h2><p className="mt-1 text-sm text-emerald-100/70">Fields za reference na traceability zinasaidia audit na reconciliation.</p></div><button type="button" onClick={() => setFormOpen(false)} className="rounded-lg p-2 text-emerald-200 hover:bg-white/10" aria-label="Funga form"><X size={19} /></button></div><form onSubmit={submit} className="grid gap-5 p-5 sm:grid-cols-2 xl:grid-cols-4 sm:p-6"><div className="xl:col-span-2"><label className="label">Product *</label><select required value={form.productId} onChange={(event) => selectProduct(event.target.value)} className="input"><option value="">Chagua product</option>{(productsQuery.data ?? []).map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</select></div><div><label className="label">Quantity *</label><input required min="0.01" step="0.01" type="number" value={form.quantity} onChange={(event) => update("quantity", event.target.value)} className="input" placeholder="Mfano 25" /></div><div><label className="label">Entry unit *</label><select value={form.entryUnit} onChange={(event) => update("entryUnit", event.target.value as FormState["entryUnit"])} className="input">{units.map((unit) => <option key={unit} value={unit}>{unit}</option>)}</select></div><div><label className="label">Package count / {packageCountLabel}</label><input min="0.01" step="0.01" type="number" value={form.packageCount} onChange={(event) => update("packageCount", event.target.value)} className="input" placeholder="Mfano 20" /></div><div><label className="label">Weight per package ({packageUnit})</label><input min="0.01" step="0.001" type="number" value={form.packageWeightKg} onChange={(event) => update("packageWeightKg", event.target.value)} className="input" placeholder={`Mfano ${packageUnit === "litre" ? "20" : "30"}`} /></div><div className="xl:col-span-2"><label className="label">Individual package values ({packageUnit}, optional)</label><input value={form.packageWeightsKg} onChange={(event) => update("packageWeightsKg", event.target.value)} className="input" placeholder={packageUnit === "litre" ? "Mfano 20, 18, 20, 22" : "Mfano 30, 29.5, 30, 30.2"} /><p className="mt-1 text-xs text-slate-500">Tumia hii kama kila package ina {packageUnit === "litre" ? "ujazo" : "uzito"} tofauti; weka values kwa koma.</p></div><div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-900"><span>Total normalized quantity: </span>{calculatedBaseKg.toLocaleString()} {packageUnit}</div><div><label className="label">Source type *</label><select value={form.sourceType} onChange={(event) => update("sourceType", event.target.value as FormState["sourceType"])} className="input"><option value="supplier">Supplier</option><option value="farmer">Mkulima</option><option value="production">Production</option><option value="return">Customer return</option><option value="other">Other</option></select></div><div><label className="label">Supplier / farmer name</label><input value={form.supplierName} onChange={(event) => update("supplierName", event.target.value)} className="input" placeholder="Jina la source" /></div><div><label className="label">Supplier phone</label><input value={form.supplierPhone} onChange={(event) => update("supplierPhone", event.target.value)} className="input" placeholder="07XXXXXXXX" /></div><div><label className="label">Cost per entry unit (TZS)</label><input min="0" step="0.01" type="number" value={form.costPerUnit} onChange={(event) => update("costPerUnit", event.target.value)} className="input" placeholder="0" /></div><div><label className="label">Quality status *</label><select value={form.qualityStatus} onChange={(event) => update("qualityStatus", event.target.value as FormState["qualityStatus"])} className="input"><option value="accepted">Accepted — add to stock</option><option value="hold">Hold — add to stock pending review</option><option value="rejected">Rejected — do not add</option></select></div><div><label className="label">Purchase / GRN reference</label><input value={form.purchaseReference} onChange={(event) => update("purchaseReference", event.target.value)} className="input" placeholder="GRN-2026-0001 / invoice no." /></div><div><label className="label">Batch / lot number</label><input value={form.batchNumber} onChange={(event) => update("batchNumber", event.target.value)} className="input" placeholder="LOT-..." /></div><div><label className="label">Vehicle / delivery reference</label><input value={form.vehicleReference} onChange={(event) => update("vehicleReference", event.target.value)} className="input" placeholder="Plate / delivery no." /></div><div><label className="label">Warehouse location</label><input value={form.warehouseLocation} onChange={(event) => update("warehouseLocation", event.target.value)} className="input" placeholder="Godown A / Bay 02" /></div><div><label className="label">Received by</label><input value={form.receivedBy} onChange={(event) => update("receivedBy", event.target.value)} className="input" placeholder="Jina la mpokeaji; default ni user aliyeingia" /></div><div className="sm:col-span-2 xl:col-span-3"><label className="label">Notes / quality observations</label><textarea value={form.notes} onChange={(event) => update("notes", event.target.value)} className="input min-h-24" placeholder="Condition ya mzigo, moisture, damaged bags, document notes..." /></div><div className="flex items-end justify-end gap-3 sm:col-span-2 xl:col-span-1"><button type="button" onClick={() => setFormOpen(false)} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button><button type="submit" disabled={createStockIn.isPending} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-black text-white hover:bg-emerald-800 disabled:opacity-60">{createStockIn.isPending ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}Save receiving</button></div></form></section>}

    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"><div className="flex flex-col justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:px-6"><div><h2 className="text-lg font-black text-slate-950">Receiving register</h2><p className="mt-1 text-sm text-slate-500">Kila record inabaki na document trail ya inventory.</p></div><div className="flex flex-col gap-2 sm:flex-row"><div className="relative"><Search className="pointer-events-none absolute left-3 top-2.5 text-slate-400" size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} className="input pl-9" placeholder="Search product, supplier, batch..." /></div><div className="relative"><Filter className="pointer-events-none absolute left-3 top-2.5 text-slate-400" size={16} /><select value={qualityFilter} onChange={(event) => setQualityFilter(event.target.value)} className="input pl-9"><option value="all">All quality states</option><option value="accepted">Accepted</option><option value="hold">Hold</option></select></div></div></div>{filteredRecords.length === 0 ? <div className="rounded-xl bg-slate-50 p-12 text-center text-slate-500"><PackageOpen className="mx-auto mb-3" size={34} /><p className="font-semibold">Hakuna stock-in inayolingana na filter.</p><p className="mt-1 text-sm">Record mpya itatokea hapa baada ya kuhifadhi.</p></div> : <div className="overflow-x-auto"><table className="w-full min-w-[1280px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Product / source</th><th className="px-5 py-3">Quantity</th><th className="px-5 py-3">Cost</th><th className="px-5 py-3">Document trail</th><th className="px-5 py-3">Warehouse / receiver</th><th className="px-5 py-3">Quality</th><th className="px-5 py-3">Date</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredRecords.map((record) => { const product = products.get(record.productId); const quality = record.qualityStatus ?? "accepted"; const normalizedUnit = record.entryUnit === "litre" ? "litre" : "kg"; return <tr key={record.id} className="align-top transition hover:bg-emerald-50/30"><td className="px-5 py-4"><p className="font-black text-slate-900">{product?.name ?? `Product #${record.productId}`}</p><p className="mt-1 text-xs text-slate-500">{sourceLabels[record.sourceType ?? "supplier"] ?? record.sourceType} · {record.supplierName || "Source not specified"}</p></td><td className="px-5 py-4"><p className="font-bold text-slate-800">{Number(record.quantity).toLocaleString()} {record.entryUnit ?? product?.unit ?? "unit"}</p><p className="mt-1 text-xs text-emerald-700">= {Number(record.baseQuantity ?? record.quantity).toLocaleString()} {normalizedUnit} base</p>{record.packageCount ? <p className="mt-1 text-xs text-slate-500">Packages: {Number(record.packageCount).toLocaleString()}{record.packageWeightKg ? ` × ${Number(record.packageWeightKg).toLocaleString()} ${normalizedUnit}` : ""}</p> : null}</td><td className="px-5 py-4"><p className="font-bold text-slate-800">{money(Number(record.totalCost ?? 0))} total</p><p className="mt-1 text-xs text-slate-500">{money(Number(record.costPerUnit ?? 0))} / {record.entryUnit ?? product?.unit ?? "unit"}</p><p className="mt-1 text-xs font-bold text-amber-700">{Number(record.baseQuantity ?? 0) > 0 ? `${money(Number(record.totalCost ?? 0) / Number(record.baseQuantity ?? 0))} / ${normalizedUnit}` : `— / ${normalizedUnit}`}</p></td><td className="px-5 py-4 text-xs text-slate-600"><p>{record.purchaseReference || "No GRN/invoice ref"}</p><p className="mt-1">Batch: {record.batchNumber || "—"}</p><p className="mt-1">Vehicle: {record.vehicleReference || "—"}</p></td><td className="px-5 py-4 text-xs text-slate-600"><p>{record.warehouseLocation || "Location not set"}</p><p className="mt-1">By: {record.receivedBy || "—"}</p></td><td className="px-5 py-4">{quality === "accepted" ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700"><CheckCircle2 size={13} />Accepted</span> : <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700"><AlertTriangle size={13} />Hold</span>}</td><td className="px-5 py-4 text-xs text-slate-600"><p>{new Date(record.date).toLocaleDateString("sw-TZ")}</p><p className="mt-1 text-slate-400">#{record.id}</p></td></tr>; })}</tbody></table></div>}</section>
    <div className="flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50/70 p-4 text-sm text-sky-900"><FileText size={18} className="mt-0.5 shrink-0 text-sky-700" /><p><strong>Documentation rule:</strong> GRN/invoice reference, batch number, vehicle reference na receiver vinapaswa kujazwa kwa kila shipment ya biashara. Kwa mzigo wa mkulima, tumia source type <strong>Farmer</strong> na weka jina/phone yake.</p><Eye size={18} className="ml-auto mt-0.5 shrink-0 text-sky-700" /></div>

    <style jsx>{`.label{display:block;margin-bottom:.4rem;font-size:.72rem;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:#475569}.input{width:100%;border:1px solid #dbe4e0;border-radius:.75rem;background:#fff;padding:.68rem .8rem;font-size:.875rem;color:#0f172a;outline:none}.input:focus{border-color:#10b981;box-shadow:0 0 0 3px rgba(16,185,129,.12)}textarea.input{resize:vertical}`}</style>
  </div>;
}
