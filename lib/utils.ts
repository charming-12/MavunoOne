// Currency formatting
export function formatTZS(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "TZS",
    minimumFractionDigits: 0,
  }).format(amount);
}

// Date formatting
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("sw-TZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Date time formatting
export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("sw-TZ", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Invoice number generator
export function generateInvoiceNumber(): string {
  return `INV-${Date.now()}`;
}

// Percentage calculation
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

// Truncate text
export function truncateText(text: string, length: number = 50): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
}

// Phone number validation (Tanzania)
export function isValidTZPhone(phone: string): boolean {
  const tzPattern = /^(\+255|0)[67]\d{8}$/;
  return tzPattern.test(phone.replace(/\s+/g, ""));
}

// Email validation
export function isValidEmail(email: string): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}
