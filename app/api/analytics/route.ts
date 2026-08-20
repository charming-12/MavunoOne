import { NextRequest, NextResponse } from "next/server";
import { and, gte, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { customers, expenses, sales } from "@/drizzle/schema";
import { requireAnalyticsUser } from "@/lib/api-auth";

function parseDate(value: string | null, fallback: Date) {
  if (!value) return fallback;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

function isoDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  if (!requireAnalyticsUser(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const searchParams = new URL(request.url).searchParams;
    const now = new Date();
    const defaultFrom = new Date(now);
    defaultFrom.setUTCDate(defaultFrom.getUTCDate() - 6);
    const from = parseDate(searchParams.get("from"), defaultFrom);
    const to = parseDate(searchParams.get("to"), now);
    to.setUTCHours(23, 59, 59, 999);
    if (from > to) return NextResponse.json({ error: "Invalid reporting period" }, { status: 400 });

    const [salesRows, expenseRows, customerRows] = await Promise.all([
      db.query.sales.findMany({ where: and(gte(sales.createdAt, from), lte(sales.createdAt, to)) }),
      db.query.expenses.findMany({ where: and(gte(expenses.date, from), lte(expenses.date, to)) }),
      db.query.customers.findMany({ where: and(gte(customers.createdAt, from), lte(customers.createdAt, to)) }),
    ]);

    const reports = [];
    for (const cursor = new Date(from); cursor <= to; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
      const date = isoDate(cursor);
      const dailySales = salesRows.filter((sale) => isoDate(sale.createdAt) === date);
      const dailyExpenses = expenseRows.filter((expense) => isoDate(expense.date) === date);
      const totalSales = dailySales.reduce((sum, sale) => sum + Number(sale.totalAmount || 0), 0);
      const totalExpenses = dailyExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
      reports.push({ date, totalSales, totalExpenses, profit: totalSales - totalExpenses, transactions: dailySales.length, topProduct: "—" });
    }

    const totalRevenue = reports.reduce((sum, report) => sum + report.totalSales, 0);
    const totalExpenses = reports.reduce((sum, report) => sum + report.totalExpenses, 0);
    return NextResponse.json({
      period: `${isoDate(from)} to ${isoDate(to)}`,
      reports,
      summary: {
        totalRevenue,
        totalExpenses,
        netProfit: totalRevenue - totalExpenses,
        averageTransaction: salesRows.length ? totalRevenue / salesRows.length : 0,
        topProducts: [],
        customerCount: customerRows.length,
      },
    });
  } catch (error) {
    console.error("Live analytics error:", error);
    return NextResponse.json({ error: "Analytics unavailable" }, { status: 500 });
  }
}
