import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { configurations } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

type PaymentConfig = {
  enabled?: boolean;
  provider?: string;
  merchantName?: string;
  merchantNumber?: string;
  merchantNameMpesa?: string;
  merchantNumberMpesa?: string;
  merchantNameTigo?: string;
  merchantNumberTigo?: string;
};

export async function GET() {
  try {
    const config = await db.query.configurations.findFirst({ where: eq(configurations.key, "SETUP_WIZARD_CONFIG") });
    if (!config) return NextResponse.json({ enabled: false, provider: null, merchantName: null, merchantNumber: null, mpesa: null, tigopesa: null });
    const parsed = JSON.parse(config.value) as { payment?: PaymentConfig };
    const payment = parsed.payment ?? {};
    const legacy = { name: payment.merchantName ?? null, number: payment.merchantNumber ?? null };
    const mpesa = {
      name: payment.merchantNameMpesa || ((payment.provider === "mpesa" || payment.provider === "both") ? legacy.name : null),
      number: payment.merchantNumberMpesa || ((payment.provider === "mpesa" || payment.provider === "both") ? legacy.number : null),
    };
    const tigopesa = {
      name: payment.merchantNameTigo || ((payment.provider === "tigopesa" || payment.provider === "both") ? legacy.name : null),
      number: payment.merchantNumberTigo || ((payment.provider === "tigopesa" || payment.provider === "both") ? legacy.number : null),
    };
    return NextResponse.json({
      enabled: Boolean(payment.enabled && (mpesa.number || tigopesa.number || legacy.number)),
      provider: payment.provider ?? null,
      merchantName: legacy.name,
      merchantNumber: legacy.number,
      mpesa: mpesa.number ? mpesa : null,
      tigopesa: tigopesa.number ? tigopesa : null,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ enabled: false, provider: null, merchantName: null, merchantNumber: null, mpesa: null, tigopesa: null }, { status: 200 });
  }
}
