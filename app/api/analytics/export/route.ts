import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { requirePrivilegedUser } from "@/lib/api-auth";

export const runtime = "nodejs";

interface SalesReport { date: string; totalSales: number; totalExpenses: number; profit: number; transactions: number; topProduct: string; }
interface Product { name: string; count: number; revenue: number; }
interface AnalyticsData { period: string; reports: SalesReport[]; summary: { totalRevenue: number; totalExpenses: number; netProfit: number; averageTransaction: number; topProducts: Product[]; customerCount: number; }; }
interface ExportRequestBody { data: AnalyticsData; format: string; period: { from: string; to: string }; }

export async function POST(request: NextRequest) {
  if (!requirePrivilegedUser(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = (await request.json()) as ExportRequestBody;
    const { data, format, period } = body;
    const filename = `analytics-${period.from}-${period.to}`;
    if (format === "csv") return new NextResponse(generateCSV(data), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${filename}.csv"` } });
    if (format === "json") return new NextResponse(JSON.stringify(data, null, 2), { headers: { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": `attachment; filename="${filename}.json"` } });
    if (format === "pdf") { const pdf = await generatePDF(data, period); return new NextResponse(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${filename}.pdf"`, "Content-Length": String(pdf.length) } }); }
    return NextResponse.json({ error: "Invalid format" }, { status: 400 });
  } catch (error) { console.error("Analytics export error:", error); return NextResponse.json({ error: "Export failed" }, { status: 500 }); }
}

function money(value: number) { return `TZS ${Number(value || 0).toLocaleString("en-US")}`; }
function csvCell(value: string | number) { return `"${String(value ?? "").replaceAll('"', '""')}"`; }
function generateCSV(data: AnalyticsData): string {
  const rows = ["MavunoOne Analytics Report", "", "Summary", ["Metric", "Value"].map(csvCell).join(","), ["Total Revenue", data.summary.totalRevenue].map(csvCell).join(","), ["Total Expenses", data.summary.totalExpenses].map(csvCell).join(","), ["Net Profit", data.summary.netProfit].map(csvCell).join(","), ["Average Transaction", data.summary.averageTransaction].map(csvCell).join(","), ["Customers", data.summary.customerCount].map(csvCell).join(","), "", "Top Products", ["Product", "Units", "Revenue"].map(csvCell).join(","), ...data.summary.topProducts.map((p) => [p.name, p.count, p.revenue].map(csvCell).join(",")), "", "Daily Breakdown", ["Date", "Sales", "Expenses", "Profit", "Transactions", "Top Product"].map(csvCell).join(","), ...data.reports.map((r) => [r.date, r.totalSales, r.totalExpenses, r.profit, r.transactions, r.topProduct].map(csvCell).join(","))];
  return rows.join("\n");
}

async function generatePDF(data: AnalyticsData, period: { from: string; to: string }): Promise<Buffer> {
  const doc = new PDFDocument({ size: "A4", margin: 42, info: { Title: "MavunoOne Analytics Report", Author: "MavunoOne" } });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const finished = new Promise<Buffer>((resolve, reject) => { doc.on("end", () => resolve(Buffer.concat(chunks))); doc.on("error", reject); });
  doc.fillColor("#064e3b").fontSize(22).font("Helvetica-Bold").text("MavunoOne", { continued: true }).fillColor("#0f172a").fontSize(16).text("  Business Analytics Report");
  doc.moveDown(0.35).fillColor("#64748b").fontSize(9).font("Helvetica").text(`Reporting period: ${period.from} to ${period.to}`);
  doc.moveDown(1).strokeColor("#d1d5db").moveTo(42, doc.y).lineTo(553, doc.y).stroke();
  doc.moveDown(0.8).fillColor("#0f172a").font("Helvetica-Bold").fontSize(12).text("Executive summary");
  doc.moveDown(0.35).font("Helvetica").fontSize(10).text(`Total revenue: ${money(data.summary.totalRevenue)}`).text(`Total expenses: ${money(data.summary.totalExpenses)}`).text(`Net profit: ${money(data.summary.netProfit)}`).text(`Average transaction: ${money(data.summary.averageTransaction)}`).text(`Customers: ${data.summary.customerCount}`);
  doc.moveDown(1).font("Helvetica-Bold").fontSize(12).text("Top products");
  doc.moveDown(0.35).font("Helvetica").fontSize(9);
  if (data.summary.topProducts.length) data.summary.topProducts.slice(0, 10).forEach((p, index) => doc.text(`${index + 1}. ${p.name} — ${p.count} units — ${money(p.revenue)}`)); else doc.fillColor("#64748b").text("No product sales recorded for this period.");
  doc.moveDown(1).fillColor("#0f172a").font("Helvetica-Bold").fontSize(12).text("Daily breakdown");
  doc.moveDown(0.35).font("Helvetica-Bold").fontSize(8).text("Date", 42, doc.y, { width: 75 }).text("Sales", 117, doc.y, { width: 85 }).text("Expenses", 202, doc.y, { width: 85 }).text("Profit", 287, doc.y, { width: 85 }).text("Transactions", 372, doc.y, { width: 85 });
  doc.moveDown(0.25).font("Helvetica").fontSize(8);
  for (const report of data.reports.slice(0, 31)) { if (doc.y > 735) doc.addPage(); const y = doc.y; doc.text(report.date, 42, y, { width: 75 }).text(money(report.totalSales), 117, y, { width: 85 }).text(money(report.totalExpenses), 202, y, { width: 85 }).text(money(report.profit), 287, y, { width: 85 }).text(String(report.transactions), 372, y, { width: 85 }); doc.moveDown(0.45); }
  doc.moveDown(1).fillColor("#64748b").fontSize(8).text("Generated from MavunoOne operational analytics.", { align: "left" });
  doc.end();
  return finished;
}
