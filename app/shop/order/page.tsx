"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, CreditCard, MapPin, Package, ShieldCheck, ShoppingBag, UserRound } from "lucide-react";

type CartLine = { id: number; name: string; price: number; quantity: number; unit: string; packageSizeKg: number; image?: string };
type ProviderInstruction = { name: string | null; number: string | null };
type PaymentInstructions = { enabled: boolean; mpesa: ProviderInstruction | null; tigopesa: ProviderInstruction | null };

const emptyPayments: PaymentInstructions = { enabled: false, mpesa: null, tigopesa: null };

export default function OrderPage() {
  const [step, setStep] = useState(1);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [paymentInstructions, setPaymentInstructions] = useState<PaymentInstructions>(emptyPayments);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [formData, setFormData] = useState({ fullName: "", phone: "", email: "", address: "", city: "", paymentMethod: "cash" });

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("mavunoone-shop-cart");
      window.setTimeout(() => setCart(saved ? JSON.parse(saved) as CartLine[] : []), 0);
    } catch { window.setTimeout(() => setCart([]), 0); }
  }, []);

  useEffect(() => {
    fetch("/api/payment/instructions")
      .then((response) => response.ok ? response.json() : emptyPayments)
      .then((data) => setPaymentInstructions(data))
      .catch(() => setPaymentInstructions(emptyPayments));
  }, []);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;
  const activePayment = formData.paymentMethod === "mpesa" ? paymentInstructions.mpesa : formData.paymentMethod === "tigopesa" ? paymentInstructions.tigopesa : null;
  const paymentOptions = [
    ["cash", "Pesa taslimu", "Lipa wakati wa delivery"],
    ...(paymentInstructions.enabled && paymentInstructions.mpesa ? [["mpesa", "M-Pesa", "Lipa kwa namba ya biashara"]] : []),
    ...(paymentInstructions.enabled && paymentInstructions.tigopesa ? [["tigopesa", "Tigo Pesa / Mixx by Yas", "Lipa kwa namba ya simu"]] : []),
    ["bank", "Benki", "Tuma kupitia benki yako"],
  ];
  const setField = (name: string, value: string) => setFormData((current) => ({ ...current, [name]: value }));

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError("");
    if (step < 3) { setStep((current) => current + 1); return; }
    if (cart.length === 0) { setSubmitError("Kikapu chako hakina bidhaa. Rudi Shop uanze tena."); return; }
    try {
      const response = await fetch("/api/shop/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...formData, items: cart.map((item) => ({ productId: item.id, quantity: item.quantity })) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Oda haikuweza kuhifadhiwa.");
      window.localStorage.removeItem("mavunoone-shop-cart");
      setOrderNumber(data.orderNumber || "");
      setOrderPlaced(true);
    } catch (error) { setSubmitError(error instanceof Error ? error.message : "Oda haikuweza kuhifadhiwa."); }
  };

  if (orderPlaced) return (
    <main className="min-h-screen bg-[#07150f] px-4 py-10 text-white md:py-16">
      <div className="mx-auto max-w-xl rounded-[32px] border border-emerald-400/20 bg-white/[0.06] p-8 text-center shadow-2xl md:p-12">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-400/15 text-emerald-300"><CheckCircle2 size={42} /></div>
        <p className="mt-7 text-xs font-black uppercase tracking-[0.25em] text-amber-300">Oda imepokelewa</p>
        <h1 className="mt-3 text-3xl font-black md:text-4xl">Asante kwa kuagiza MavunoOne</h1>
        <p className="mt-4 text-base leading-7 text-emerald-100/75">Timu yetu ya Tabora itakupigia kuthibitisha bidhaa, malipo na muda wa delivery.</p>
        <div className="mt-7 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-5"><p className="text-xs font-bold uppercase tracking-widest text-amber-200">Namba ya oda</p><p className="mt-2 text-2xl font-black text-white">{orderNumber || "Inathibitishwa"}</p></div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2"><Link href="/shop" className="rounded-xl bg-amber-400 px-4 py-3 font-black text-emerald-950 hover:bg-amber-300">Rudi Shop</Link><Link href="/shop/account" className="rounded-xl border border-white/15 px-4 py-3 font-bold text-white hover:bg-white/10">Fungua Akaunti</Link></div>
        <Link href="/" className="mt-5 inline-block text-sm font-bold text-emerald-200 hover:text-white">Rudi Home</Link>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-[#07150f] text-white">
      <header className="border-b border-emerald-900/50 bg-[#0a1e18]/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 md:px-8"><div><p className="text-xs font-black uppercase tracking-[0.3em] text-amber-300">MavunoOne Shop</p><h1 className="mt-2 text-2xl font-black md:text-3xl">Kamilisha oda yako</h1><p className="mt-1 text-sm text-emerald-200">Tabora, Tanzania · Huduma ya mteja iliyo wazi</p></div><div className="flex gap-2"><Link href="/" className="rounded-xl border border-emerald-700 px-3 py-2 text-sm font-bold text-emerald-100 hover:bg-emerald-900/60">Home</Link><Link href="/shop/cart" className="rounded-xl border border-emerald-700 px-3 py-2 text-sm font-bold text-emerald-100 hover:bg-emerald-900/60">Kikapu</Link></div></div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
        <div className="mb-8 grid gap-3 sm:grid-cols-3">{([[1, "Taarifa zako", UserRound], [2, "Delivery", MapPin], [3, "Malipo", CreditCard]] as Array<[number, string, typeof UserRound]>).map(([number, label, Icon]) => { const active = step === number; const complete = step > (number as number); return <div key={label as string} className={`rounded-2xl border p-4 ${active ? "border-amber-300/50 bg-amber-300/10" : complete ? "border-emerald-400/30 bg-emerald-400/10" : "border-white/10 bg-white/[0.04]"}`}><div className="flex items-center gap-3"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${active ? "bg-amber-400 text-emerald-950" : complete ? "bg-emerald-400 text-emerald-950" : "bg-white/10 text-emerald-100"}`}>{complete ? <CheckCircle2 size={19} /> : <Icon size={19} />}</div><div><p className="text-[10px] font-black uppercase tracking-widest text-emerald-300">Hatua {number}</p><p className="mt-1 font-black text-white">{label}</p></div></div></div>; })}</div>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <form onSubmit={handleSubmit} className="space-y-6">
            {submitError && <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-sm font-bold text-red-200">{submitError}</div>}
            {step === 1 && <section className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 md:p-8"><div className="mb-7 flex items-start gap-4"><div className="rounded-2xl bg-emerald-400/15 p-3 text-emerald-300"><UserRound size={22} /></div><div><p className="text-xs font-black uppercase tracking-widest text-amber-300">Hatua ya kwanza</p><h2 className="mt-2 text-2xl font-black">Taarifa za mteja</h2><p className="mt-2 text-sm leading-6 text-emerald-100/65">Tumia namba sahihi ili timu yetu ikuthibitishie oda.</p></div></div><div className="grid gap-5 sm:grid-cols-2"><label className="sm:col-span-2"><span className="mb-2 block text-sm font-bold text-emerald-100">Jina kamili *</span><input required value={formData.fullName} onChange={(e) => setField("fullName", e.target.value)} className="w-full rounded-xl border border-emerald-900 bg-[#06120d] px-4 py-3 text-white outline-none focus:border-amber-300" placeholder="Mfano: Amina Juma" /></label><label><span className="mb-2 block text-sm font-bold text-emerald-100">Namba ya simu *</span><input required type="tel" value={formData.phone} onChange={(e) => setField("phone", e.target.value)} className="w-full rounded-xl border border-emerald-900 bg-[#06120d] px-4 py-3 text-white outline-none focus:border-amber-300" placeholder="0712 345 678" /></label><label><span className="mb-2 block text-sm font-bold text-emerald-100">Email (hiari)</span><input type="email" value={formData.email} onChange={(e) => setField("email", e.target.value)} className="w-full rounded-xl border border-emerald-900 bg-[#06120d] px-4 py-3 text-white outline-none focus:border-amber-300" placeholder="jina@example.com" /></label></div></section>}
            {step === 2 && <section className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 md:p-8"><div className="mb-7 flex items-start gap-4"><div className="rounded-2xl bg-emerald-400/15 p-3 text-emerald-300"><MapPin size={22} /></div><div><p className="text-xs font-black uppercase tracking-widest text-amber-300">Hatua ya pili</p><h2 className="mt-2 text-2xl font-black">Delivery ifikie wapi?</h2><p className="mt-2 text-sm leading-6 text-emerald-100/65">Andika eneo linaloeleweka kwa dereva au timu ya MavunoOne.</p></div></div><div className="space-y-5"><label><span className="mb-2 block text-sm font-bold text-emerald-100">Anwani kamili *</span><input required value={formData.address} onChange={(e) => setField("address", e.target.value)} className="w-full rounded-xl border border-emerald-900 bg-[#06120d] px-4 py-3 text-white outline-none focus:border-amber-300" placeholder="Mtaa, kijiji, wilaya au eneo" /></label><label><span className="mb-2 block text-sm font-bold text-emerald-100">Jiji / Wilaya *</span><select required value={formData.city} onChange={(e) => setField("city", e.target.value)} className="w-full rounded-xl border border-emerald-900 bg-[#06120d] px-4 py-3 text-white outline-none focus:border-amber-300"><option value="">Chagua eneo</option><option value="tabora">Tabora</option><option value="dar">Dar es Salaam</option><option value="morogoro">Morogoro</option><option value="iringa">Iringa</option><option value="dodoma">Dodoma</option></select></label></div></section>}
            {step === 3 && <section className="rounded-[28px] border border-white/10 bg-white/[0.05] p-6 md:p-8"><div className="mb-7 flex items-start gap-4"><div className="rounded-2xl bg-amber-400/15 p-3 text-amber-300"><CreditCard size={22} /></div><div><p className="text-xs font-black uppercase tracking-widest text-amber-300">Hatua ya tatu</p><h2 className="mt-2 text-2xl font-black">Chagua malipo</h2><p className="mt-2 text-sm leading-6 text-emerald-100/65">Timu itathibitisha malipo kabla ya kuandaa delivery.</p></div></div><div className="grid gap-3">{paymentOptions.map(([value, title, description]) => <label key={value} className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition ${formData.paymentMethod === value ? "border-amber-300/60 bg-amber-300/10" : "border-white/10 bg-[#06120d] hover:border-emerald-400/40"}`}><input type="radio" name="paymentMethod" value={value} checked={formData.paymentMethod === value} onChange={(e) => setField("paymentMethod", e.target.value)} className="h-4 w-4 accent-amber-400" /><span><span className="block font-black text-white">{title}</span><span className="mt-1 block text-xs text-emerald-100/60">{description}</span></span></label>)}</div>{(formData.paymentMethod === "mpesa" || formData.paymentMethod === "tigopesa") && <div className="mt-5 rounded-2xl border border-amber-300/25 bg-amber-300/10 p-4 text-sm text-amber-100">{paymentInstructions.enabled && activePayment?.number ? <><p className="font-black">Lipa TZS {total.toLocaleString()} kwenda {activePayment.number}{activePayment.name ? ` (${activePayment.name})` : ""}.</p><p className="mt-2 text-xs text-amber-100/75">Tutathibitisha oda baada ya mawasiliano ya simu.</p></> : <p>Namba ya malipo bado haijawekwa. Tafadhali wasiliana nasi ili upate maelekezo ya malipo.</p>}</div>}</section>}
            <div className="flex gap-3">{step > 1 && <button type="button" onClick={() => setStep((current) => current - 1)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-3.5 font-bold text-emerald-100 hover:bg-white/10"><ArrowLeft size={17} /> Nyuma</button>}<button type="submit" className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3.5 font-black text-emerald-950 hover:bg-amber-300">{step < 3 ? "Endelea" : "Thibitisha oda"}<ArrowRight size={17} /></button></div>
          </form>

          <aside className="space-y-5 lg:sticky lg:top-6"><section className="rounded-[28px] border border-emerald-400/20 bg-emerald-500/[0.08] p-6 md:p-7"><div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-widest text-amber-300">Order summary</p><h2 className="mt-2 text-2xl font-black">Muhtasari wa oda</h2></div><Package className="text-amber-300" size={26} /></div>{cart.length === 0 ? <div className="mt-7 rounded-2xl border border-white/10 bg-black/10 p-5 text-sm text-emerald-100/70">Kikapu chako hakina bidhaa. <Link href="/shop" className="font-black text-amber-300">Rudi Shop</Link></div> : <div className="mt-6 space-y-4">{cart.map((item) => <div key={item.id} className="flex items-start justify-between gap-3 border-b border-white/10 pb-4"><div><p className="font-bold text-white">{item.name}</p><p className="mt-1 text-xs text-emerald-100/60">{item.quantity} × {item.unit}{item.packageSizeKg > 1 ? ` · ${item.packageSizeKg} kg` : ""}</p></div><p className="whitespace-nowrap font-black text-amber-300">TZS {(item.price * item.quantity).toLocaleString()}</p></div>)}<div className="space-y-3 pt-2 text-sm"><div className="flex justify-between text-emerald-100/70"><span>Jumla ya bidhaa</span><span>TZS {subtotal.toLocaleString()}</span></div><div className="flex justify-between text-emerald-100/70"><span>VAT (18%)</span><span>TZS {tax.toLocaleString()}</span></div><div className="flex justify-between border-t border-white/15 pt-4 text-lg font-black"><span>Jumla</span><span className="text-amber-300">TZS {total.toLocaleString()}</span></div></div></div>}</section><section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"><div className="flex gap-3"><ShieldCheck className="shrink-0 text-emerald-300" size={21} /><div><p className="font-black text-white">Mchakato salama</p><p className="mt-1 text-xs leading-5 text-emerald-100/60">Taarifa zako zinalindwa na hutumika kuchakata oda, malipo na delivery yako kwa usalama.</p></div></div></section><Link href="/shop" className="inline-flex w-full items-center justify-center gap-2 text-sm font-bold text-emerald-200 hover:text-white"><ShoppingBag size={16} /> Endelea kuangalia bidhaa</Link></aside>
        </div>
      </div>
    </main>
  );
}
