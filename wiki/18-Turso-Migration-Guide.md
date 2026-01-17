# Turso Migration Guide

> **Migration from Supabase PostgreSQL to Turso (SQLite/libSQL)**
>
> Last Updated: January 2026

---

## Table of Contents

1. [Overview](#1-overview)
2. [Why Turso](#2-why-turso)
3. [Architecture Changes](#3-architecture-changes)
4. [Schema Conversion Reference](#4-schema-conversion-reference)
5. [Data Type Mappings](#5-data-type-mappings)
6. [Files Changed](#6-files-changed)
7. [Environment Configuration](#7-environment-configuration)
8. [Installation Guide](#8-installation-guide)
9. [Data Migration](#9-data-migration)
10. [Application Layer Changes](#10-application-layer-changes)
11. [Testing Checklist](#11-testing-checklist)
12. [Rollback Plan](#12-rollback-plan)
13. [Known Limitations](#13-known-limitations)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. Overview

This document describes the migration from **Supabase PostgreSQL** to **Turso** (SQLite/libSQL) while maintaining **Drizzle ORM** as the database abstraction layer.

### Migration Scope

| Component | Before | After |
|-----------|--------|-------|
| Database | Supabase PostgreSQL | Turso (libSQL) |
| ORM | Drizzle ORM (pg-core) | Drizzle ORM (sqlite-core) |
| Driver | `postgres` (postgres-js) | `@libsql/client` |
| Connection | PostgreSQL protocol | HTTP/WebSocket |
| RLS | PostgreSQL RLS | Application-level |

### Tables Migrated (14 total)

1. `profiles` - User accounts
2. `schools` - Educational institutions
3. `subjects` - Subject hierarchy (recursive)
4. `class_levels` - Grade levels
5. `subject_class_mappings` - Subject ↔ Class junction
6. `chapters` - Subject chapters
7. `questions_scholarship` - Scholarship exam questions
8. `questions_english` - English exam questions
9. `questions_information_technology` - IT exam questions
10. `exam_structures` - Exam blueprints
11. `scheduled_exams` - Scheduled exam instances
12. `exams` - Student exam attempts
13. `exam_answers` - Individual answers
14. `question_import_batches` - Batch imports

---

## 2. Why Turso

### Advantages

| Feature | Benefit |
|---------|---------|
| **Edge-native** | Low latency globally with edge replicas |
| **SQLite compatibility** | Simple, proven database engine |
| **Embedded replicas** | Local-first architecture possible |
| **Generous free tier** | 9GB storage, 500 databases |
| **Drizzle ORM support** | First-class integration |
| **Simple operations** | No complex PostgreSQL management |

### Trade-offs

| Trade-off | Mitigation |
|-----------|------------|
| No JSONB indexing | Denormalize critical data if needed |
| No native arrays | Store as JSON strings |
| No RLS | Implement in application layer |
| Limited transactions | Design for read-heavy workloads |

---

## 3. Architecture Changes

### Before (PostgreSQL)

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Application                   │
├─────────────────────────────────────────────────────────┤
│                    Drizzle ORM (pg-core)                │
├─────────────────────────────────────────────────────────┤
│                    postgres-js Driver                    │
├─────────────────────────────────────────────────────────┤
│                    Supabase PostgreSQL                   │
│                    (with RLS policies)                   │
└─────────────────────────────────────────────────────────┘
```

### After (Turso)

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Application                   │
├─────────────────────────────────────────────────────────┤
│              Application-Level Security                  │
├─────────────────────────────────────────────────────────┤
│                 Drizzle ORM (sqlite-core)               │
├─────────────────────────────────────────────────────────┤
│                   @libsql/client Driver                  │
├─────────────────────────────────────────────────────────┤
│                      Turso (libSQL)                      │
│                    (Edge-distributed)                    │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Schema Conversion Reference

### Import Statement Changes

```typescript
// ❌ Before (PostgreSQL)
import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  integer,
  jsonb,
  numeric,
  date,
  time,
} from "drizzle-orm/pg-core";

// ✅ After (SQLite/Turso)
import {
  sqliteTable,
  text,
  integer,
  real,
} from "drizzle-orm/sqlite-core";
```

### Table Definition Pattern

```typescript
// ❌ Before (PostgreSQL)
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  isActive: boolean("is_active").default(true),
  permissions: jsonb("permissions").default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ✅ After (SQLite/Turso)
export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey(), // UUID stored as text
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  permissions: text("permissions", { mode: "json" }).$type<Record<string, unknown>>().default({}),
  createdAt: text("created_at"), // ISO string, handled in app
});
```

---

## 5. Data Type Mappings

### Complete Type Mapping Table

| PostgreSQL (Before) | SQLite (After) | Notes |
|---------------------|----------------|-------|
| `uuid("x").primaryKey()` | `text("x").primaryKey()` | UUID stored as 36-char string |
| `uuid("x").defaultRandom()` | `text("x")` | Generate UUID in application |
| `text("x")` | `text("x")` | Identical |
| `integer("x")` | `integer("x")` | Identical |
| `boolean("x")` | `integer("x", { mode: "boolean" })` | SQLite uses 0/1 |
| `jsonb("x")` | `text("x", { mode: "json" })` | JSON string, auto-parsed |
| `text("x").array()` | `text("x", { mode: "json" })` | Store as JSON array |
| `numeric(p,s)` | `real("x")` | Floating point |
| `timestamp("x")` | `text("x")` | ISO 8601 string |
| `date("x")` | `text("x")` | YYYY-MM-DD string |
| `time("x")` | `text("x")` | HH:MM:SS string |

### UUID Generation

```typescript
// ✅ Helper function for UUID generation
import { randomUUID } from "crypto";

export function generateId(): string {
  return randomUUID();
}

// Usage in inserts
await db.insert(profiles).values({
  id: generateId(), // Required - no auto-generation
  email: "user@example.com",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
```

### Timestamp Handling

```typescript
// ✅ Helper functions for timestamps
export function nowISO(): string {
  return new Date().toISOString();
}

export function parseTimestamp(value: string | null): Date | null {
  return value ? new Date(value) : null;
}
```

### JSON/Array Handling

```typescript
// Arrays are stored as JSON strings
// Drizzle handles serialization/deserialization with { mode: "json" }

// Tags field example
tags: text("tags", { mode: "json" }).$type<string[]>().default([]),

// Querying arrays requires JSON functions
await db.select().from(questionsScholarship)
  .where(sql`json_extract(${questionsScholarship.tags}, '$') LIKE '%"math"%'`);
```

---

## 6. Files Changed

### New Files Created

| File | Description |
|------|-------------|
| `src/db/schema.turso.ts` | SQLite schema definitions (Turso-compatible) |
| `src/db/utils/id.ts` | UUID generation utilities |
| `src/db/utils/timestamps.ts` | Timestamp helper functions |
| `src/db/utils/index.ts` | Utilities barrel export |
| `src/lib/services/dbService.turso.ts` | Turso database service |
| `src/lib/auth/security.ts` | Application-level security (replaces RLS) |
| `src/db/seeds/db.turso.ts` | Turso seed database connection |
| `src/db/seeds/class-levels.turso.ts` | Example Turso-compatible seed |
| `drizzle.config.turso.ts` | Drizzle Kit config for Turso |
| `scripts/migrate-to-turso.ts` | Data migration script |
| `scripts/switch-db.sh` | Database configuration switcher |
| `.env.example` | Environment variables template |
| `wiki/18-Turso-Migration-Guide.md` | This documentation |

### Modified Files

| File | Change Type | Description |
|------|-------------|-------------|
| `src/db/index.ts` | Modified | Added utils export |
| `package.json` | Modified | Added Turso scripts and @libsql/client |

### Files to Switch (using switch-db.sh)

When switching to Turso, these files get replaced:

| Original (PostgreSQL) | Turso Version |
|-----------------------|---------------|
| `src/db/schema.ts` | ← `src/db/schema.turso.ts` |
| `src/lib/services/dbService.ts` | ← `src/lib/services/dbService.turso.ts` |
| `src/db/seeds/db.ts` | ← `src/db/seeds/db.turso.ts` |
| `drizzle.config.ts` | ← `drizzle.config.turso.ts` |

### Dependencies Changed

```json
{
  "dependencies": {
    // ✅ Added (keep existing for now, remove after full migration)
    "@libsql/client": "^0.6.0"
  },
  "scripts": {
    // ✅ New Turso-specific scripts
    "db:turso:generate": "drizzle-kit generate --config=drizzle.config.turso.ts",
    "db:turso:push": "drizzle-kit push --config=drizzle.config.turso.ts",
    "db:turso:studio": "drizzle-kit studio --config=drizzle.config.turso.ts",
    "db:turso:migrate": "npx tsx scripts/migrate-to-turso.ts",
    "db:switch:turso": "bash scripts/switch-db.sh turso",
    "db:switch:pg": "bash scripts/switch-db.sh pg",
    "db:switch:status": "bash scripts/switch-db.sh status"
  }
}
```

---

## 7. Environment Configuration

### Environment Variables

```bash
# ❌ Before (Supabase)
DATABASE_URL=postgresql://user:pass@db.supabase.co:5432/postgres
DATABASE_URL_DIRECT=postgresql://user:pass@db.supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# ✅ After (Turso)
TURSO_DATABASE_URL=libsql://your-database-name.turso.io
TURSO_AUTH_TOKEN=your-auth-token
```

### Example .env.local

```bash
# Turso Configuration
TURSO_DATABASE_URL=libsql://abhedya-admin.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...

# For local development (optional)
TURSO_DATABASE_URL=file:local.db
```

---

## 8. Installation Guide

### Step 1: Install Turso CLI

```bash
# macOS
brew install tursodatabase/tap/turso

# Linux/WSL
curl -sSfL https://get.tur.so/install.sh | bash
```

### Step 2: Authenticate

```bash
turso auth login
```

### Step 3: Create Database

```bash
# Create production database
turso db create abhedya-admin --group default

# Get connection URL
turso db show abhedya-admin --url

# Create auth token
turso db tokens create abhedya-admin
```

### Step 4: Install Node Dependencies

```bash
# Remove old PostgreSQL dependencies
pnpm remove postgres @supabase/ssr @supabase/supabase-js

# Install Turso client
pnpm add @libsql/client
```

### Step 5: Update Environment

Add the Turso credentials to your `.env.local`:

```bash
TURSO_DATABASE_URL=libsql://abhedya-admin.turso.io
TURSO_AUTH_TOKEN=your-token-here
```

### Step 6: Generate & Push Schema

```bash
# Generate migration files
pnpm db:generate

# Push schema to Turso
pnpm db:push
```

### Step 7: Seed Database

```bash
pnpm db:seed
```

---

## 9. Data Migration

### Export from Supabase

```bash
# Export each table as CSV
psql $SUPABASE_URL -c "\COPY profiles TO 'exports/profiles.csv' WITH CSV HEADER"
psql $SUPABASE_URL -c "\COPY schools TO 'exports/schools.csv' WITH CSV HEADER"
# ... repeat for all tables
```

### Transform Script

Create a transformation script for data format changes:

```typescript
// scripts/transform-data.ts
import { readFileSync, writeFileSync } from "fs";
import { parse, stringify } from "csv-parse/sync";

interface TransformConfig {
  tableName: string;
  transforms: Record<string, (value: any) => any>;
}

const configs: TransformConfig[] = [
  {
    tableName: "profiles",
    transforms: {
      permissions: (v) => JSON.stringify(v || {}),
      is_active: (v) => v === "true" || v === true ? 1 : 0,
      created_at: (v) => v, // Keep as ISO string
      updated_at: (v) => v,
    },
  },
  // Add configs for other tables...
];

// Transform and output
configs.forEach(({ tableName, transforms }) => {
  const input = readFileSync(`exports/${tableName}.csv`, "utf-8");
  const records = parse(input, { columns: true });
  
  const transformed = records.map((record: Record<string, unknown>) => {
    const result = { ...record };
    Object.entries(transforms).forEach(([key, fn]) => {
      if (key in result) {
        result[key] = fn(result[key]);
      }
    });
    return result;
  });
  
  const output = stringify(transformed, { header: true });
  writeFileSync(`exports/${tableName}_turso.csv`, output);
});
```

### Import to Turso

```bash
# Use Turso CLI for import
turso db shell abhedya-admin < scripts/import.sql

# Or use the Turso web console for CSV imports
```

---

## 10. Application Layer Changes

### Security (Replacing RLS)

Since Turso doesn't support Row-Level Security, implement checks in the application layer:

```typescript
// src/lib/auth/security.ts
import type { Profile } from "@/db/schema";

export class SecurityService {
  /**
   * Check if user can access a resource
   */
  static canAccess(user: Profile, resourceOwnerId: string): boolean {
    // Admin can access everything
    if (user.role === "admin" || user.role === "super_admin") {
      return true;
    }
    // Users can only access their own resources
    return user.id === resourceOwnerId;
  }

  /**
   * Check if user can access school data
   */
  static canAccessSchool(user: Profile, schoolId: string): boolean {
    if (user.role === "admin" || user.role === "super_admin") {
      return true;
    }
    return user.schoolId === schoolId;
  }

  /**
   * Filter query results based on user permissions
   */
  static filterByUser<T extends { userId?: string }>(
    items: T[],
    user: Profile
  ): T[] {
    if (user.role === "admin" || user.role === "super_admin") {
      return items;
    }
    return items.filter((item) => item.userId === user.id);
  }
}
```

### Service Updates

Update each service to handle UUID generation and timestamps:

```typescript
// Example: Updated profile creation
import { generateId, nowISO } from "@/db/utils";

export async function createProfile(data: NewProfile) {
  const db = await dbService.getDb();
  
  return db.insert(profiles).values({
    id: generateId(),
    ...data,
    createdAt: nowISO(),
    updatedAt: nowISO(),
  }).returning();
}
```

---

## 11. Testing Checklist

### Schema Tests

- [ ] All tables created successfully
- [ ] Foreign key constraints work
- [ ] Unique constraints work
- [ ] Default values applied correctly

### Data Tests

- [ ] UUID generation works
- [ ] JSON fields serialize/deserialize correctly
- [ ] Array fields (tags) work as JSON
- [ ] Timestamps stored and retrieved correctly
- [ ] Boolean fields work (0/1 conversion)

### Query Tests

- [ ] Basic CRUD operations work
- [ ] JOIN queries work
- [ ] Self-referential queries (subjects) work
- [ ] JSON field queries work
- [ ] Ordering and pagination work

### Application Tests

- [ ] User authentication flow works
- [ ] Dashboard loads correctly
- [ ] Question CRUD operations work
- [ ] Exam creation works
- [ ] Exam taking flow works
- [ ] Analytics queries work

### Performance Tests

- [ ] Query response times acceptable
- [ ] Concurrent user load handled
- [ ] Large dataset queries optimized

---

## 12. Rollback Plan

### If Migration Fails

1. **Revert Code Changes**
   ```bash
   git checkout main -- src/db/
   git checkout main -- drizzle.config.ts
   git checkout main -- package.json
   ```

2. **Reinstall Dependencies**
   ```bash
   pnpm install
   ```

3. **Restore Environment Variables**
   - Revert `.env.local` to Supabase configuration

4. **Verify Supabase Connection**
   ```bash
   pnpm db:studio
   ```

### Data Backup

Before migration, ensure Supabase data is backed up:

```bash
# Full database dump
pg_dump $SUPABASE_URL > backup_$(date +%Y%m%d).sql
```

---

## 13. Known Limitations

### SQLite vs PostgreSQL

| Feature | PostgreSQL | SQLite/Turso | Workaround |
|---------|------------|--------------|------------|
| JSONB Indexing | ✅ GIN indexes | ❌ Not available | Denormalize or use computed columns |
| Array Type | ✅ Native | ❌ Use JSON | Store as JSON array |
| Full-Text Search | ✅ tsvector | ⚠️ Limited FTS5 | Consider external search service |
| Concurrent Writes | ✅ Excellent | ⚠️ Limited | Design for read-heavy |
| Stored Procedures | ✅ PL/pgSQL | ❌ Not available | Move logic to application |
| Triggers | ✅ Supported | ❌ Not available | Use application hooks |

### Drizzle ORM Differences

| Feature | pg-core | sqlite-core |
|---------|---------|-------------|
| `defaultRandom()` for UUID | ✅ Works | ❌ Must provide |
| `defaultNow()` | ✅ Works | ❌ Must provide |
| Array columns | ✅ Native | ❌ Use JSON mode |
| JSONB operators | ✅ Full support | ⚠️ json_extract() |

---

## 14. Troubleshooting

### Common Errors

#### "Cannot read property 'id' of undefined"

**Cause**: UUID not provided on insert.

**Solution**: Always provide ID when inserting:
```typescript
await db.insert(table).values({
  id: generateId(), // Required!
  // ...other fields
});
```

#### "SQLITE_CONSTRAINT: FOREIGN KEY constraint failed"

**Cause**: Inserting with non-existent foreign key.

**Solution**: Ensure related records exist first, or handle cascade properly.

#### "JSON parse error"

**Cause**: Invalid JSON in text field with `{ mode: "json" }`.

**Solution**: Validate JSON before insert:
```typescript
const safeJson = JSON.parse(JSON.stringify(data));
```

#### "Connection refused"

**Cause**: Invalid Turso URL or token.

**Solution**: 
```bash
# Verify URL
turso db show your-database --url

# Create new token
turso db tokens create your-database
```

### Debug Mode

Enable verbose logging:

```typescript
// In dbService.ts
const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
  // Enable for debugging
  // intMode: "number",
});
```

### Local Development

For local development without Turso cloud:

```bash
# Use local SQLite file
TURSO_DATABASE_URL=file:local.db
# No auth token needed for local file
```

---

## Appendix A: Complete Schema Reference

See [src/db/schema.ts](../src/db/schema.ts) for the complete SQLite schema.

## Appendix B: Migration Scripts

See [scripts/](../scripts/) for data migration utilities.

## Appendix C: Related Documentation

- [Turso Documentation](https://docs.turso.tech/)
- [Drizzle ORM SQLite](https://orm.drizzle.team/docs/get-started-sqlite)
- [libSQL Client](https://github.com/tursodatabase/libsql-client-ts)

---

> **Document Version**: 1.0.0
> **Author**: GitHub Copilot
> **Migration Date**: January 2026
