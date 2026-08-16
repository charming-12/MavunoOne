import { db } from "@/lib/db";
import { users } from "@/drizzle/schema";

async function testConnection() {
  try {
    const allUsers = await db.select().from(users);
    console.log("✅ Connection successful!");
    console.log(`Found ${allUsers.length} users in database`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Connection failed:", error);
    process.exit(1);
  }
}

testConnection();
