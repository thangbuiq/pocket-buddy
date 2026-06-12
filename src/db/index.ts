import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@/db/schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  // Avoid hard crashes during static builds without env vars.
  console.warn("DATABASE_URL is not set. Database operations will fail until configured.");
}

const sql = neon(databaseUrl || "postgresql://localhost/pocket_buddy");

export const db = drizzle(sql, { schema });
