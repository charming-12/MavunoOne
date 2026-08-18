"use client";

import { useState } from "react";
import { AlertCircle, ArrowLeft, CheckCircle2, Leaf, Loader, LockKeyhole, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: method === "email" ? email : undefined,
          phone: method === "phone" ? phone : undefined,
          method,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setMessage({ type: "error", text: data.message || "Ombi halikufanikiwa. Jaribu tena." });
        return;
      }

      setMessage({ type: "success", text: data.message });
      if (method === "phone") {
        router.push("/reset-password?method=sms");
        return;
      }

      setSent(true);
      window.setTimeout(() => {
        setEmail("");
        setPhone("");
        setSent(false);
      }, 3000);
    } catch {
      setMessage({ type: "error", text: "Kuna tatizo la mawasiliano. Jaribu tena baada ya muda mfupi." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#07150f] px-4 py-8 text-white sm:px-6 lg:py-12">
      <div className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-6xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="hidden lg:block">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400 text-[#07150f]"><Leaf size={23} /></span>
            <span className="text-2xl font-black tracking-tight">Mavuno<span className="text-emerald-400">One</span></span>
          </Link>
          <p className="mt-20 text-xs font-black uppercase tracking-[0.28em] text-amber-300">Account recovery</p>
<<<<<<< ours
          <h1 className="mt-5 max-w-md text-5xl font-black leading-[1.05] tracking-tight">Rudisha usalama wa akaunti yako.</h1>
          <p className="mt-6 max-w-md text-base leading-8 text-emerald-100/70">Tutakutumia kiunga cha barua pepe au OTP ya SMS kwenye taarifa iliyothibitishwa ya akaunti yako.</p>
          <div className="mt-10 flex max-w-md items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-5 text-sm leading-6 text-emerald-100/75"><LockKeyhole className="mt-0.5 shrink-0 text-emerald-300" size={19} /><p>Usimpe mtu mwingine OTP au kiunga cha kubadilisha nenosiri.</p></div>
=======
          <h1 className="mt-5 max-w-md text-5xl font-black leading-[1.08] tracking-tight xl:text-6xl">Rudisha usalama wa akaunti yako.</h1>
          <p className="mt-6 max-w-md text-lg leading-8 text-emerald-100/80">Tutakutumia kiunga cha barua pepe au OTP ya SMS kwenye taarifa iliyothibitishwa ya akaunti yako.</p>
          <div className="mt-10 flex max-w-md items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-5 text-base leading-7 text-emerald-100/80"><LockKeyhole className="mt-0.5 shrink-0 text-emerald-300" size={19} /><p>Usimpe mtu mwingine OTP au kiunga cha kubadilisha nenosiri.</p></div>
>>>>>>> theirs
        </section>

        <section className="mx-auto w-full max-w-md">
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <Link href="/" className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400 text-[#07150f]"><Leaf size={19} /></span><span className="font-black">Mavuno<span className="text-emerald-400">One</span></span></Link>
            <Link href="/login" className="text-sm font-bold text-emerald-200/70 hover:text-white">Rudi login</Link>
          </div>

          <div className="rounded-3xl border border-emerald-900/70 bg-[#0a1e18]/95 p-6 shadow-2xl shadow-black/20 sm:p-8">
            <Link href="/login" className="mb-7 inline-flex items-center gap-2 text-sm font-bold text-emerald-300 transition hover:text-white"><ArrowLeft size={17} /> Rudi kwenye login</Link>
            <div className="mb-7">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-300">Password recovery</p>
<<<<<<< ours
              <h2 className="mt-3 text-3xl font-black tracking-tight">Weka upya nenosiri</h2>
              <p className="mt-3 text-sm leading-6 text-emerald-100/65">Chagua njia salama ya kupokea maelekezo ya kubadilisha nenosiri.</p>
=======
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Weka upya nenosiri</h2>
              <p className="mt-3 text-base leading-7 text-emerald-100/75">Chagua njia salama ya kupokea maelekezo ya kubadilisha nenosiri.</p>
>>>>>>> theirs
            </div>

            {message && <div role="status" className={`mb-5 flex gap-3 rounded-xl border p-4 text-sm leading-5 ${message.type === "success" ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100" : "border-red-400/30 bg-red-500/10 text-red-200"}`}>{message.type === "success" ? <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-300" size={18} /> : <AlertCircle className="mt-0.5 shrink-0 text-red-300" size={18} />}<p>{message.text}</p></div>}

            <div className="mb-6 grid gap-3 sm:grid-cols-2">
              <label className={`cursor-pointer rounded-xl border p-4 transition ${method === "email" ? "border-amber-300 bg-amber-300/10" : "border-emerald-900 bg-[#051511] hover:border-emerald-700"}`}>
                <input type="radio" name="method" value="email" checked={method === "email"} onChange={() => { setMethod("email"); setMessage(null); }} className="sr-only" />
<<<<<<< ours
                <span className="flex items-center gap-3"><Mail size={19} className={method === "email" ? "text-amber-300" : "text-emerald-300"} /><span><span className="block text-sm font-bold">Barua pepe</span><span className="mt-1 block text-xs text-emerald-100/55">Tuma kiunga</span></span></span>
              </label>
              <label className={`cursor-pointer rounded-xl border p-4 transition ${method === "phone" ? "border-amber-300 bg-amber-300/10" : "border-emerald-900 bg-[#051511] hover:border-emerald-700"}`}>
                <input type="radio" name="method" value="phone" checked={method === "phone"} onChange={() => { setMethod("phone"); setMessage(null); }} className="sr-only" />
                <span className="flex items-center gap-3"><Phone size={19} className={method === "phone" ? "text-amber-300" : "text-emerald-300"} /><span><span className="block text-sm font-bold">SMS / OTP</span><span className="mt-1 block text-xs text-emerald-100/55">Tuma code ya simu</span></span></span>
=======
                <span className="flex items-center gap-3"><Mail size={19} className={method === "email" ? "text-amber-300" : "text-emerald-300"} /><span><span className="block text-base font-bold">Barua pepe</span><span className="mt-1 block text-sm text-emerald-100/65">Tuma kiunga</span></span></span>
              </label>
              <label className={`cursor-pointer rounded-xl border p-4 transition ${method === "phone" ? "border-amber-300 bg-amber-300/10" : "border-emerald-900 bg-[#051511] hover:border-emerald-700"}`}>
                <input type="radio" name="method" value="phone" checked={method === "phone"} onChange={() => { setMethod("phone"); setMessage(null); }} className="sr-only" />
                <span className="flex items-center gap-3"><Phone size={19} className={method === "phone" ? "text-amber-300" : "text-emerald-300"} /><span><span className="block text-base font-bold">SMS / OTP</span><span className="mt-1 block text-sm text-emerald-100/65">Tuma code ya simu</span></span></span>
>>>>>>> theirs
              </label>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {method === "email" ? (
<<<<<<< ours
                <div><label htmlFor="email" className="mb-2 block text-sm font-bold text-emerald-100">Email ya kampuni</label><input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="jina@kampuni.co.tz" autoComplete="email" required className="w-full rounded-xl border border-emerald-900 bg-[#051511] px-4 py-3.5 text-white outline-none transition placeholder:text-emerald-700 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20" /></div>
              ) : (
                <div><label htmlFor="phone" className="mb-2 block text-sm font-bold text-emerald-100">Namba ya simu iliyosajiliwa</label><input id="phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+255 700 000 000" autoComplete="tel" required className="w-full rounded-xl border border-emerald-900 bg-[#051511] px-4 py-3.5 text-white outline-none transition placeholder:text-emerald-700 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20" /><p className="mt-2 text-xs text-emerald-100/50">Tumia namba iliyopo kwenye account yako ya MavunoOne.</p></div>
              )}
              <button type="submit" disabled={loading || sent} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-300 to-amber-500 py-3.5 font-black text-emerald-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">{loading ? <><Loader size={18} className="animate-spin" /> Inatuma...</> : sent ? "Ombi limetumwa" : method === "phone" ? "Tuma OTP kwa SMS" : "Tuma kiunga cha recovery"}</button>
=======
                <div><label htmlFor="email" className="mb-2 block text-base font-bold text-emerald-100">Email ya kampuni</label><input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="jina@kampuni.co.tz" autoComplete="email" required className="w-full rounded-xl border border-emerald-900 bg-[#051511] px-4 py-4 text-base text-white outline-none transition placeholder:text-emerald-600 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20" /></div>
              ) : (
                <div><label htmlFor="phone" className="mb-2 block text-base font-bold text-emerald-100">Namba ya simu iliyosajiliwa</label><input id="phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+255 700 000 000" autoComplete="tel" required className="w-full rounded-xl border border-emerald-900 bg-[#051511] px-4 py-4 text-base text-white outline-none transition placeholder:text-emerald-600 focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20" /><p className="mt-2 text-sm text-emerald-100/65">Tumia namba iliyopo kwenye account yako ya MavunoOne.</p></div>
              )}
              <button type="submit" disabled={loading || sent} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-300 to-amber-500 py-4 text-base font-black text-emerald-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">{loading ? <><Loader size={18} className="animate-spin" /> Inatuma...</> : sent ? "Ombi limetumwa" : method === "phone" ? "Tuma OTP kwa SMS" : "Tuma kiunga cha recovery"}</button>
>>>>>>> theirs
            </form>

          </div>
        </section>
      </div>
    </main>
  );
}
