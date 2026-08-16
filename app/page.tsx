"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-400 opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-400 opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-green-400 opacity-3 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="px-6 py-8 md:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-2">🌾 MavunoOne</h1>
                <p className="text-yellow-300 text-lg font-semibold">Mfumo wa Usimamizi wa Biashara ya Kilimo</p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="https://wa.me/255712345678?text=Habari%20ninaomba%20kusaidika%20kuhusu%20bidhaa%20na%20mauzo."
                  target="_blank"
                  rel="noreferrer"
                  className="hidden md:inline-flex bg-white/10 border border-white/20 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-white/15 transition"
                >
                  Wasiliana Nasi
                </a>
                <Link href="/login">
                  <button className="bg-yellow-400 text-green-900 px-6 py-3 rounded-lg font-bold hover:bg-yellow-300 transition transform hover:scale-105">
                    Ingia
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="px-6 md:px-12 py-16">
          <div className="max-w-7xl mx-auto text-center">
            <p className="inline-flex items-center rounded-full border border-yellow-300/40 bg-yellow-400/10 px-4 py-2 text-sm font-semibold text-yellow-200 mb-6">
              Mahindi • Alizeti • Feed • Uduvi • Chokaa
            </p>
            <h2 className="text-3xl md:text-6xl font-black mb-6 tracking-tight">
              Simamia Biashara Yako kwa Urahisi
            </h2>
            <p className="text-green-100 text-lg md:text-xl max-w-4xl mx-auto mb-10 leading-relaxed">
              Mifumo kamili wa usimamizi wa mazao ya kilimo, pembejeo za ufugaji, sukari, chumvi,
              chakula cha mifugo, mafuta ya alizeti, uduvi, chokaa, na bidhaa zote muhimu kwa biashara yako.
              Rafiki yako katika kila hatua ya mauzo, hesabu na usambazaji.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
              <Link href="/login" className="bg-yellow-400 text-green-900 px-8 py-4 rounded-xl font-black text-lg shadow-xl hover:bg-yellow-300 transition transform hover:-translate-y-0.5">
                Ingia Katika Mfumo
              </Link>
              <a
                href="https://wa.me/255712345678?text=Habari%20ninaomba%20maelezo%20ya%20bidhaa%20na%20mauzo."
                target="_blank"
                rel="noreferrer"
                className="border border-white/30 bg-white/5 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition"
              >
                Lipa Sasa
              </a>
            </div>

            {/* Features Overview - Real Images */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              {/* Agriculture Card */}
              <div className="relative h-80 rounded-xl overflow-hidden group cursor-pointer hover:shadow-2xl transition">
                <Image
                  src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=600&h=400&fit=crop"
                  alt="Mahindi & Alizeti - Green agricultural fields"
                  fill
                  className="object-cover group-hover:scale-110 transition duration-300"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition"></div>
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <h3 className="text-2xl font-bold mb-2 text-white">Mahindi & Alizeti</h3>
                  <p className="text-gray-100 text-sm">Usimamizi wa stock, bei, mauzo na rekodi ya bidhaa muhimu za kilimo.</p>
                </div>
              </div>

              {/* Livestock & Feed Card */}
              <div className="relative h-80 rounded-xl overflow-hidden group cursor-pointer hover:shadow-2xl transition">
                <Image
                  src="https://images.unsplash.com/photo-1560493676-04071c5f467b?w=600&h=400&fit=crop"
                  alt="Mifugo - Livestock and animal feed"
                  fill
                  className="object-cover group-hover:scale-110 transition duration-300"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition"></div>
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <h3 className="text-2xl font-bold mb-2 text-white">Mifugo & Feed</h3>
                  <p className="text-gray-100 text-sm">Mifumo ya chakula cha wanyama, uduvi, chokaa na bidhaa za majaribio ya kisasa.</p>
                </div>
              </div>

              {/* Logistics Card */}
              <div className="relative h-80 rounded-xl overflow-hidden group cursor-pointer hover:shadow-2xl transition">
                <Image
                  src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop"
                  alt="Uwasilishaji - Delivery and logistics trucks"
                  fill
                  className="object-cover group-hover:scale-110 transition duration-300"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition"></div>
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <h3 className="text-2xl font-bold mb-2 text-white">Uwasilishaji</h3>
                  <p className="text-gray-100 text-sm">GPS ya magari, taarifa za usafiri na usimamizi wa uhasibu wa haraka.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Three Portals */}
        <section className="px-6 md:px-12 py-16">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-16">Chagua Portal Yako</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Office Portal */}
              <Link href="/office">
                <div className="bg-white text-gray-900 rounded-2xl shadow-2xl p-8 hover:shadow-3xl transition transform hover:-translate-y-2 cursor-pointer h-full">
                  <div className="text-5xl mb-4">🏢</div>
                  <h3 className="text-2xl font-bold mb-2">Office Portal</h3>
                  <p className="text-gray-600 mb-6">
                    Kwa wafanyakazi wa ofisi. Usimamizi wa mauzo, stock, wateja, bidhaa za kilimo na ripoti za kila siku.
                  </p>
                  <div className="space-y-2 mb-6 text-sm text-gray-700">
                    <p>✅ Mauzo (POS)</p>
                    <p>✅ Usimamizi wa Stock</p>
                    <p>✅ Wateja & Wakulima</p>
                    <p>✅ Ripoti za Kila Siku</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                      Desktop
                    </span>
                    <ArrowRight className="text-green-600" size={24} />
                  </div>
                </div>
              </Link>

              {/* Boss App */}
              <Link href="/boss">
                <div className="bg-gray-900 text-white rounded-2xl shadow-2xl p-8 hover:shadow-3xl transition transform hover:-translate-y-2 cursor-pointer h-full border-2 border-green-500">
                  <div className="text-5xl mb-4">📱</div>
                  <h3 className="text-2xl font-bold mb-2">Boss App</h3>
                  <p className="text-green-100 mb-6">
                    Kwa Mzee Kisiri. Muhtasari wa haraka, GPS ya magari, arifa, mauzo na hali ya biashara kwa simu.
                  </p>
                  <div className="space-y-2 mb-6 text-sm text-green-100">
                    <p>✅ Dashboard Haraka</p>
                    <p>✅ GPS Magari</p>
                    <p>✅ Arifa za Haraka</p>
                    <p>✅ PWA Offline</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Mobile
                    </span>
                    <ArrowRight className="text-green-400" size={24} />
                  </div>
                </div>
              </Link>

              {/* Shop Portal */}
              <Link href="/shop">
                <div className="bg-white text-gray-900 rounded-2xl shadow-2xl p-8 hover:shadow-3xl transition transform hover:-translate-y-2 cursor-pointer h-full">
                  <div className="text-5xl mb-4">🛒</div>
                  <h3 className="text-2xl font-bold mb-2">Shop Portal</h3>
                  <p className="text-gray-600 mb-6">
                    Kwa wateja na wakulima. Kununua pembejeo, chakula cha mifugo, sukari, chumvi na bidhaa nyingine kwa urahisi.
                  </p>
                  <div className="space-y-2 mb-6 text-sm text-gray-700">
                    <p>✅ Orodha ya Bidhaa</p>
                    <p>✅ Kikapu wa Kununua</p>
                    <p>✅ Kuagiza Online</p>
                    <p>✅ Taarifa ya Makazi</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                      Wateja
                    </span>
                    <ArrowRight className="text-green-600" size={24} />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section className="px-6 md:px-12 py-16 bg-black bg-opacity-20">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">Jaribu Sasa</h2>
            <p className="text-green-100 mb-8">Akaunti za demo zimefungua. Isimu haraka:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="bg-blue-900 bg-opacity-50 backdrop-blur rounded-lg p-4">
                <p className="font-bold text-yellow-300">Office Admin</p>
                <p className="text-sm text-green-100">admin@mavunoone.com</p>
                <p className="text-sm text-green-100">Neno: admin123</p>
              </div>
              <div className="bg-purple-900 bg-opacity-50 backdrop-blur rounded-lg p-4">
                <p className="font-bold text-yellow-300">Mzee (Boss)</p>
                <p className="text-sm text-green-100">boss@mavunoone.com</p>
                <p className="text-sm text-green-100">Neno: boss123</p>
              </div>
            </div>
            <Link href="/login">
              <button className="mt-8 bg-yellow-400 text-green-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-300 transition transform hover:scale-105">
                Ingia Haraka →
              </button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 md:px-12 py-8 border-t border-green-700 border-opacity-30">
          <div className="max-w-7xl mx-auto text-center text-green-200">
            <p>© 2024 MavunoOne - Biashara Hub ya Mzee Kisiri</p>
            <p className="text-sm mt-2">Mahindi • Alizeti • Kusaga • Kukoboa • Uwasilishaji</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
