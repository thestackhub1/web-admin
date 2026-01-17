/**
 * Drizzle Kit Configuration - Turso/SQLite
 *
 * Configuration for Drizzle Kit CLI tools with Turso (libSQL/SQLite).
 * Used for schema generation, migrations, and database studio.
 *
 * @module drizzle.config
 */

import { config } from "dotenv";
import type { Config } from "drizzle-kit";

// Load .env file
config({ path: ".env" });

/**
 * Get database credentials based on environment
 */
function getDatabaseCredentials(): { url: string; authToken?: string } {
  const url = process.env.TURSO_DATABASE_URL;

  if (!url) {
    throw new Error(
      "TURSO_DATABASE_URL is required. Set it in your .env file.\n" +
        "For local development: TURSO_DATABASE_URL=file:local.db\n" +
        "For Turso cloud: TURSO_DATABASE_URL=libsql://your-db.turso.io"
    );
  }

  // Local file database doesn't need auth token
  if (url.startsWith("file:")) {
    return { url };
  }

  // Remote Turso database requires auth token
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!authToken) {
    throw new Error(
      "TURSO_AUTH_TOKEN is required for remote Turso databases."
    );
  }

  return { url, authToken };
}

const credentials = getDatabaseCredentials();

export default {
  schema: "./src/db/schema.turso.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: credentials,
} satisfies Config;
