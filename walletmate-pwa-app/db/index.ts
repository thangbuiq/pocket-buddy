import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import { neon } from "@neondatabase/serverless";
import postgres from "postgres";
import * as schema from "@/db/schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  // Avoid hard crashes during static builds without env vars.
  console.warn(
    "DATABASE_URL is not set. Database operations will fail until configured.",
  );
}

const connectionString =
  databaseUrl || "postgresql://walletmate:walletmate@localhost:5432/walletmate";

function shouldUsePostgresDriver(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return ["localhost", "127.0.0.1", "postgres"].includes(hostname);
  } catch {
    return false;
  }
}

export const db = shouldUsePostgresDriver(connectionString)
  ? drizzlePostgres(postgres(connectionString, { max: 1 }), { schema })
  : drizzleNeon(neon(connectionString), { schema });
