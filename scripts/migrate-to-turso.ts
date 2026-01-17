/**
 * Data Migration Script - PostgreSQL to Turso
 *
 * This script transforms data exported from PostgreSQL (Supabase)
 * into a format compatible with SQLite/Turso.
 *
 * Transformations performed:
 * - Arrays → JSON strings
 * - Timestamps → ISO 8601 strings
 * - Booleans → 0/1 integers (handled by Drizzle)
 * - UUIDs → remain as strings
 *
 * Usage:
 *   npx tsx scripts/migrate-to-turso.ts
 *
 * Prerequisites:
 *   1. Export data from Supabase using pg_dump or CSV export
 *   2. Place exports in ./exports/ directory
 *   3. Run this script to transform and import
 *
 * @module scripts/migrate-to-turso
 */

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { config } from "dotenv";
import * as schema from "../src/db/schema.turso";
import { generateId, nowISO } from "../src/db/utils";

// Load environment variables
config({ path: ".env" });

// ============================================
// Configuration
// ============================================

const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_URL) {
  console.error("❌ TURSO_DATABASE_URL is required");
  process.exit(1);
}

// ============================================
// Database Connection
// ============================================

const client = createClient({
  url: TURSO_URL,
  authToken: TURSO_URL.startsWith("file:") ? undefined : TURSO_TOKEN,
});

// Database instance for migration operations
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const db = drizzle(client, { schema });

// ============================================
// Transformation Utilities
// ============================================

/**
 * Transform PostgreSQL array to JSON string
 */
export function transformArray<T>(value: T[] | null | undefined): string {
  if (!value || !Array.isArray(value)) return "[]";
  return JSON.stringify(value);
}

/**
 * Transform PostgreSQL JSONB to JSON string
 */
export function transformJson(value: unknown): string {
  if (value === null || value === undefined) return "{}";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

/**
 * Transform PostgreSQL timestamp to ISO string
 */
export function transformTimestamp(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") {
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date.toISOString();
  }
  return null;
}

/**
 * Transform PostgreSQL date to YYYY-MM-DD string
 */
export function transformDate(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().split("T")[0];
  if (typeof value === "string") {
    // Already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date.toISOString().split("T")[0];
  }
  return null;
}

/**
 * Transform PostgreSQL time to HH:MM:SS string
 */
export function transformTime(value: string | null | undefined): string | null {
  if (!value) return null;
  // Already in correct format
  if (/^\d{2}:\d{2}(:\d{2})?$/.test(value)) return value;
  return null;
}

/**
 * Ensure value has an ID (generate if missing)
 */
function ensureId(value: string | null | undefined): string {
  return value || generateId();
}

// ============================================
// Data Transformation Functions
// ============================================

interface RawProfile {
  id?: string;
  email?: string;
  phone?: string;
  name?: string;
  avatar_url?: string;
  school_id?: string;
  class_level?: string;
  role?: string;
  permissions?: unknown;
  preferred_language?: string;
  is_active?: boolean;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export function transformProfile(raw: RawProfile): typeof schema.profiles.$inferInsert {
  return {
    id: ensureId(raw.id),
    email: raw.email || null,
    phone: raw.phone || null,
    name: raw.name || null,
    avatarUrl: raw.avatar_url || null,
    schoolId: raw.school_id || null,
    classLevel: raw.class_level || null,
    role: raw.role || "student",
    permissions: raw.permissions as Record<string, unknown> || {},
    preferredLanguage: raw.preferred_language || "en",
    isActive: raw.is_active ?? true,
    createdAt: transformTimestamp(raw.created_at) || nowISO(),
    updatedAt: transformTimestamp(raw.updated_at) || nowISO(),
  };
}

interface RawSchool {
  id?: string;
  name: string;
  name_search: string;
  location_city?: string;
  location_state?: string;
  location_country?: string;
  address?: string;
  type?: string;
  level?: string;
  founded_year?: string;
  is_verified?: boolean;
  is_user_added?: boolean;
  created_by?: string;
  student_count?: number;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export function transformSchool(raw: RawSchool): typeof schema.schools.$inferInsert {
  return {
    id: ensureId(raw.id),
    name: raw.name,
    nameSearch: raw.name_search,
    locationCity: raw.location_city || null,
    locationState: raw.location_state || null,
    locationCountry: raw.location_country || "India",
    address: raw.address || null,
    type: raw.type || null,
    level: raw.level || null,
    foundedYear: raw.founded_year || null,
    isVerified: raw.is_verified ?? false,
    isUserAdded: raw.is_user_added ?? false,
    createdBy: raw.created_by || null,
    studentCount: raw.student_count || 0,
    createdAt: transformTimestamp(raw.created_at) || nowISO(),
    updatedAt: transformTimestamp(raw.updated_at) || nowISO(),
  };
}

interface RawSubject {
  id?: string;
  parent_subject_id?: string;
  name_en: string;
  name_mr: string;
  slug: string;
  description_en?: string;
  description_mr?: string;
  icon?: string;
  order_index?: number;
  is_active?: boolean;
  is_category?: boolean;
  is_paper?: boolean;
  paper_number?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export function transformSubject(raw: RawSubject): typeof schema.subjects.$inferInsert {
  return {
    id: ensureId(raw.id),
    parentSubjectId: raw.parent_subject_id || null,
    nameEn: raw.name_en,
    nameMr: raw.name_mr,
    slug: raw.slug,
    descriptionEn: raw.description_en || null,
    descriptionMr: raw.description_mr || null,
    icon: raw.icon || null,
    orderIndex: raw.order_index || 0,
    isActive: raw.is_active ?? true,
    isCategory: raw.is_category ?? false,
    isPaper: raw.is_paper ?? false,
    paperNumber: raw.paper_number || null,
    createdAt: transformTimestamp(raw.created_at) || nowISO(),
    updatedAt: transformTimestamp(raw.updated_at) || nowISO(),
  };
}

interface RawQuestion {
  id?: string;
  question_text: string;
  question_language?: string;
  question_type: string;
  difficulty?: string;
  answer_data: unknown;
  explanation?: string;
  tags?: string[];
  class_level: string;
  marks?: number;
  chapter_id?: string;
  is_active?: boolean;
  created_by?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export function transformQuestion(
  raw: RawQuestion,
  defaultLanguage: string = "en"
): typeof schema.questionsScholarship.$inferInsert {
  return {
    id: ensureId(raw.id),
    questionText: raw.question_text,
    questionLanguage: raw.question_language || defaultLanguage,
    questionType: raw.question_type,
    difficulty: raw.difficulty || "medium",
    answerData: raw.answer_data as Record<string, unknown>,
    explanation: raw.explanation || null,
    tags: raw.tags || [],
    classLevel: raw.class_level,
    marks: raw.marks || 1,
    chapterId: raw.chapter_id || null,
    isActive: raw.is_active ?? true,
    createdBy: raw.created_by || null,
    createdAt: transformTimestamp(raw.created_at) || nowISO(),
    updatedAt: transformTimestamp(raw.updated_at) || nowISO(),
  };
}

// ============================================
// Migration Runner
// ============================================

async function runMigration(): Promise<void> {
  console.log("🚀 Starting Turso Migration...\n");

  try {
    // Test connection
    console.log("📡 Testing database connection...");
    const result = await client.execute("SELECT sqlite_version() as version");
    console.log(`✅ Connected to SQLite ${result.rows[0]?.version}\n`);

    // You would load your exported data here
    // For example, from JSON files or CSV exports
    
    console.log("📦 Migration script ready.");
    console.log("\nTo migrate data:");
    console.log("1. Export data from Supabase (pg_dump or CSV)");
    console.log("2. Place exports in ./exports/ directory");
    console.log("3. Uncomment and modify the migration code below");
    console.log("\nExample migration code:");
    console.log("  const profilesData = JSON.parse(readFileSync('./exports/profiles.json', 'utf-8'));");
    console.log("  const transformed = profilesData.map(transformProfile);");
    console.log("  await db.insert(schema.profiles).values(transformed);");

    // Example migration (uncomment and modify as needed):
    /*
    import { readFileSync } from 'fs';
    
    // Migrate profiles
    console.log("📥 Migrating profiles...");
    const profilesRaw = JSON.parse(readFileSync('./exports/profiles.json', 'utf-8'));
    const profilesData = profilesRaw.map(transformProfile);
    for (const profile of profilesData) {
      await db.insert(schema.profiles).values(profile).onConflictDoNothing();
    }
    console.log(`✅ Migrated ${profilesData.length} profiles`);

    // Migrate schools
    console.log("📥 Migrating schools...");
    const schoolsRaw = JSON.parse(readFileSync('./exports/schools.json', 'utf-8'));
    const schoolsData = schoolsRaw.map(transformSchool);
    for (const school of schoolsData) {
      await db.insert(schema.schools).values(school).onConflictDoNothing();
    }
    console.log(`✅ Migrated ${schoolsData.length} schools`);

    // Continue for other tables...
    */

  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    client.close();
  }
}

// Run migration
runMigration()
  .then(() => {
    console.log("\n✅ Migration complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  });
