import { getConfigValue } from "@/lib/runtime-config";

export type TaxSettings = {
  enabled: boolean;
  rate: number;
  label: string;
};

const parseBoolean = (value: string | null) => ["1", "true", "yes", "on"].includes((value ?? "").trim().toLowerCase());

export async function getTaxSettings(): Promise<TaxSettings> {
  const [enabledValue, rateValue, labelValue] = await Promise.all([
    getConfigValue("VAT_ENABLED"),
    getConfigValue("VAT_RATE"),
    getConfigValue("VAT_LABEL"),
  ]);

  const parsedRate = Number(rateValue ?? "18");
  return {
    enabled: parseBoolean(enabledValue),
    rate: Number.isFinite(parsedRate) && parsedRate >= 0 && parsedRate <= 100 ? parsedRate : 18,
    label: labelValue?.trim() || "VAT",
  };
}

export function calculateTax(subtotal: number, settings: TaxSettings) {
  const taxAmount = settings.enabled ? subtotal * (settings.rate / 100) : 0;
  return { taxAmount, totalAmount: subtotal + taxAmount };
}
