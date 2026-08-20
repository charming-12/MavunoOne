"use client";

import { useEffect, useState } from "react";
import { AlertCircle, ArrowRight, Eye, EyeOff, Leaf, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { writeStoredUser } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slowLoginNotice, setSlowLoginNotice] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  useEffect(() => {
    void fetch("/api/config/ready", { cache: "no-store" }).catch(() => undefined);
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    setSlowLoginNotice(false);
    const slowTimer = window.setTimeout(() => setSlowLoginNotice(true), 4000);
    const controller = new AbortController();
    const timeoutTimer = window.setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email.trim(), password: formData.password }),
        signal: controller.signal,
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Barua pepe au neno la siri si sahihi. Jaribu tena.");

      writeStoredUser(result.user);
      const role = result.user.role;
      if (role === "boss") {
        router.replace("/boss");
        return;
      }
      if (["admin", "owner", "manager", "cashier", "storekeeper", "machine_operator"].includes(role)) {
        router.replace("/office");
        return;
      }
      router.replace("/shop");
    } catch (submitError) {
      setError(submitError instanceof DOMException && submitError.name === "AbortError"
        ? "Login imechukua muda mrefu kuliko kawaida. Server inaweza kuwa inaamka; subiri kidogo kisha jaribu tena."
        : submitError instanceof Error ? submitError.message : "Login haikufanikiwa.");
    } finally {
      window.clearTimeout(slowTimer);
      window.clearTimeout(timeoutTimer);
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#07150f] text-white">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden border-r border-white/10 px-10 py-10 lg:flex lg:flex-col lg:justify-between xl:px-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,_rgba(16,185,129,0.28),transparent_35%),radial-gradient(circle_at_80%_90%,_rgba(234,179,8,0.18),transparent_30%)]" />
          <div className="relative">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400 text-[#07150f]"><Leaf size={23} /></span>
              <span className="text-2xl font-black tracking-tight">Mavuno<span className="text-emerald-400">One</span></span>
            </Link>
            <div className="mt-24 max-w-xl">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-300">Ipuli Milling and Animal Enterprise</p>
              <h1 className="mt-5 text-5xl font-black leading-[1.05] tracking-tight xl:text-6xl">Karibu kwenye akaunti yako.</h1>
              <p className="mt-6 max-w-lg text-base leading-8 text-emerald-100/80">Endelea kupata huduma za Ipuli Milling and Animal Enterprise kwa urahisi kutoka Tabora, Tanzania.</p>
            </div>
          </div>
          <div className="relative grid max-w-xl gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><Leaf className="mb-3 text-emerald-300" size={21} /><p className="text-sm font-bold">Bidhaa bora</p><p className="mt-1 text-xs leading-5 text-emerald-100/60">Pata bidhaa zinazokufaa kwa mahitaji yako.</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><Leaf className="mb-3 text-amber-300" size={21} /><p className="text-sm font-bold">Agiza kwa urahisi</p><p className="mt-1 text-xs leading-5 text-emerald-100/60">Chagua bidhaa na tuma oda yako kwa urahisi.</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><Leaf className="mb-3 text-cyan-300" size={21} /><p className="text-sm font-bold">Huduma ya karibu</p><p className="mt-1 text-xs leading-5 text-emerald-100/60">Tunapatikana Tabora, Tanzania.</p></div>
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 text-[#07150f]"><Leaf size={21} /></span>
              <span className="text-xl font-black">Mavuno<span className="text-emerald-400">One</span></span>
            </div>
            <div className="mb-8">
              <p className="text-xs font-black uppercase tracking-[0.25em] text-amber-300">Akaunti yako</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Ingia ili kuendelea</h2>
              <p className="mt-3 text-sm leading-6 text-emerald-100/70">Tumia taarifa zako za akaunti ili kuendelea na huduma zako.</p>
            </div>

            <div className="rounded-3xl border border-emerald-900/70 bg-[#0a1e18]/90 p-6 shadow-2xl shadow-black/20 sm:p-8">
              {error && <div role="alert" className="mb-5 flex gap-3 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200"><AlertCircle className="mt-0.5 shrink-0 text-red-300" size={18} /><p>{error}</p></div>}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-bold text-emerald-100">Email ya kampuni</label>
                  <input id="email" required type="email" name="email" autoComplete="username" value={formData.email} onChange={handleInputChange} placeholder="jina@kampuni.co.tz" className="w-full rounded-xl border border-emerald-900 bg-[#051511] px-4 py-3.5 text-white outline-none transition placeholder:text-emerald-700 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20" />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3"><label htmlFor="password" className="block text-sm font-bold text-emerald-100">Neno la siri</label><Link href="/forgot-password" className="text-xs font-bold text-amber-300 transition hover:text-amber-200">Umesahau password?</Link></div>
                  <div className="relative"><input id="password" required type={showPassword ? "text" : "password"} name="password" autoComplete="current-password" value={formData.password} onChange={handleInputChange} placeholder="Ingiza neno la siri" className="w-full rounded-xl border border-emerald-900 bg-[#051511] px-4 py-3.5 pr-12 text-white outline-none transition placeholder:text-emerald-700 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20" /><button type="button" aria-label={showPassword ? "Ficha password" : "Onyesha password"} onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-3.5 rounded-lg p-1 text-emerald-400 transition hover:text-amber-300">{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div>
                </div>
                <button type="submit" disabled={isSubmitting} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-300 to-amber-500 py-3.5 font-black text-emerald-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">{isSubmitting ? "Inathibitisha..." : "Ingia kwenye mfumo"}{!isSubmitting && <ArrowRight size={18} />}</button>
              </form>
              {slowLoginNotice && <p className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/10 p-3 text-xs leading-5 text-amber-100">Server ilikuwa inaamka. Tafadhali subiri; usibonyeze kitufe mara nyingi.</p>}
              <div className="mt-6 flex items-start gap-3 border-t border-white/10 pt-5 text-xs leading-5 text-emerald-100/60"><LockKeyhole className="mt-0.5 shrink-0 text-emerald-300" size={16} /><p>Usishirikishe password yako. Ukisahau, tumia OTP ya simu kupitia <Link href="/forgot-password" className="font-bold text-amber-300 hover:text-amber-200">Password Recovery</Link>.</p></div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm"><Link href="/" className="text-emerald-200/70 transition hover:text-white">← Rudi mwanzo</Link><Link href="/shop" className="inline-flex items-center gap-1 font-bold text-amber-300 transition hover:text-amber-200">Nenda Shop <ArrowRight size={15} /></Link></div>
          </div>
        </section>
      </div>
    </main>
  );
}
