"use client";

import { ArrowRight, Leaf, Zap, Truck } from "lucide-react";
import Link from "next/link";

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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-2">🌾 MavunoOne</h1>
                <p className="text-yellow-300 text-lg font-semibold">Mfumo wa Usimamizi wa Biashara ya Kilimo</p>
              </div>
              <Link href="/login">
                <button className="bg-yellow-400 text-green-900 px-6 py-3 rounded-lg font-bold hover:bg-yellow-300 transition transform hover:scale-105">
                  Ingia
                </button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="px-6 md:px-12 py-16">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Simamia Biashara Yako kwa Urahisi
            </h2>
            <p className="text-green-100 text-lg md:text-xl max-w-3xl mx-auto mb-12">
              Mfumo kamili wa usimamizi wa mahindi, alizee, kusaga, kukoboa, na uwasilishaji.
              Rafiki yako katika kila hatua ya biashara.
            </p>

            {/* Features Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 hover:bg-opacity-20 transition">
                <Leaf className="mx-auto mb-4 text-yellow-300" size={32} />
                <h3 className="text-xl font-bold mb-2">Mahindi & Alizee</h3>
                <p className="text-green-100">Usimamizi kamili wa bidhaa, bei, na stock</p>
              </div>

              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 hover:bg-opacity-20 transition">
                <Zap className="mx-auto mb-4 text-yellow-300" size={32} />
                <h3 className="text-xl font-bold mb-2">Kusaga & Kukoboa</h3>
                <p className="text-green-100">Jira ya kazi za mashine na ajili za ujenzi</p>
              </div>

              <div className="bg-white bg-opacity-10 backdrop-blur rounded-xl p-6 hover:bg-opacity-20 transition">
                <Truck className="mx-auto mb-4 text-yellow-300" size={32} />
                <h3 className="text-xl font-bold mb-2">Uwasilishaji</h3>
                <p className="text-green-100">GPS kuhusu magari na rafiki wa mlangoni</p>
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
                    Kwa wafanyakazi katika ofisi. Usimamizi kamili wa biashara, POS, stock, wateja.
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
                    Kwa Mzee Kisiri. Muhtasari wa haraka, GPS magari, simu PWA.
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
                    Kwa wateja. Kununua bidhaa, kuagiza, taarifa ya uwasilishaji.
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
            <p className="text-sm mt-2">Mahindi • Alizee • Kusaga • Kukoboa • Uwasilishaji</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
