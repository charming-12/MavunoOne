"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, CircleAlert, Printer, Settings, ShieldCheck, X } from "lucide-react";

type PrinterStatus = { enabled: boolean; model: string | null; connectionType: string | null; status: string };

export default function HardwareIntegrationPage() {
  const [printer, setPrinter] = useState<PrinterStatus | null>(null);
  const [testOutput, setTestOutput] = useState("");
  const [testing, setTesting] = useState(false);

  const loadStatus = () => {
    fetch("/api/hardware/status", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setPrinter(data.printer))
      .catch(() => setPrinter({ enabled: false, model: null, connectionType: null, status: "unknown" }));
  };

  useEffect(() => { loadStatus(); }, []);

  const testPrinter = async () => {
    setTesting(true);
    setTestOutput("");
    try {
      const response = await fetch("/api/hardware/test", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ deviceId: "thermal-printer", type: "printer", config: { model: printer?.model || "ESC/POS" } }) });
      const data = await response.json();
      setTestOutput(data.message || "Mtihani umekamilika");
      loadStatus();
    } catch { setTestOutput("Hardware bridge haikupatikana."); } finally { setTesting(false); }
  };

  const configured = Boolean(printer?.enabled);
  return <div className="space-y-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">Hardware operations</p><h1 className="mt-1 flex items-center gap-3 text-3xl font-black text-slate-900"><Settings className="text-emerald-600" size={30} /> Vifaa vya kazi</h1><p className="mt-2 text-slate-500">Hali ya printer na hardware bridge inayotumika na POS.</p></div><Link href="/office/setup-wizard" className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800">Fungua Setup Wizard</Link></div>
    <div className={`rounded-2xl border p-5 ${configured ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white"}`}><div className="flex items-start gap-3"><CircleAlert className={configured ? "mt-0.5 text-amber-600" : "mt-0.5 text-slate-500"} size={21} /><div><h2 className="font-black text-slate-900">{configured ? "Printer ime-configurewa; test inahitajika" : "Printer haija-configurewa"}</h2><p className="mt-1 text-sm text-slate-600">{configured ? "Setup Wizard imehifadhi model ya printer. Hardware bridge ya ESC/POS lazima ithibitishwe kabla ya kusema printer iko ready." : "Washa printer kwenye Setup Wizard ili model na connection type zihifadhiwe kwenye production configuration."}</p></div></div></div>
    <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]"><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-start justify-between"><div className="flex items-center gap-4"><span className="rounded-xl bg-sky-50 p-3 text-sky-700"><Printer size={24} /></span><div><h2 className="font-black text-slate-900">Thermal receipt printer</h2><p className="mt-1 text-sm text-slate-500">{printer?.model || "ESC/POS printer"}</p></div></div><span className={`rounded-full px-3 py-1.5 text-xs font-bold ${printer?.status === "ready" ? "bg-emerald-50 text-emerald-700" : configured ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{printer?.status === "ready" ? "READY" : configured ? "TEST REQUIRED" : "NOT CONFIGURED"}</span></div><div className="mt-6 space-y-3 text-sm"><div className="flex justify-between border-b border-slate-100 pb-3"><span className="text-slate-500">Connection</span><span className="font-semibold text-slate-900">{printer?.connectionType || "—"}</span></div><div className="flex justify-between border-b border-slate-100 pb-3"><span className="text-slate-500">Data source</span><span className="font-semibold text-slate-900">Setup Wizard</span></div></div><button onClick={testPrinter} disabled={testing || !configured} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"><ShieldCheck size={16} />{testing ? "Inapima..." : "Test printer"}</button>{testOutput && <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">{testOutput}</p>}</section><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="font-black text-slate-900">Production checklist</h2><div className="mt-5 space-y-4 text-sm"><p className="flex gap-3"><Check className="shrink-0 text-emerald-600" size={18} />Printer model imehifadhiwa kwenye configuration</p><p className="flex gap-3"><Check className="shrink-0 text-emerald-600" size={18} />POS inaweza kuendelea hata printer ikiwa offline</p><p className="flex gap-3"><X className="shrink-0 text-amber-600" size={18} />Hardware bridge bado inahitaji test ya kifaa halisi</p><p className="flex gap-3"><Check className="shrink-0 text-emerald-600" size={18} />Secrets hazihifadhiwi GitHub</p></div><p className="mt-6 text-xs leading-5 text-slate-500">Kwa printer ya USB, bridge ya local Windows lazima iwe na access ya USB. Kwa printer ya network, weka IP/port ya printer kwenye hardware bridge; Setup Wizard huhifadhi profile, si kufanya USB discovery kutoka Render.</p></section></div></div>;
}
