/**
 * Database Layer - Public API
 *
 * Exports database schema for type references and imports.
 * For database operations, use DbService from @/lib/services/dbService
 *
 * For Turso migration, use schema.turso.ts
 */

import * as schema from "./schema";

// Re-export schema for type references and imports
export { schema };

// Re-export utilities for database operations
export * from "./utils";
