import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required to ensure the application schema.");

const sql = postgres(databaseUrl, {
  ssl: process.env.NODE_ENV === "production" || databaseUrl.includes("neon.tech") ? { rejectUnauthorized: false } : false,
  max: 1,
  idle_timeout: 5,
  connect_timeout: 15,
});
try {
  await sql`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "isPublic" boolean NOT NULL DEFAULT true`;
  await sql`ALTER TABLE "stock_in" ADD COLUMN IF NOT EXISTS "packageCount" numeric(12,2)`;
  await sql`ALTER TABLE "stock_in" ADD COLUMN IF NOT EXISTS "packageWeightKg" numeric(12,3)`;
  await sql`ALTER TABLE "stock_in" ADD COLUMN IF NOT EXISTS "packageWeightsKg" text`;
  await sql`ALTER TABLE "stock_out" ADD COLUMN IF NOT EXISTS "packageCount" numeric(12,2)`;
  await sql`ALTER TABLE "stock_out" ADD COLUMN IF NOT EXISTS "packageWeightKg" numeric(12,3)`;
  await sql`ALTER TABLE "stock_out" ADD COLUMN IF NOT EXISTS "packageWeightsKg" text`;
  await sql`ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "paymentReference" varchar(128)`;
  await sql`ALTER TABLE "sales" ADD COLUMN IF NOT EXISTS "paymentTransactionId" varchar(128)`;
  console.log("Database schema ready: product visibility, package-level inventory, and payment reference fields are available.");
} finally {
  await sql.end({ timeout: 5 });
}
