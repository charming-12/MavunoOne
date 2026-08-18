"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Boxes,
  CheckCircle2,
  Clock3,
  Package,
  ReceiptText,
  Truck,
  Wallet,
  Camera,
  ShieldCheck,
  Printer,
  Users,
  FileText,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { trpc } from "@/lib/trpc";

const formatMoney = (value: number) => `TZS ${value.toLocaleString("en-TZ")}`;

const formatDate = (value: string | Date | undefined) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

function KpiCard({
  href,
  label,
  value,
  detail,
  icon: Icon,
  tone = "green",
}: {
  href: string;
  label: string;
  value: string;
  detail: string;
  icon: typeof Wallet;
  tone?: "green" | "amber" | "blue" | "slate";
}) {
  const tones = {
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-sky-50 text-sky-700",
    slate: "bg-slate-100 text-slate-700",
  };

  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(16,45,38,0.05)] transition duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-[0_14px_35px_rgba(16,45,38,0.1)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{value}</p>
        </div>
        <span className={`rounded-xl p-3 ${tones[tone]}`}>
          <Icon size={21} strokeWidth={1.9} />
        </span>
      </div>
      <div className="mt-5 flex items-center gap-2 text-xs font-medium text-slate-500">
        <span className="inline-flex items-center gap-1 text-emerald-700">
          <ArrowUpRight size={14} />
          {detail}
        </span>
        <span className="text-slate-300">•</span>
        <span>Angalia zaidi</span>
      </div>
    </Link>
  );
}

function StatusBadge({ balance }: { balance: number }) {
  if (balance <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
        <CheckCircle2 size={13} /> Imelipwa
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
      <Clock3 size={13} /> Inasubiri malipo
    </span>
  );
}

type BossCctvStatus = { configured: boolean; brand: string | null; protocol: string | null; streamName: string; gatewayUrl: string | null; hlsUrl: string | null };

function BossPrinterStatus() {
  const [status, setStatus] = useState<{ enabled: boolean; model: string | null; connectionType: string | null; status: string } | null>(null);
  useEffect(() => {
    fetch("/api/hardware/status", { cache: "no-store" }).then((response) => response.json()).then((data) => setStatus(data.printer)).catch(() => setStatus({ enabled: false, model: null, connectionType: null, status: "unknown" }));
  }, []);
  const ready = status?.status === "ready";
  return <section className="mt-4 flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(16,45,38,0.05)] sm:flex-row sm:items-center"><div className="flex items-center gap-3"><span className="rounded-xl bg-sky-50 p-3 text-sky-700"><Printer size={21} /></span><div><p className="font-bold text-slate-950">Printer ya risiti</p><p className="mt-1 text-sm text-slate-500">{status?.enabled ? `${status.model || "ESC/POS"} · ${status.connectionType}` : "Haija-configurewa kwenye Setup Wizard"}</p></div></div><span className={`rounded-full px-3 py-1.5 text-xs font-bold ${ready ? "bg-emerald-50 text-emerald-700" : status?.enabled ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{ready ? "READY" : status?.enabled ? "CONFIGURED · TEST REQUIRED" : "NOT CONFIGURED"}</span></section>;
}

function BossCctvPanel() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<BossCctvStatus | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/cctv/status", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: BossCctvStatus) => setStatus(data))
      .catch(() => setStatus({ configured: false, brand: null, protocol: null, streamName: "camera_1", gatewayUrl: null, hlsUrl: null }));
  }, []);

  useEffect(() => {
    if (!status?.configured || !status.hlsUrl || !videoRef.current) return;
    const video = videoRef.current;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = status.hlsUrl;
      return () => { video.pause(); video.removeAttribute("src"); video.load(); };
    }
    if (!Hls.isSupported()) {
      const timer = window.setTimeout(() => setError("Browser haiwezi kucheza HLS stream."), 0);
      return () => window.clearTimeout(timer);
    }
    const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
    hls.loadSource(status.hlsUrl);
    hls.attachMedia(video);
    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (data.fatal) setError("CCTV gateway haipatikani. Hakikisha go2rtc na cloudflared zinaendelea.");
    });
    return () => hls.destroy();
  }, [status]);

  return <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-950 shadow-[0_8px_30px_rgba(16,45,38,0.08)]"><div className="flex flex-col justify-between gap-3 border-b border-slate-800 px-5 py-4 sm:flex-row sm:items-center"><div className="flex items-center gap-3"><span className="rounded-xl bg-emerald-500/15 p-2 text-emerald-300"><Camera size={20} /></span><div><h3 className="font-bold text-white">Live CCTV / Fleet Security</h3><p className="text-xs text-slate-400">Read-only executive monitoring</p></div></div>{status?.configured ? <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300"><ShieldCheck size={14} /> Gateway configured</span> : <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-200">Setup required</span>}</div>{status?.configured ? <><div className="aspect-video bg-black"><video ref={videoRef} controls muted autoPlay playsInline className="h-full w-full object-contain" /></div>{error && <p className="border-t border-slate-800 px-5 py-3 text-sm text-amber-200">{error}</p>}</> : <div className="flex min-h-40 items-center justify-between gap-4 px-5 py-8"><div><p className="font-semibold text-white">CCTV haijaunganishwa</p><p className="mt-1 text-sm text-slate-400">Admin akiweka Gateway URL kwenye Setup Wizard, Boss ataona live preview hapa.</p></div><Link href="/office/cameras" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-500">Angalia setup</Link></div>}</section>;
}

export default function BossDashboard() {
  const dashboardQuery = trpc.dashboard.stats.useQuery();
  const lowStockQuery = trpc.products.lowStock.useQuery();
  const salesQuery = trpc.sales.list.useQuery();
  const vehiclesQuery = trpc.vehicles.list.useQuery();
  const analyticsQuery = trpc.analytics.summary.useQuery();
  const productsQuery = trpc.products.list.useQuery();
  const expensesQuery = trpc.expenses.list.useQuery({});
  const farmersQuery = trpc.farmers.list.useQuery();
  const farmerRows = farmersQuery.data ?? [];
  const totalFarmerDebt = farmerRows.reduce((sum, farmer) => sum + Number(farmer.balance ?? 0), 0);
  const recentExpenses = (expensesQuery.data ?? []).slice(0, 5);
  const expenseTotal = (expensesQuery.data ?? []).reduce((sum, expense) => sum + Number(expense.amount ?? 0), 0);

  const stats = {
    todaySalesTotal: Number(dashboardQuery.data?.todaySalesTotal ?? 0),
    todaySalesCount: Number(dashboardQuery.data?.todaySalesCount ?? 0),
    lowStockCount: Number(lowStockQuery.data?.length ?? 0),
    totalCustomerDebt: Number(dashboardQuery.data?.totalCustomerDebt ?? 0),
    activeVehicles: vehiclesQuery.data?.filter((vehicle) => ["active", "moving", "delivering"].includes(vehicle.status ?? "")).length ?? 0,
    totalVehicles: vehiclesQuery.data?.length ?? 0,
  };

  const recentSales = salesQuery.data?.slice(0, 4) ?? [];
  const salesTrend = (analyticsQuery.data?.daily ?? []).map((day) => ({ month: day.date.slice(5), sales: day.sales / 1_000_000, target: 0 }));
  const stockProducts = (productsQuery.data ?? []).filter((product) => Number(product.currentStock ?? 0) > 0).sort((a, b) => Number(b.currentStock ?? 0) - Number(a.currentStock ?? 0)).slice(0, 4);
  const stockTotal = stockProducts.reduce((sum, product) => sum + Number(product.currentStock ?? 0), 0);
  const stockBreakdown = stockProducts.map((product, index) => { const baseKg = Number(product.currentStock ?? 0); const packageSizeKg = Number(product.packageSizeKg ?? 1); return { name: product.name, display: `${(baseKg / packageSizeKg).toLocaleString()} ${product.unit}`, baseKg, value: stockTotal ? Math.round((baseKg / stockTotal) * 100) : 0, color: ["#16a66a", "#183a5c", "#e6a51b", "#aeb8b5"][index] }; });
  const isLoading = dashboardQuery.isLoading || lowStockQuery.isLoading || salesQuery.isLoading || vehiclesQuery.isLoading || analyticsQuery.isLoading || productsQuery.isLoading || expensesQuery.isLoading || farmersQuery.isLoading;

  return (
    <div className="min-h-screen bg-[#f7f9f8] text-slate-900">
      <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Muhtasari wa biashara</p>
            <h2 className="text-3xl font-bold tracking-tight text-[#102b25] sm:text-4xl">Habari, Mzee Kiasi</h2>
            <p className="mt-2 text-sm text-slate-500">Huu ni muhtasari wa biashara yako leo.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date())}
            </div>
            <button className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700">
              Export ripoti
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => <div key={item} className="h-36 animate-pulse rounded-2xl bg-white shadow-sm" />)}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard href="/boss/sales" label="Mauzo ya Leo" value={formatMoney(stats.todaySalesTotal)} detail={`${stats.todaySalesCount} mauzo leo`} icon={Wallet} />
            <KpiCard href="/boss/sales" label="Madeni ya Wateja" value={formatMoney(stats.totalCustomerDebt)} detail="Yanahitaji ufuatiliaji" icon={ReceiptText} tone="amber" />
            <KpiCard href="/boss/stock" label="Stock ya Chini" value={`${stats.lowStockCount} bidhaa`} detail="Zinahitaji kuagizwa" icon={Boxes} tone="blue" />
            <KpiCard href="/boss/vehicles" label="Magari Yanayofanya Kazi" value={`${stats.activeVehicles} / ${stats.totalVehicles}`} detail="Hali ya magari" icon={Truck} tone="slate" />
          </div>
        )}

        <BossCctvPanel />
        <BossPrinterStatus />

        <section className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(16,45,38,0.05)] sm:p-6">
            <div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><FileText size={19} className="text-amber-700" /><h3 className="text-lg font-bold text-slate-950">Executive Expenses</h3></div><p className="mt-1 text-sm text-slate-500">Gharama zote zilizorekodiwa na Finance</p></div><Link href="/office/expenses" className="text-xs font-bold text-emerald-700 hover:text-emerald-800">Fungua ledger</Link></div>
            <div className="mt-4 flex items-end justify-between rounded-xl bg-amber-50 px-4 py-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Total kwenye ledger</p><p className="mt-1 text-2xl font-bold text-amber-950">{formatMoney(expenseTotal)}</p></div><span className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-amber-800">{recentExpenses.length} latest</span></div>
            <div className="mt-4 divide-y divide-slate-100">{recentExpenses.length ? recentExpenses.map((expense) => <div key={expense.id} className="flex items-center justify-between gap-3 py-3"><div><p className="font-semibold text-slate-900">{expense.description || expense.category}</p><p className="text-xs text-slate-500">{expense.category} · {formatDate(expense.date)}</p></div><p className="whitespace-nowrap text-sm font-bold text-slate-900">{formatMoney(Number(expense.amount ?? 0))}</p></div>) : <p className="py-5 text-sm text-slate-500">Hakuna expenses zilizorekodiwa.</p>}</div>
          </div>
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(16,45,38,0.05)] sm:p-6"><div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><Users size={19} className="text-emerald-700" /><h3 className="text-lg font-bold text-slate-950">Farmer payments</h3></div><p className="mt-1 text-sm text-slate-500">Muhtasari wa madeni ya wakulima</p></div><Link href="/boss/farmer-payments" className="text-xs font-bold text-emerald-700">Review approvals</Link></div><p className="mt-6 text-3xl font-bold text-slate-950">{formatMoney(totalFarmerDebt)}</p><p className="mt-1 text-sm text-slate-500">Outstanding farmer balance</p><div className="mt-5 space-y-2">{farmerRows.filter((farmer) => Number(farmer.balance ?? 0) > 0).slice(0, 3).map((farmer) => <div key={farmer.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5"><span className="text-sm font-semibold text-slate-700">{farmer.name}</span><span className="text-sm font-bold text-amber-700">{formatMoney(Number(farmer.balance ?? 0))}</span></div>)}{farmerRows.length === 0 && <p className="text-sm text-slate-500">Hakuna wakulima kwenye database.</p>}</div></div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_1fr]">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(16,45,38,0.05)] sm:p-6">
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 size={19} className="text-emerald-700" />
                  <h3 className="text-lg font-bold text-slate-950">Mwenendo wa Mauzo</h3>
                </div>
                <p className="mt-1 text-sm text-slate-500">Mauzo dhidi ya lengo kwa miezi sita iliyopita</p>
              </div>
              <button className="w-fit rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-emerald-300 hover:text-emerald-700">Jan – Jun 2026</button>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrend} margin={{ top: 12, right: 6, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#16a66a" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#16a66a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e8efec" vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#71807b", fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#71807b", fontSize: 11 }} tickFormatter={(value) => `${value}M`} />
                  <Tooltip formatter={(value, name) => [`TZS ${Number(value).toFixed(1)}M`, name === "sales" ? "Mauzo" : "Lengo"]} contentStyle={{ borderRadius: 12, border: "1px solid #e3ebe7", boxShadow: "0 10px 30px rgba(16,45,38,.10)" }} />
                  <Area type="monotone" dataKey="target" stroke="#183a5c" strokeWidth={2} strokeDasharray="6 5" fill="transparent" />
                  <Area type="monotone" dataKey="sales" stroke="#16a66a" strokeWidth={3} fill="url(#salesFill)" activeDot={{ r: 5, fill: "#16a66a", stroke: "#fff", strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex items-center gap-5 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-emerald-600" /> Mauzo</span>
                  <span className="text-slate-400">Siku 7 zilizopita</span>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(16,45,38,0.05)] sm:p-6">
            <div className="flex items-center gap-2">
              <Package size={19} className="text-emerald-700" />
              <h3 className="text-lg font-bold text-slate-950">Mgawanyo wa Stock</h3>
            </div>
            <p className="mt-1 text-sm text-slate-500">Muhtasari wa bidhaa zilizopo</p>
            <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
              <div className="relative h-[210px] w-[210px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stockBreakdown} dataKey="value" nameKey="name" innerRadius={68} outerRadius={94} paddingAngle={2} stroke="none">
                      {stockBreakdown.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-slate-950">{stockTotal.toLocaleString()} kg</span>
                  <span className="text-xs text-slate-500">normalized base stock</span>
                </div>
              </div>
              <div className="w-full space-y-3 sm:max-w-[170px]">
                {stockBreakdown.map((item) => (
                  <div key={item.name} className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2 text-slate-600"><i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</span>
                    <span className="text-right font-semibold text-slate-800">{item.value}%<small className="block text-[10px] font-medium text-slate-500">{item.display}</small></span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(16,45,38,0.05)]">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
            <div>
              <h3 className="text-lg font-bold text-slate-950">Miamala ya Hivi Karibuni</h3>
              <p className="mt-1 text-sm text-slate-500">Mauzo ya mwisho yaliyorekodiwa kwenye mfumo</p>
            </div>
            <Link href="/boss/sales" className="inline-flex w-fit items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800">Tazama zote <ArrowUpRight size={16} /></Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[680px] w-full text-left text-sm">
              <thead className="bg-slate-50/70 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5 font-semibold sm:px-6">Invoice</th>
                  <th className="px-5 py-3.5 font-semibold">Tarehe</th>
                  <th className="px-5 py-3.5 font-semibold">Njia ya malipo</th>
                  <th className="px-5 py-3.5 font-semibold">Kiasi</th>
                  <th className="px-5 py-3.5 font-semibold">Hali</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentSales.length ? recentSales.map((sale) => (
                  <tr key={sale.id} className="transition hover:bg-emerald-50/30">
                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-emerald-700 sm:px-6">{sale.invoiceNumber}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-600">{formatDate(sale.createdAt)}</td>
                    <td className="px-5 py-4 capitalize text-slate-600">{sale.paymentMethod ?? "Cash"}</td>
                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">{formatMoney(Number(sale.totalAmount ?? 0))}</td>
                    <td className="px-5 py-4"><StatusBadge balance={Number(sale.balance ?? 0)} /></td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">Hakuna miamala ya kuonyesha kwa sasa.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Link href="/boss/stock" className="flex items-center justify-between rounded-2xl border border-amber-100 bg-amber-50/70 p-5 transition hover:border-amber-200 hover:bg-amber-50">
            <div className="flex items-center gap-3"><span className="rounded-xl bg-white p-3 text-amber-600 shadow-sm"><AlertTriangle size={20} /></span><div><p className="font-bold text-amber-950">Kagua stock ya chini</p><p className="mt-1 text-sm text-amber-800/70">{stats.lowStockCount} bidhaa zinahitaji kuagizwa</p></div></div><ArrowUpRight className="text-amber-700" size={20} />
          </Link>
          <Link href="/boss/vehicles" className="flex items-center justify-between rounded-2xl border border-sky-100 bg-sky-50/70 p-5 transition hover:border-sky-200 hover:bg-sky-50">
            <div className="flex items-center gap-3"><span className="rounded-xl bg-white p-3 text-sky-700 shadow-sm"><Truck size={20} /></span><div><p className="font-bold text-sky-950">Fuatilia magari</p><p className="mt-1 text-sm text-sky-800/70">Angalia hali ya magari yako leo</p></div></div><ArrowUpRight className="text-sky-700" size={20} />
          </Link>
        </div>
      </main>
    </div>
  );
}
