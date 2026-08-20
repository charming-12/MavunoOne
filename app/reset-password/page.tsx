"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, ArrowRight, Check, CheckCircle2, Eye, EyeOff, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";

function SetupStatus({ type, text }: { type: "success" | "error"; text: string }) {
  return <div className={`flex items-start gap-3 rounded-xl border p-4 text-base leading-6 ${type === "success" ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100" : "border-red-400/30 bg-red-500/10 text-red-200"}`} role="status">
    {type === "success" ? <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-300" size={20} /> : <AlertCircle className="mt-0.5 shrink-0 text-red-300" size={20} />}<p>{text}</p>
  </div>;
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

  const passwordChecks = useMemo(() => ({ length: formData.newPassword.length >= 8, upper: /[A-Z]/.test(formData.newPassword), lower: /[a-z]/.test(formData.newPassword), number: /\d/.test(formData.newPassword) }), [formData.newPassword]);
  const strength = Object.values(passwordChecks).filter(Boolean).length;
  const passwordsMatch = formData.newPassword.length > 0 && formData.newPassword === formData.confirmPassword;

  if (!token && !isSmsReset) {
    return <main className="min-h-screen bg-[#071a14] px-4 py-8 text-white sm:px-6"><div className="mx-auto max-w-2xl"><header className="mb-8 flex items-center justify-between"><Link href="/" className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 text-[#07150f]"><KeyRound size={19} /></span><span className="text-lg font-black">Ipuli <span className="text-emerald-300">Milling</span></span></Link><Link href="/login" className="text-base font-bold text-emerald-200/80 hover:text-white">Rudi login</Link></header><section className="rounded-3xl border border-emerald-900/70 bg-[#0a1e18]/95 p-7 text-center shadow-2xl shadow-black/20 sm:p-10"><div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-300"><AlertCircle size={28} /></div><p className="text-sm font-black uppercase tracking-[0.22em] text-amber-300">Account setup</p><h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Kiungo hakipo tayari</h1><p className="mx-auto mt-3 max-w-lg text-base leading-7 text-emerald-100/80">Kiungo hiki kimekwisha, si sahihi au hakijakamilika. Omba invitation mpya ili kuweka password yako.</p><Link href="/forgot-password" className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-300 to-amber-500 px-5 py-3.5 text-base font-black text-emerald-950 transition hover:brightness-110">Omba kiungo kipya <ArrowRight size={18} /></Link></section></div></main>;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); setMessage(null);
    if (isSmsReset && otp.length !== 6) { setMessage({ type: "error", text: "Ingiza OTP yenye tarakimu 6 kutoka kwenye SMS." }); return; }
    if (strength < 4) { setMessage({ type: "error", text: "Password lazima iwe na herufi kubwa, herufi ndogo, namba na iwe na angalau characters 8." }); return; }
    if (!passwordsMatch) { setMessage({ type: "error", text: "Passwords mbili hazifanani. Ziandike tena kwa usahihi." }); return; }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...(token ? { token } : { otp }), newPassword: formData.newPassword, confirmPassword: formData.confirmPassword }) });
      const data = await response.json();
      if (!response.ok) setMessage({ type: "error", text: data.message || "Imeshindikana kuweka password. Jaribu tena." });
      else { setMessage({ type: "success", text: "Password imewekwa kwa mafanikio. Unapelekwa kwenye login..." }); window.setTimeout(() => router.push("/login"), 1800); }
    } catch { setMessage({ type: "error", text: "Kuna tatizo la muda. Angalia internet kisha jaribu tena." }); }
    finally { setLoading(false); }
  };

  const requirement = (label: string, valid: boolean) => <div className={`flex items-center gap-2 text-sm ${valid ? "text-emerald-200" : "text-emerald-100/65"}`}><span className={`flex h-4 w-4 items-center justify-center rounded-full ${valid ? "bg-emerald-400 text-emerald-950" : "bg-emerald-950 text-emerald-600"}`}>{valid ? <Check className="h-3 w-3" /> : <span className="h-1.5 w-1.5 rounded-full bg-emerald-700" />}</span>{label}</div>;

  return <main className="min-h-screen bg-[#071a14] px-4 py-8 text-white sm:px-6"><div className="mx-auto max-w-2xl"><header className="mb-8 flex items-center justify-between"><Link href="/" className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 text-[#07150f]"><KeyRound size={19} /></span><span className="text-lg font-black">Ipuli <span className="text-emerald-300">Milling</span></span></Link><Link href="/login" className="flex items-center gap-2 text-base font-bold text-emerald-200/80 hover:text-white"><ArrowLeft size={17} /> Rudi login</Link></header>
    <section className="rounded-3xl border border-emerald-900/70 bg-[#0a1e18]/95 p-6 shadow-2xl shadow-black/20 sm:p-8 lg:p-10"><div className="mb-8"><p className="text-sm font-black uppercase tracking-[0.22em] text-amber-300">Account activation</p><h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Weka password yako</h1><p className="mt-3 max-w-xl text-base leading-7 text-emerald-100/80">Unda password yako binafsi ya kazi ili kuanza kutumia account uliyopewa na Ipuli Milling and Animal Enterprise.</p></div>
      {message && <div className="mb-6"><SetupStatus type={message.type} text={message.text} /></div>}
      <form onSubmit={handleSubmit} className="space-y-5">{isSmsReset && <div><label className="mb-2 block text-base font-bold text-emerald-100">OTP ya simu</label><input inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="Tarakimu 6 ulizotumiwa kwa SMS" className="w-full rounded-xl border border-emerald-900 bg-[#051511] px-4 py-4 text-base text-white outline-none transition placeholder:text-emerald-600 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20" /><p className="mt-2 text-sm text-emerald-100/70">OTP ina muda wa matumizi. Usimpe mtu mwingine.</p></div>}
        <div><label htmlFor="new-password" className="mb-2 block text-base font-bold text-emerald-100">Password mpya</label><div className="relative"><input id="new-password" type={showPassword ? "text" : "password"} autoComplete="new-password" value={formData.newPassword} onChange={(event) => setFormData((current) => ({ ...current, newPassword: event.target.value }))} placeholder="Andika password yako" className="w-full rounded-xl border border-emerald-900 bg-[#051511] px-4 py-4 pr-12 text-base text-white outline-none transition placeholder:text-emerald-600 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20" /><button type="button" aria-label={showPassword ? "Ficha password" : "Onyesha password"} onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-emerald-400 hover:bg-emerald-950 hover:text-amber-300">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button></div></div>
        <div><label htmlFor="confirm-password" className="mb-2 block text-base font-bold text-emerald-100">Thibitisha password</label><div className="relative"><input id="confirm-password" type={showConfirm ? "text" : "password"} autoComplete="new-password" value={formData.confirmPassword} onChange={(event) => setFormData((current) => ({ ...current, confirmPassword: event.target.value }))} placeholder="Rudia password yako" className="w-full rounded-xl border border-emerald-900 bg-[#051511] px-4 py-4 pr-12 text-base text-white outline-none transition placeholder:text-emerald-600 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20" /><button type="button" aria-label={showConfirm ? "Ficha confirmation" : "Onyesha confirmation"} onClick={() => setShowConfirm((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-emerald-400 hover:bg-emerald-950 hover:text-amber-300">{showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}</button></div></div>
        <div className="rounded-2xl border border-emerald-900 bg-[#051511] p-5"><div className="mb-4 flex items-center justify-between"><p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-200">Password security</p><span className={`text-sm font-bold ${strength === 4 ? "text-emerald-300" : strength >= 2 ? "text-amber-300" : "text-emerald-100/50"}`}>{strength === 4 ? "Imara" : strength >= 2 ? "Inaendelea" : "Anza hapa"}</span></div><div className="mb-4 grid grid-cols-4 gap-1.5"><span className={`h-1.5 rounded-full ${strength >= 1 ? "bg-emerald-400" : "bg-emerald-950"}`} /><span className={`h-1.5 rounded-full ${strength >= 2 ? "bg-emerald-400" : "bg-emerald-950"}`} /><span className={`h-1.5 rounded-full ${strength >= 3 ? "bg-emerald-400" : "bg-emerald-950"}`} /><span className={`h-1.5 rounded-full ${strength >= 4 ? "bg-emerald-400" : "bg-emerald-950"}`} /></div><div className="grid gap-3 sm:grid-cols-2">{requirement("Angalau characters 8", passwordChecks.length)}{requirement("Herufi kubwa", passwordChecks.upper)}{requirement("Herufi ndogo", passwordChecks.lower)}{requirement("Namba", passwordChecks.number)}{requirement("Passwords zinafanana", passwordsMatch)}</div></div>
        <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-300 to-amber-500 py-4 text-base font-black text-emerald-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">{loading ? <><Loader2 size={19} className="animate-spin" /> Inahifadhi...</> : "Hifadhi password na endelea"}<ArrowRight size={18} /></button>
      </form><div className="mt-6 flex items-center justify-center gap-2 text-sm text-emerald-100/70"><ShieldCheck size={16} className="text-emerald-300" /> Link hii ni ya matumizi ya mara moja na imewekewa muda wa kuisha.</div><p className="mt-5 text-center text-base text-emerald-100/70">Una password tayari? <Link href="/login" className="font-bold text-amber-300 hover:text-amber-200">Ingia hapa</Link></p>
    </section></div></main>;
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-[#071a14] text-sm text-white">Inapakia...</main>}><ResetPasswordForm /></Suspense>;
}
