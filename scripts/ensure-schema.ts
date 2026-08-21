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
  console.log("Database schema ready: products.isPublic is available.");
} finally {
  await sql.end({ timeout: 5 });
}
