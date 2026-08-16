"use client";

import { Plus, Zap } from "lucide-react";

export default function MachinesPage() {
  const machineJobs = [
    // MAHINDI MILLING JOBS
    { id: 1, customer: "John Mkwambi", product: "Mahindi → Unga", inputKg: 50, outputKg: 45, efficiency: 90, status: "Completed", date: "2026-08-15 14:30" },
    { id: 2, customer: "Amina Hassan", product: "Mahindi → Pumba", inputKg: 30, outputKg: 27, efficiency: 90, status: "In Progress", date: "2026-08-15 12:15" },
    { id: 3, customer: "Emmanuel Kamari", product: "Mahindi → Uduvi", inputKg: 25, outputKg: 20, efficiency: 80, status: "Completed", date: "2026-08-14 16:45" },
    { id: 4, customer: "Mary Pamba", product: "Mahindi → Kahdarikaa", inputKg: 40, outputKg: 38, efficiency: 95, status: "Completed", date: "2026-08-14 11:20" },
    // ALIZETI OIL PRODUCTION
    { id: 5, customer: "Hassan Rashid", product: "Alizeti → Mafuta", inputKg: 100, outputKg: 25, efficiency: 25, status: "Completed", date: "2026-08-13 10:00" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mashine</h1>
          <p className="text-gray-600 mt-2">Dhamana ya jobs ya kusindika</p>
        </div>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
          <Plus size={20} />
          Kazi Mpya
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Mteja</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Bidhaa</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ingizo</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Matokeo</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ufanisi</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tarehe</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Hali</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {machineJobs.map(job => (
              <tr key={job.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{job.customer}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{job.product}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{job.inputKg} kg</td>
                <td className="px-6 py-4 text-sm text-gray-600">{job.outputKg} kg</td>
                <td className="px-6 py-4 text-sm">
                  <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded font-medium">
                    <Zap size={16} />
                    {job.efficiency}%
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{job.date}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded text-sm ${
                    job.status === "Completed"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}>
                    {job.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
