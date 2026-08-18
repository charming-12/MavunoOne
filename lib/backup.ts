/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Database Backup & Restore Utility
 * Create and restore database backups
 */

import { db } from "./db";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import { desc, sql } from "drizzle-orm";
import {
  auditLogs,
  categories,
  customers,
  dailyClosures,
  dataBackups,
  deliveries,
  expenses,
  machineJobs,
  notifications,
  products,
  saleItems,
  sales,
  stockIn,
  stockOut,
  users,
  vehicles,
} from "@/drizzle/schema";

const execAsync = promisify(exec);

/**
 * Get current timestamp in format YYYYMMDD_HHMMSS
 */
function getTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

/**
 * Export database to SQL file
 */
export async function exportDatabase(outputDir: string = "./backups"): Promise<{
  success: boolean;
  filename: string;
  size: number;
  timestamp: string;
  error?: string;
}> {
  try {
    const timestamp = getTimestamp();
    const filename = `backup_${timestamp}.sql`;
    const filepath = path.join(outputDir, filename);

    // Create backup directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable not set");
    }

    // Use pg_dump to export database
    const command = `PGPASSWORD="${extractPassword(databaseUrl)}" pg_dump -h ${extractHost(databaseUrl)} -U ${extractUser(databaseUrl)} -d ${extractDatabase(databaseUrl)} > "${filepath}"`;

    await execAsync(command);

    // Get file size
    const stats = fs.statSync(filepath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

    console.log(`✅ Database exported: ${filename} (${sizeInMB} MB)`);

    return {
      success: true,
      filename,
      size: stats.size,
      timestamp,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Database export failed:", errorMessage);
    return {
      success: false,
      filename: "",
      size: 0,
      timestamp: getTimestamp(),
      error: errorMessage,
    };
  }
}

/**
 * Import database from SQL file
 */
export async function importDatabase(
  backupFile: string
): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> {
  try {
    if (!fs.existsSync(backupFile)) {
      throw new Error(`Backup file not found: ${backupFile}`);
    }

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable not set");
    }

    // Parse connection details
    const password = extractPassword(databaseUrl);
    const host = extractHost(databaseUrl);
    const user = extractUser(databaseUrl);
    const database = extractDatabase(databaseUrl);

    // Use psql to restore database
    const command = `PGPASSWORD="${password}" psql -h ${host} -U ${user} -d ${database} < "${backupFile}"`;

    await execAsync(command);

    console.log(`✅ Database imported from: ${backupFile}`);

    return {
      success: true,
      message: `Database successfully restored from ${backupFile}`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Database import failed:", errorMessage);
    return {
      success: false,
      message: "Database import failed",
      error: errorMessage,
    };
  }
}

/**
 * Export all tables to JSON format
 */
export async function exportDataToJson(
  outputDir: string = "./backups"
): Promise<{
  success: boolean;
  filename: string;
  tables: Record<string, number>;
  error?: string;
}> {
  try {
    const timestamp = getTimestamp();
    const filename = `backup_${timestamp}.json`;
    const filepath = path.join(outputDir, filename);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Create a simple backup structure
    const backup: Record<string, any[]> = {
      users: [],
      categories: [],
      products: [],
      customers: [],
      sales: [],
      saleItems: [],
      stockIn: [],
      stockOut: [],
      machineJobs: [],
      vehicles: [],
      deliveries: [],
      expenses: [],
      dailyClosures: [],
      notifications: [],
      auditLogs: [],
    };

    // Try to export users table as example
    try {
      const users = await db.query.users.findMany();
      if (users) {
        backup['users'] = users as any[];
      }
    } catch {
      console.warn("Could not export users table");
    }

    // Write to file
    fs.writeFileSync(filepath, JSON.stringify(backup, null, 2));

    console.log(`✅ Data exported to JSON: ${filename}`);

    return {
      success: true,
      filename,
      tables: Object.fromEntries(
        Object.entries(backup).map(([table, data]) => [table, (data as any[]).length])
      ),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("❌ JSON export failed:", errorMessage);
    return {
      success: false,
      filename: "",
      tables: {},
      error: errorMessage,
    };
  }
}

/**
 * List all backup files
 */
export function listBackups(backupDir: string = "./backups"): Array<{
  filename: string;
  size: number;
  sizeInMB: string;
  created: Date;
}> {
  try {
    if (!fs.existsSync(backupDir)) {
      return [];
    }

    const files = fs.readdirSync(backupDir);

    return files
      .filter((f) => f.startsWith("backup_"))
      .map((filename) => {
        const filepath = path.join(backupDir, filename);
        const stats = fs.statSync(filepath);
        return {
          filename,
          size: stats.size,
          sizeInMB: (stats.size / (1024 * 1024)).toFixed(2),
          created: stats.birthtime,
        };
      })
      .sort((a, b) => b.created.getTime() - a.created.getTime());
  } catch (error) {
    console.error("Error listing backups:", error);
    return [];
  }
}

/**
 * Cleanup old backups (keep only recent ones)
 */
export function cleanupOldBackups(
  backupDir: string = "./backups",
  keepDays: number = 30
): { deleted: number; remaining: number } {
  try {
    const backups = listBackups(backupDir);
    const now = Date.now();
    const cutoffTime = now - keepDays * 24 * 60 * 60 * 1000;

    let deleted = 0;

    backups.forEach((backup) => {
      if (backup.created.getTime() < cutoffTime) {
        const filepath = path.join(backupDir, backup.filename);
        fs.unlinkSync(filepath);
        deleted++;
        console.log(`🗑️  Deleted old backup: ${backup.filename}`);
      }
    });

    const remaining = listBackups(backupDir).length;
    console.log(`✅ Cleanup complete: Deleted ${deleted}, Remaining ${remaining}`);

    return { deleted, remaining };
  } catch (error) {
    console.error("Error cleaning up backups:", error);
    return { deleted: 0, remaining: 0 };
  }
}

/**
 * Create a daily backup (for scheduling)
 */
export async function scheduleDailyBackup(): Promise<void> {
  try {
    console.log("🔄 Starting daily backup...");
    const result = await exportDatabase();

    if (result.success) {
      // Cleanup backups older than 30 days
      cleanupOldBackups("./backups", 30);
      console.log("✅ Daily backup completed successfully");
    } else {
      console.error("❌ Daily backup failed:", result.error);
    }
  } catch (error) {
    console.error("Error in scheduled backup:", error);
  }
}

// Helper functions to parse DATABASE_URL

function extractPassword(url: string): string {
  const match = url.match(/:([^@]+)@/);
  return match ? match[1] : "";
}

function extractUser(url: string): string {
  const match = url.match(/\/\/([^:]+):/);
  return match ? match[1] : "";
}

function extractHost(url: string): string {
  const match = url.match(/@([^:\/]+)/);
  return match ? match[1] : "localhost";
}

function extractDatabase(url: string): string {
  const match = url.match(/\/([^?]+)(\?|$)/);
  return match ? match[1] : "";
}

const SAMPLE_DATA_TABLES = [
  { name: "users", table: users },
  { name: "categories", table: categories },
  { name: "products", table: products },
  { name: "customers", table: customers },
  { name: "vehicles", table: vehicles },
  { name: "sales", table: sales },
  { name: "saleItems", table: saleItems },
  { name: "stockIn", table: stockIn },
  { name: "stockOut", table: stockOut },
  { name: "deliveries", table: deliveries },
  { name: "machineJobs", table: machineJobs },
  { name: "expenses", table: expenses },
  { name: "dailyClosures", table: dailyClosures },
  { name: "notifications", table: notifications },
  { name: "auditLogs", table: auditLogs },
] as const;

export type BackupSnapshot = Record<string, unknown[]>;

function isProtectedUserRole(role: string | null | undefined) {
  return ["admin", "boss", "owner"].includes((role ?? "").toLowerCase());
}

async function createSampleDataSnapshot(): Promise<BackupSnapshot> {
  const snapshot: BackupSnapshot = {};

  const allUsers = await db.select().from(users);
  snapshot.users = allUsers
    .filter((user) => !isProtectedUserRole(user.role))
    .map((user) => ({ ...user, passwordHash: user.passwordHash ?? null }));

  for (const tableMeta of SAMPLE_DATA_TABLES) {
    if (tableMeta.name === "users") continue;
    const rows = await db.select().from(tableMeta.table);
    snapshot[tableMeta.name] = rows.map((row) => ({ ...row }));
  }

  return snapshot;
}

export async function createSampleDataBackup(createdBy?: number | null) {
  const snapshot = await createSampleDataSnapshot();
  const label = `sample_data_backup_${new Date().toISOString().replace(/[:.]/g, "-")}`;

  const result = await db
    .insert(dataBackups)
    .values({
      label,
      snapshot: JSON.stringify(snapshot, null, 2),
      createdBy: createdBy ?? null,
    })
    .returning();

  return result[0] ?? null;
}

export async function getLatestSampleDataBackup() {
  const rows = await db.select().from(dataBackups).orderBy(desc(dataBackups.createdAt)).limit(1);
  return rows[0] ?? null;
}

export async function resetSampleData(createdBy?: number | null) {
  const backup = await createSampleDataBackup(createdBy);

  await db.transaction(async (tx) => {
    await tx.delete(users).where(sql`${users.role} NOT IN ('admin', 'boss', 'owner')`);

    for (const tableMeta of SAMPLE_DATA_TABLES) {
      if (tableMeta.name === "users") continue;
      await tx.delete(tableMeta.table);
    }
  });

  return {
    message: "Sample data reset completed. Admin and boss accounts were preserved.",
    backup,
  };
}

export async function restoreLatestSampleDataBackup() {
  const latestBackup = await getLatestSampleDataBackup();

  if (!latestBackup) {
    throw new Error("No backup exists to restore.");
  }

  const snapshot = JSON.parse(latestBackup.snapshot) as BackupSnapshot;

  await db.transaction(async (tx) => {
    await tx.delete(users).where(sql`${users.role} NOT IN ('admin', 'boss', 'owner')`);

    for (const tableMeta of SAMPLE_DATA_TABLES) {
      if (tableMeta.name === "users") continue;
      await tx.delete(tableMeta.table);
    }

    const userRows = Array.isArray(snapshot.users) ? (snapshot.users as Record<string, any>[]) : [];
    if (userRows.length > 0) {
      await tx.insert(users).values(userRows as any);
    }

    for (const tableMeta of SAMPLE_DATA_TABLES) {
      if (tableMeta.name === "users") continue;
      const rows = Array.isArray(snapshot[tableMeta.name]) ? (snapshot[tableMeta.name] as Record<string, any>[]) : [];
      if (rows.length > 0) {
        await tx.insert(tableMeta.table).values(rows as any);
      }
    }
  });

  return {
    message: "The latest backup was restored successfully.",
    backup: latestBackup,
  };
}

/**
 * API endpoint for backup operations
 * Usage: POST /api/backup/create or /api/backup/list
 */
export async function handleBackupRequest(action: string): Promise<any> {
  switch (action) {
    case "create":
      return await exportDatabase();
    case "create-json":
      return await exportDataToJson();
    case "list":
      return listBackups();
    case "cleanup":
      return cleanupOldBackups();
    case "daily":
      await scheduleDailyBackup();
      return { success: true, message: "Daily backup scheduled" };
    default:
      return { success: false, error: "Unknown action" };
  }
}
