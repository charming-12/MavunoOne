"use client";

import { ArrowRight, PackageCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const stats = [
  { label: "Mauzo ya kila siku", value: "24/7" },
  { label: "Hifadhi ya bidhaa", value: "Live" },
  { label: "Timu + wateja", value: "Unified" },
];

const productCards = [
  {
    title: "Mafuta ya Alizeti",
    description: "Picha halisi ya mafuta ya alizeti, mbegu zake, na ufuatiliaji wa stock ya bidhaa.",
    image: "/products/sunflower-oil-sizes.jpg",
  },
  {
    title: "Mahindi na Unga wa Mahindi",
    description: "Tenganisha nafaka ya mahindi na unga wa mahindi kwa bei, unit, na stock sahihi.",
    image: "/products/maize-cobs-commons.jpg",
  },
  {
    title: "Animal Feeds na By-products",
    description: "Dhibiti uduv, mashudu, pumba, chokka na bidhaa nyingine za mifugo kwa picha husika.",
    image: "/products/animal-feeds.jpg",
  },
];

const platformCards = [
  {
    title: "MavunoOne Shop",
    icon: <PackageCheck className="h-7 w-7" />,
    accent: "bg-cyan-500/10 text-cyan-200 border-cyan-400/30",
    text: "Tazama bidhaa halisi, bei na upatikanaji, kisha tuma oda kwa timu ya MavunoOne.",
    link: "/shop",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#07150f] text-white">
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(234,179,8,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.2),transparent_32%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,_rgba(20,37,31,0.2),_rgba(10,18,15,0.92))]" />

        <header className="relative z-10 px-6 py-6 md:px-12">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div>
              <p className="text-2xl font-black tracking-tight md:text-4xl">MavunoOne</p>
              <p className="text-sm text-amber-200 md:text-base">African agribusiness platform</p>
            </div>

            <div className="hidden items-center gap-3 md:flex">
              <a
                href="https://wa.me/255712345678?text=Habari%20ninaomba%20kusaidika%20kuhusu%20MavunoOne."
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-amber-300/30 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Wasiliana
              </a>
              <Link href="/login">
                <button className="rounded-full bg-amber-400 px-5 py-2.5 text-sm font-bold text-emerald-950 transition hover:bg-amber-300">
                  Ingia
                </button>
              </Link>
            </div>
          </div>
        </header>

        <main className="relative z-10">
          <section className="px-6 pb-16 pt-8 md:px-12 md:pb-24 md:pt-14">
            <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.08fr_0.92fr]">
              <div>
                <div className="mb-6 inline-flex items-center rounded-full border border-amber-300/30 bg-amber-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">
                  Built for African commerce
                </div>

                <h1 className="max-w-xl text-4xl font-black tracking-tight text-white md:text-6xl md:leading-[1.05]">
                  Grow your agribusiness with clarity, speed, and control.
                </h1>

                <p className="mt-6 max-w-xl text-base leading-8 text-emerald-50 md:text-lg">
                  MavunoOne helps agro-businesses track sales, stock, deliveries, farmers, and payments in one connected system designed for real-world growth.
                </p>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <a
                    href="https://wa.me/255712345678?text=Habari%20ninaomba%20kufungua%20mfumo%20wa%20MavunoOne."
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-xl bg-amber-400 px-6 py-3.5 text-base font-black text-emerald-950 shadow-[0_20px_50px_rgba(251,191,36,0.32)] transition hover:bg-amber-300"
                  >
                    Tuma WhatsApp
                  </a>
                  <a
                    href="https://wa.me/255712345678?text=Habari%20ninaomba%20lipa%20kwa%20M-Pesa%20kufungua%20mfumo%20wa%20MavunoOne."
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-white/10"
                  >
                    LIPA
                  </a>
                </div>

                <div className="mt-8 grid max-w-lg grid-cols-3 gap-4">
                  {stats.map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                      <p className="text-xl font-black text-yellow-300">{item.value}</p>
                      <p className="mt-2 text-xs leading-5 text-emerald-100">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative h-[540px] overflow-hidden rounded-[30px] border border-white/10 shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
                <Image
                  src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80"
                  alt="Agriculture and logistics operations"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07150f] via-[#07150f]/45 to-[#07150f]/10" />

                <div className="absolute inset-x-6 bottom-6 rounded-2xl border border-white/20 bg-[#07150f]/70 p-5 backdrop-blur-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-amber-200">Business Overview</p>
                      <p className="mt-2 text-2xl font-black text-white">MavunoOne Growth</p>
                    </div>
                    <div className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                      +18.4%
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3">
                    <div className="rounded-xl bg-white/5 p-3">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-amber-200">Sales</p>
                      <p className="mt-2 text-lg font-black text-white">TZS 9.2M</p>
                    </div>
                    <div className="rounded-xl bg-white/5 p-3">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-amber-200">Stock</p>
                      <p className="mt-2 text-lg font-black text-white">1,420</p>
                    </div>
                    <div className="rounded-xl bg-white/5 p-3">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-amber-200">Deliveries</p>
                      <p className="mt-2 text-lg font-black text-white">89</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="px-6 py-6 md:px-12 md:py-12">
            <div className="mx-auto max-w-7xl">
              <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-200">Core solutions</p>
                  <h2 className="mt-3 text-3xl font-black text-white md:text-4xl">Built for the full agri-commerce cycle</h2>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {productCards.map((card) => (
                  <div key={card.title} className="group overflow-hidden rounded-[26px] border border-white/10 bg-white/5 shadow-[0_20px_45px_rgba(0,0,0,0.18)] transition hover:-translate-y-1 hover:border-emerald-400/40">
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={card.image}
                        alt={card.title}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#07150f] via-[#07150f]/25 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <p className="text-2xl font-bold text-white">{card.title}</p>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="text-sm leading-7 text-emerald-100">{card.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="px-6 py-14 md:px-12 md:py-20">
            <div className="mx-auto max-w-7xl">
              <div className="mb-10 text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-200">Public customer access</p>
                <h2 className="mt-4 text-3xl font-black text-white md:text-5xl">Anza kununua kwa usalama</h2>
              </div>

              <div className="mx-auto max-w-md">
                {platformCards.map((card) => (
                  <Link key={card.title} href={card.link} className="group block rounded-[28px] border border-white/10 bg-white/5 p-6 transition hover:border-emerald-400/40 hover:bg-white/10">
                    <div className={`mb-5 inline-flex rounded-2xl border p-3 ${card.accent}`}>
                      {card.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-white">{card.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-emerald-100">{card.text}</p>
                    <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-amber-300">
                      Open portal <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section className="px-6 pb-16 pt-4 md:px-12 md:pb-24">
            <div className="mx-auto max-w-6xl rounded-[32px] border border-emerald-400/20 bg-[linear-gradient(135deg,_rgba(16,185,129,0.12),_rgba(9,9,11,0.4))] p-8 md:p-12">
              <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-200">Why teams choose us</p>
                  <h2 className="mt-4 text-3xl font-black text-white md:text-5xl">One system for farm operations, sales, and delivery.</h2>
                  <p className="mt-5 max-w-xl text-base leading-8 text-emerald-50 md:text-lg">
                    From daily stock movement to customer follow-up and dispatch coordination, everything stays connected so operations remain efficient and profitable.
                  </p>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-[#07150f]/70 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.25)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-200">Get started</p>
                  <h3 className="mt-3 text-3xl font-black text-white">Start with a quick call</h3>

                  <div className="mt-6 space-y-3">
                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-200">WhatsApp</p>
                      <a href="https://wa.me/255712345678" target="_blank" rel="noreferrer" className="mt-2 block text-lg font-bold text-white">+255 712 345 678</a>
                    </div>
                    <div className="rounded-2xl border border-yellow-400/20 bg-yellow-500/10 p-3">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-yellow-200">M-Pesa</p>
                      <p className="mt-2 text-lg font-bold text-white">+255 712 345 678</p>
                    </div>
                  </div>

                  <a
                    href="https://wa.me/255712345678?text=Habari%20ninaomba%20kufungua%20mfumo%20wa%20MavunoOne%20kwa%20biashara%20yangu."
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-yellow-400 px-5 py-3.5 text-base font-black text-emerald-950 transition hover:bg-yellow-300"
                  >
                    Tuma WhatsApp Sasa
                  </a>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="relative z-10 border-t border-white/10 px-6 py-8 md:px-12">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-center text-sm text-emerald-100 md:flex-row md:text-left">
            <p>© 2026 MavunoOne</p>
            <p>Mahindi • Alizeti • Mifugo • Uwasilishaji • Business Intelligence</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
