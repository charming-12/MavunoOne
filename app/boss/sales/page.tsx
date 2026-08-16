"use client";

export default function BossSalesPage() {
  const todaySales = [
    { invoice: "INV-001", customer: "John Mkwambi", amount: 450000, time: "14:30" },
    { invoice: "INV-002", customer: "Amina Hassan", amount: 120000, time: "12:15" },
    { invoice: "INV-003", customer: "Emmanuel Kamari", amount: 350000, time: "09:45" },
  ];

  const weekSales = 4500000;
  const avgDaily = 643000;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-800 text-white p-4">
        <h1 className="text-lg font-bold">Mauzo — Leo</h1>
      </header>

      <main className="p-4 space-y-4">
        {/* Quick Stats */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-gray-600 text-xs">Jumla ya Leo</p>
              <p className="text-xl font-bold text-green-600 mt-1">
                TZS {todaySales.reduce((sum, s) => sum + s.amount, 0).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-xs">Idadi ya Mauzo</p>
              <p className="text-xl font-bold text-blue-600 mt-1">{todaySales.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-gray-600 text-xs">Wiki Jumla</p>
              <p className="text-lg font-bold text-purple-600 mt-1">
                TZS {(weekSales / 1000000).toFixed(1)}M
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-xs">Wastani kwa Siku</p>
              <p className="text-lg font-bold text-orange-600 mt-1">
                TZS {(avgDaily / 1000).toFixed(0)}K
              </p>
            </div>
          </div>
        </div>

        {/* Recent Sales */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">Mauzo ya Hivi Karibuni</h3>
          </div>
          <div className="divide-y">
            {todaySales.map(sale => (
              <div key={sale.invoice} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{sale.invoice}</p>
                  <p className="text-xs text-gray-600">{sale.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">+TZS {(sale.amount / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-gray-600">{sale.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700">
          Angalia Ripoti Kamili
        </button>
      </main>
    </div>
  );
}
