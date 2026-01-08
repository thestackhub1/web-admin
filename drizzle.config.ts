import { config } from "dotenv";
import type { Config } from "drizzle-kit";

// Load .env file
config({ path: ".env" });

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Use direct connection for migrations (bypasses pooler)
    url: process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL!,
  },
} satisfies Config;
