import { NextRequest, NextResponse } from "next/server";

interface SalesReport {
  date: string;
  totalSales: number;
  totalExpenses: number;
  profit: number;
  transactions: number;
  topProduct: string;
}

interface Product {
  name: string;
  count: number;
  revenue: number;
}

interface AnalyticsData {
  period: string;
  reports: SalesReport[];
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    averageTransaction: number;
    topProducts: Product[];
    customerCount: number;
  };
}

interface ExportRequestBody {
  data: AnalyticsData;
  format: string;
  period: { from: string; to: string };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ExportRequestBody;
    const { data, format, period } = body;

    if (format === "csv") {
      // Generate CSV
      const csv = generateCSV(data);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="analytics-${period.from}-${period.to}.csv"`,
        },
      });
    } else if (format === "json") {
      // Generate JSON
      return new NextResponse(JSON.stringify(data, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="analytics-${period.from}-${period.to}.json"`,
        },
      });
    } else if (format === "pdf") {
      // PDF generation would require a library like jsPDF or html2pdf
      // For now, return a mock response
      return NextResponse.json({
        message: "PDF export inahitaji kufanya kuanzia sehemu ya PDF library (pdfkit au html2pdf)",
        status: "pending",
      });
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 });
  } catch (error) {
    console.error("Analytics export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}

function generateCSV(data: AnalyticsData): string {
  let csv = "Analytics Report\n\n";

  // Summary section
  csv += "Summary Metrics\n";
  csv += `Total Revenue,${data.summary.totalRevenue}\n`;
  csv += `Total Expenses,${data.summary.totalExpenses}\n`;
  csv += `Net Profit,${data.summary.netProfit}\n`;
  csv += `Average Transaction,${data.summary.averageTransaction}\n\n`;

  // Top products
  csv += "Top Products\n";
  csv += "Name,Sales Count,Revenue\n";
  data.summary.topProducts.forEach((p) => {
    csv += `"${p.name}",${p.count},${p.revenue}\n`;
  });
  csv += "\n";

  // Daily breakdown
  csv += "Daily Breakdown\n";
  csv += "Date,Total Sales,Total Expenses,Profit,Transactions\n";
  data.reports.forEach((r) => {
    csv += `${r.date},${r.totalSales},${r.totalExpenses},${r.profit},${r.transactions}\n`;
  });

  return csv;
}
