"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Check, CheckCircle2, Eye, EyeOff, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import Link from "next/link";

function SetupStatus({ type, text }: { type: "success" | "error"; text: string }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
        type === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-rose-200 bg-rose-50 text-rose-800"
      }`}
      role="status"
    >
      {type === "success" ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" /> : <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />}
      <span>{text}</span>
    </div>
  );
}

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const isSmsReset = searchParams.get("method") === "sms";
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [formData, setFormData] = useState({ newPassword: "", confirmPassword: "" });

  const passwordChecks = useMemo(() => ({
    length: formData.newPassword.length >= 8,
    upper: /[A-Z]/.test(formData.newPassword),
    lower: /[a-z]/.test(formData.newPassword),
    number: /\d/.test(formData.newPassword),
  }), [formData.newPassword]);
  const strength = Object.values(passwordChecks).filter(Boolean).length;
  const passwordsMatch = formData.newPassword.length > 0 && formData.newPassword === formData.confirmPassword;

  if (!token && !isSmsReset) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b211b] px-4 py-10 text-white">
        <section className="w-full max-w-md rounded-[2rem] border border-emerald-900/20 bg-[#fffdf8] p-8 text-center text-slate-900 shadow-2xl">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600"><AlertCircle className="h-7 w-7" /></div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700">Ipuli Milling and Animal Enterprise</p>
          <h1 className="mt-3 text-2xl font-black tracking-tight">Kiungo hakipo tayari</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">Kiungo hiki kimekwisha, si sahihi au hakijakamilika. Omba invitation mpya ili kuweka password yako.</p>
          <Link href="/forgot-password" className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-800">Omba kiungo kipya <ArrowRight className="h-4 w-4" /></Link>
        </section>
      </main>
    );
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    if (isSmsReset && otp.length !== 6) {
      setMessage({ type: "error", text: "Ingiza OTP yenye tarakimu 6 kutoka kwenye SMS." });
      return;
    }
    if (strength < 4) {
      setMessage({ type: "error", text: "Password lazima iwe na herufi kubwa, herufi ndogo, namba na iwe na angalau characters 8." });
      return;
    }
    if (!passwordsMatch) {
      setMessage({ type: "error", text: "Passwords mbili hazifanani. Ziandike tena kwa usahihi." });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...(token ? { token } : { otp }), newPassword: formData.newPassword, confirmPassword: formData.confirmPassword }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage({ type: "error", text: data.message || "Imeshindikana kuweka password. Jaribu tena." });
      } else {
        setMessage({ type: "success", text: data.message || "Password yako imewekwa kwa mafanikio." });
        window.setTimeout(() => router.push("/login"), 2200);
      }
    } catch {
      setMessage({ type: "error", text: "Kuna tatizo la muda. Angalia internet kisha jaribu tena." });
    } finally {
      setLoading(false);
    }
  };

  const requirement = (label: string, valid: boolean) => (
    <div className={`flex items-center gap-2 text-xs ${valid ? "text-emerald-700" : "text-slate-500"}`}>
      <span className={`flex h-4 w-4 items-center justify-center rounded-full ${valid ? "bg-emerald-100" : "bg-slate-100"}`}>{valid ? <Check className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />}</span>
      {label}
    </div>
  );

  return (
    <main className="min-h-screen bg-[#0b211b] px-4 py-8 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#0b2e23] via-[#0d5a40] to-[#16805d] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-20 top-20 h-64 w-64 rounded-full bg-amber-300/10 blur-3xl" />
          <div className="relative">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-[#f4c76b]">Ipuli Milling</p>
            <h1 className="mt-5 max-w-sm text-4xl font-black leading-tight">Karibu kwenye akaunti yako ya kazi.</h1>
            <p className="mt-5 max-w-sm text-sm leading-7 text-emerald-50/80">Weka password yako binafsi ili kuanza kutumia huduma ulizopewa na Ipuli Milling and Animal Enterprise.</p>
          </div>
          <div className="relative flex items-center gap-3 rounded-2xl border border-white/10 bg-emerald-950/20 p-4 text-sm text-emerald-50/85"><ShieldCheck className="h-5 w-5 text-[#f4c76b]" /> Link hii ni ya matumizi ya mara moja na imewekewa muda wa kuisha.</div>
        </aside>

        <section className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-14">
          <div className="w-full max-w-lg">
            <div className="mb-8 flex items-center gap-3 lg:hidden"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-700 text-[#f4c76b]"><KeyRound className="h-5 w-5" /></div><div><p className="text-sm font-black text-emerald-800">Ipuli Milling</p><p className="text-xs text-slate-500">Account setup</p></div></div>
            <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fdf4df] text-[#0b5a40]"><LockKeyhole className="h-7 w-7" /></div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#b7791f]">ACCOUNT ACTIVATION</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Weka password yako</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">Unda password yako binafsi ya kazi. Usimshirikishe mtu mwingine kwa sababu account hii inahusishwa na majukumu yako.</p>

            {message && <div className="mt-6"><SetupStatus type={message.type} text={message.text} /></div>}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {isSmsReset && <div><label className="mb-2 block text-sm font-bold text-slate-800">OTP ya simu</label><input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="Tarakimu 6 ulizotumiwa kwa SMS" className="w-full rounded-xl border border-slate-200 bg-[#f8faf8] px-4 py-3.5 text-sm outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" /><p className="mt-2 text-xs text-slate-500">OTP ina muda wa matumizi. Usimpe mtu mwingine.</p></div>}
              <div><label htmlFor="new-password" className="mb-2 block text-sm font-bold text-slate-800">Password mpya</label><div className="relative"><input id="new-password" type={showPassword ? "text" : "password"} autoComplete="new-password" value={formData.newPassword} onChange={(event) => setFormData((current) => ({ ...current, newPassword: event.target.value }))} placeholder="Andika password yako" className="w-full rounded-xl border border-slate-200 bg-[#f8faf8] px-4 py-3.5 pr-12 text-sm outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" /> <button type="button" aria-label={showPassword ? "Ficha password" : "Onyesha password"} onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:bg-white hover:text-emerald-700">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div></div>
              <div><label htmlFor="confirm-password" className="mb-2 block text-sm font-bold text-slate-800">Thibitisha password</label><div className="relative"><input id="confirm-password" type={showConfirm ? "text" : "password"} autoComplete="new-password" value={formData.confirmPassword} onChange={(event) => setFormData((current) => ({ ...current, confirmPassword: event.target.value }))} placeholder="Rudia password yako" className="w-full rounded-xl border border-slate-200 bg-[#f8faf8] px-4 py-3.5 pr-12 text-sm outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" /> <button type="button" aria-label={showConfirm ? "Ficha confirmation" : "Onyesha confirmation"} onClick={() => setShowConfirm((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:bg-white hover:text-emerald-700">{showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div></div>

              <div className="rounded-2xl border border-emerald-100 bg-[#f7fbf8] p-4"><div className="mb-3 flex items-center justify-between"><p className="text-xs font-black uppercase tracking-[0.18em] text-[#0b5a40]">PASSWORD SECURITY</p><span className={`text-xs font-bold ${strength === 4 ? "text-emerald-700" : strength >= 2 ? "text-amber-700" : "text-slate-400"}`}>{strength === 4 ? "Imara" : strength >= 2 ? "Inaendelea" : "Anza hapa"}</span></div><div className="mb-4 grid grid-cols-4 gap-1.5"><span className={`h-1.5 rounded-full ${strength >= 1 ? "bg-emerald-500" : "bg-slate-200"}`} /><span className={`h-1.5 rounded-full ${strength >= 2 ? "bg-emerald-500" : "bg-slate-200"}`} /><span className={`h-1.5 rounded-full ${strength >= 3 ? "bg-emerald-500" : "bg-slate-200"}`} /><span className={`h-1.5 rounded-full ${strength >= 4 ? "bg-emerald-500" : "bg-slate-200"}`} /></div><div className="grid gap-2 sm:grid-cols-2">{requirement("Angalau characters 8", passwordChecks.length)}{requirement("Herufi kubwa", passwordChecks.upper)}{requirement("Herufi ndogo", passwordChecks.lower)}{requirement("Namba", passwordChecks.number)}{requirement("Passwords zinafanana", passwordsMatch)}</div></div>

              <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b6b4b] px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-950/15 transition hover:bg-[#07553c] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-300">{loading ? "Inahifadhi password..." : "Hifadhi password na endelea"}<ArrowRight className="h-4 w-4" /></button>
            </form>
            <p className="mt-6 text-center text-sm text-slate-500">Una password tayari? <Link href="/login" className="font-bold text-emerald-700 hover:text-emerald-900">Ingia hapa</Link></p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-[#0b211b] text-sm text-white">Inapakia...</main>}><ResetPasswordForm /></Suspense>;
}
