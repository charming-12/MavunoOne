import { NextRequest, NextResponse } from "next/server";

// Mock analytics data generator
function generateAnalytics(from: string, to: string) {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const reports = [];
  
  for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
    const date = d.toISOString().split("T")[0];
    const sales = Math.floor(Math.random() * 700000) + 300000;
    const expenses = Math.floor(Math.random() * 200000) + 80000;
    
    reports.push({
      date,
      totalSales: sales,
      totalExpenses: expenses,
      profit: sales - expenses,
      transactions: Math.floor(Math.random() * 50) + 10,
      topProduct: ["Mahindi", "Unga", "Alizeti"][Math.floor(Math.random() * 3)],
    });
  }

  const totalRevenue = reports.reduce((sum, r) => sum + r.totalSales, 0);
  const totalExpenses = reports.reduce((sum, r) => sum + r.totalExpenses, 0);
  const netProfit = totalRevenue - totalExpenses;

  return {
    period: `${from} to ${to}`,
    reports,
    summary: {
      totalRevenue,
      totalExpenses,
      netProfit,
      averageTransaction: Math.floor(totalRevenue / reports.reduce((sum, r) => sum + r.transactions, 0)),
      topProducts: [
        { name: "Mahindi (Raw)", count: 125, revenue: Math.floor(totalRevenue * 0.25) },
        { name: "Unga wa Mahindi", count: 89, revenue: Math.floor(totalRevenue * 0.18) },
        { name: "Alizeti (Raw)", count: 45, revenue: Math.floor(totalRevenue * 0.12) },
      ],
      customerCount: Math.floor(Math.random() * 200) + 100,
    },
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") || "2024-01-01";
  const to = searchParams.get("to") || "2024-01-31";

  const analytics = generateAnalytics(from, to);
  
  return NextResponse.json(analytics);
}
