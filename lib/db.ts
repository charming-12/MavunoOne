import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/drizzle/schema";

// Keep module evaluation build-safe. Runtime database routes still require a real
// DATABASE_URL configured in Render; the local placeholder is never a valid app credential.
const databaseUrl = process.env.DATABASE_URL ?? "postgres://build_placeholder:build_placeholder@127.0.0.1:5432/build_placeholder";

const client = postgres(databaseUrl, {
  ssl:
    process.env.NODE_ENV === "production" || process.env.DATABASE_URL?.includes("neon.tech")
      ? { rejectUnauthorized: false }
      : false,
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });
