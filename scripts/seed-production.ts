/**
 * Production Database Seeding Script
 * Seeds MavunoOne database with admin and boss user credentials
 * Usage: npx tsx scripts/seed-production.ts
 */

// MUST be near the top to load env vars
import dotenv from "dotenv";
import { seedDatabase } from "@/lib/seed";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local" });

async function main() {
  console.log("🌱 Starting MavunoOne Database Seed...\n");
  console.log("Environment loaded:");
  console.log(`  DATABASE_URL: ${process.env.DATABASE_URL ? '✓' : '✗'}`);
  console.log(`  ADMIN Email configured: ${process.env.MAVUNO_SUPER_ADMIN_EMAIL ? '✓' : '✗'}`);
  console.log(`  BOSS Email configured:  ${process.env.MAVUNO_BOSS_EMAIL ? '✓' : '✗'}\n`);

  try {
    const result = await seedDatabase();
    
    console.log("✅ Database seeded successfully!\n");
    console.log("📝 Test Credentials Created:\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n👤 ADMIN Account:");
    console.log("   Credentials: use the configured Render environment variables");
    console.log(`   Role:     admin`);
    console.log(`   Path:     /office\n`);

    console.log("👔 BOSS Account:");
    console.log("   Credentials: use the configured Render environment variables");
    console.log(`   Role:     boss`);
    console.log(`   Path:     /boss\n`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("📊 Database Contents:");
    if (result && typeof result === 'object') {
      Object.entries(result).forEach(([key, count]) => {
        console.log(`   ✓ ${key}: ${count} records`);
      });
    }

    console.log("\n✨ MavunoOne is ready to use!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error instanceof Error ? error.message : String(error));
    console.error(error);
    process.exit(1);
  }
}

main();
