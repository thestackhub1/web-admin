/**
 * Database Connection for Seeds - Turso/SQLite
 *
 * Provides database connection for seed scripts.
 * Uses libSQL client for Turso connectivity.
 *
 * @module db/seeds/db
 */

import "dotenv/config";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "../schema.turso";

// Load .env file
config({ path: ".env" });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  throw new Error(
    "TURSO_DATABASE_URL is not set. Please set it in your .env file.\n" +
      "For local development: TURSO_DATABASE_URL=file:local.db"
  );
}

// Create libSQL client
export const client = createClient({
  url,
  authToken: url.startsWith("file:") ? undefined : authToken,
});

// Create Drizzle instance
export const db = drizzle(client, { schema });

// Re-export schema for convenience
export { schema };

/**
 * Close database connection
 * Call this after seed scripts complete
 */
export function closeConnection(): void {
  client.close();
}
