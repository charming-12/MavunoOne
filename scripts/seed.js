#!/usr/bin/env node

(async () => {
  // Load .env IMMEDIATELY
  const { default: dotenv } = await import("dotenv");
  dotenv.config({ path: ".env" });
  dotenv.config({ path: ".env.local" });

  // Verify DATABASE_URL is loaded
  if (!process.env.DATABASE_URL) {
    console.error("❌ ERROR: DATABASE_URL is not set in .env file");
    process.exit(1);
  }

  console.log("✓ Environment loaded");
  console.log("✓ DATABASE_URL configured");
  console.log("");

  // NOW run the TypeScript seed script
  const { default: runTsx } = await import("tsx/cjs");
  runTsx("./scripts/seed-production.ts");
})();
