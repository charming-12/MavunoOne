export function normalizeText(value: unknown, maxLength = 500) {
  return String(value ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLength);
}

export function normalizeEmail(value: unknown) {
  return normalizeText(value, 320).toLowerCase();
}

export function normalizePhone(value: unknown) {
  return normalizeText(value, 32).replace(/[^0-9+()\-\s]/g, "");
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 320;
}
