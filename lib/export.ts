/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Data Export Utilities
 * Export sales, stock, and other data to CSV and Excel formats
 */

export interface ExportOptions {
  filename?: string;
  includeTimestamp?: boolean;
}

/**
 * Convert array of objects to CSV string
 */
export function convertToCSV<T extends Record<string, any>>(
  data: T[],
  columns?: (keyof T)[]
): string {
  if (data.length === 0) {
    return "";
  }

  // Determine columns to export
  const cols = columns || (Object.keys(data[0]) as (keyof T)[]);

  // Create header row
  const header = cols.map((col) => sanitizeCSVValue(String(col))).join(",");

  // Create data rows
  const rows = data.map((row) =>
    cols.map((col) => sanitizeCSVValue(String(row[col] || ""))).join(",")
  );

  return [header, ...rows].join("\n");
}

/**
 * Sanitize values for CSV (handle commas, quotes, newlines)
 */
function sanitizeCSVValue(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Download CSV file to browser
 */
export function downloadCSV<T extends Record<string, any>>(
  data: T[],
  filename: string = "export.csv",
  columns?: (keyof T)[]
): void {
  const csv = convertToCSV(data, columns);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  link.setAttribute("href", URL.createObjectURL(blob));
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generate Excel-like CSV with formatting
 */
export function generateExportData<T extends Record<string, any>>(
  data: T[],
  title: string,
  options: ExportOptions = {}
): string {
  const lines: string[] = [];

  // Add title
  lines.push(title);
  lines.push("");

  // Add timestamp if requested
  if (options.includeTimestamp) {
    lines.push(`Generated: ${new Date().toLocaleString("en-US")}`);
    lines.push("");
  }

  // Add CSV data
  if (data.length > 0) {
    lines.push(convertToCSV(data));
  } else {
    lines.push("No data available");
  }

  return lines.join("\n");
}

/**
 * Export sales data
 */
export interface SaleExport {
  invoiceNumber: string;
  date: string;
  customer: string;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  items: string;
}

export function exportSalesData(
  sales: any[],
  filename: string = "sales_report.csv"
): void {
  const exportData: SaleExport[] = sales.map((sale) => ({
    invoiceNumber: sale.invoiceNumber,
    date: new Date(sale.createdAt).toLocaleDateString(),
    customer: sale.customerId ? sale.customerId : "Walk-in",
    totalAmount: Number(sale.totalAmount || 0),
    paymentMethod: sale.paymentMethod || "N/A",
    paymentStatus: sale.paymentStatus || "N/A",
    items: sale.items?.length || 0,
  }));

  downloadCSV(exportData, filename);
}

/**
 * Export inventory/stock data
 */
export interface StockExport {
  productName: string;
  quantity: number;
  unit: string;
  costPrice: number;
  sellPrice: number;
  totalValue: number;
  status: string;
}

export function exportStockData(
  products: any[],
  filename: string = "stock_report.csv"
): void {
  const exportData: StockExport[] = products.map((product) => {
    const quantity = Number(product.currentStock || 0);
    const costPrice = Number(product.costPrice || 0);
    return {
      productName: product.name,
      quantity,
      unit: product.unit || "kg",
      costPrice,
      sellPrice: Number(product.sellPrice || 0),
      totalValue: quantity * costPrice,
      status: quantity <= Number(product.lowStockThreshold || 0) ? "LOW" : "OK",
    };
  });

  downloadCSV(exportData, filename);
}

/**
 * Export customer data
 */
export interface CustomerExport {
  customerName: string;
  phone: string;
  email: string;
  customerType: string;
  balance: number;
  creditLimit: number;
}

export function exportCustomerData(
  customers: any[],
  filename: string = "customers_report.csv"
): void {
  const exportData: CustomerExport[] = customers.map((customer) => ({
    customerName: customer.name,
    phone: customer.phone || "N/A",
    email: customer.email || "N/A",
    customerType: customer.customerType || "Retail",
    balance: Number(customer.balance || 0),
    creditLimit: Number(customer.creditLimit || 0),
  }));

  downloadCSV(exportData, filename);
}

/**
 * Export expenses data
 */
export interface ExpenseExport {
  date: string;
  category: string;
  amount: number;
  description: string;
}

export function exportExpensesData(
  expenses: any[],
  filename: string = "expenses_report.csv"
): void {
  const exportData: ExpenseExport[] = expenses.map((expense) => ({
    date: new Date(expense.date).toLocaleDateString(),
    category: expense.category,
    amount: Number(expense.amount || 0),
    description: expense.description || "",
  }));

  downloadCSV(exportData, filename);
}

/**
 * Export machine jobs
 */
export interface MachineJobExport {
  jobType: string;
  customer: string;
  inputProduct: string;
  inputKg: number;
  outputKg: number;
  efficiency: string;
  serviceFee: number;
  date: string;
  status: string;
}

export function exportMachineJobsData(
  jobs: any[],
  filename: string = "machine_jobs_report.csv"
): void {
  const exportData: MachineJobExport[] = jobs.map((job) => ({
    jobType: job.jobType,
    customer: job.customerId || "N/A",
    inputProduct: job.inputProduct,
    inputKg: Number(job.inputKg || 0),
    outputKg:
      Number(job.outputKg1 || 0) + Number(job.outputKg2 || 0),
    efficiency: job.efficiency ? `${job.efficiency}%` : "N/A",
    serviceFee: Number(job.serviceFee || 0),
    date: new Date(job.createdAt).toLocaleDateString(),
    status: job.status || "Pending",
  }));

  downloadCSV(exportData, filename);
}

/**
 * Convert number to currency format
 */
export function formatCurrency(value: number, currency: string = "TZS"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(value);
}

/**
 * Generate summary report
 */
export interface SummaryReport {
  totalSales: number;
  totalRevenue: number;
  totalCustomers: number;
  lowStockItems: number;
  pendingOrders: number;
  totalExpenses: number;
  netProfit: number;
}

export function generateSummaryReport(data: {
  sales: any[];
  customers: any[];
  products: any[];
  expenses: any[];
}): SummaryReport {
  const totalRevenue = data.sales.reduce(
    (sum, sale) => sum + Number(sale.totalAmount || 0),
    0
  );

  const totalExpenses = data.expenses.reduce(
    (sum, expense) => sum + Number(expense.amount || 0),
    0
  );

  const lowStockItems = data.products.filter(
    (p) => Number(p.currentStock || 0) <= Number(p.lowStockThreshold || 0)
  ).length;

  return {
    totalSales: data.sales.length,
    totalRevenue,
    totalCustomers: data.customers.length,
    lowStockItems,
    pendingOrders: data.sales.filter((s) => s.status === "pending").length,
    totalExpenses,
    netProfit: totalRevenue - totalExpenses,
  };
}
