/**
 * Database Service - Turso/libSQL
 *
 * Encapsulates all database operations for Turso (libSQL/SQLite).
 * Handles connection management, transactions, and query execution.
 *
 * Migrated from PostgreSQL/Supabase.
 * - Uses @libsql/client instead of postgres-js
 * - RLS is handled at application layer (not database)
 * - Transactions use SQLite semantics
 *
 * @module lib/services/dbService
 *
 * @example
 * ```typescript
 * const db = await dbService.getDb();
 * const users = await db.select().from(profiles);
 * ```
 */

import { drizzle } from "drizzle-orm/libsql";
import { createClient, type Client } from "@libsql/client";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "@/db/schema.turso";

/**
 * Database Configuration
 */
export interface DatabaseConfig {
  url: string;
  authToken?: string;
  isProduction: boolean;
  isLocal: boolean;
}

/**
 * User Context for application-level security
 * (Replaces PostgreSQL RLS - kept for compatibility)
 */
export interface RLSContext {
  userId: string;
  role?: string;
  email?: string;
  schoolId?: string;
}

/**
 * Database Service Options
 */
export interface GetDbOptions {
  /**
   * User context for application-level security
   * Kept for API compatibility, but RLS is now handled at application layer
   */
  rlsContext?: RLSContext;
  /**
   * Direct connection flag (ignored for Turso - kept for compatibility)
   */
  direct?: boolean;
}

/**
 * Transaction callback type
 * Uses 'any' for the transaction type since SQLiteTransaction has a different signature than LibSQLDatabase
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TransactionCallback<T> = (tx: any) => Promise<T>;

/**
 * Database Service
 *
 * Singleton service managing Turso database connection.
 * Provides transaction support and connection management.
 */
export class DbService {
  private static instance: DbService;
  private config: DatabaseConfig | null = null;
  private client: Client | null = null;
  private _db: LibSQLDatabase<typeof schema> | null = null;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): DbService {
    if (!DbService.instance) {
      DbService.instance = new DbService();
    }
    return DbService.instance;
  }

  /**
   * Load database configuration from environment
   */
  private loadConfig(): DatabaseConfig {
    if (this.config) return this.config;

    const url = process.env.TURSO_DATABASE_URL;
    if (!url) {
      throw new Error(
        "TURSO_DATABASE_URL is required. Please set TURSO_DATABASE_URL in your environment variables."
      );
    }

    const authToken = process.env.TURSO_AUTH_TOKEN;
    const isProduction = process.env.NODE_ENV === "production";
    const isLocal = url.startsWith("file:");

    // Auth token is required for remote Turso databases
    if (!isLocal && !authToken) {
      throw new Error(
        "TURSO_AUTH_TOKEN is required for remote Turso databases."
      );
    }

    this.config = {
      url,
      authToken,
      isProduction,
      isLocal,
    };

    return this.config;
  }

  /**
   * Create libSQL client
   */
  private createClient(): Client {
    if (this.client) return this.client;

    const config = this.loadConfig();

    this.client = createClient({
      url: config.url,
      authToken: config.authToken,
    });

    return this.client;
  }

  /**
   * Get Drizzle database instance
   *
   * @param options - Database options (rlsContext for security - handled at app layer)
   * @returns Drizzle database instance
   */
  public async getDb(
    options: GetDbOptions = {}
  ): Promise<LibSQLDatabase<typeof schema>> {
    // RLS context is ignored - handled at application layer
    // But we keep the parameter for API compatibility
    const { rlsContext: _rlsContext, direct: _direct } = options;

    if (!this._db) {
      const client = this.createClient();
      this._db = drizzle(client, { schema });
    }

    return this._db;
  }

  /**
   * Execute a query
   *
   * @param queryFn - Query function that receives db instance
   * @param options - Database options
   * @returns Query result
   */
  public async executeQuery<T>(
    queryFn: (db: LibSQLDatabase<typeof schema>) => Promise<T>,
    options: GetDbOptions = {}
  ): Promise<T> {
    const db = await this.getDb(options);
    return queryFn(db);
  }

  /**
   * Execute a transaction
   *
   * @param callback - Transaction callback
   * @param _options - Database options (unused for Turso)
   * @returns Transaction result
   */
  public async withTransaction<T>(
    callback: TransactionCallback<T>,
    _options: GetDbOptions = {}
  ): Promise<T> {
    const db = await this.getDb();
    return db.transaction(async (tx) => {
      return callback(tx);
    });
  }

  /**
   * Get raw libSQL client
   * Use with caution - prefer getDb() for most operations
   */
  public getClient(): Client {
    return this.createClient();
  }

  /**
   * Get database configuration
   */
  public getConfig(): DatabaseConfig {
    return this.loadConfig();
  }

  /**
   * Test database connection
   */
  public async testConnection(): Promise<{
    success: boolean;
    version?: string;
    database?: string;
    error?: string;
  }> {
    try {
      const client = this.createClient();
      const result = await client.execute("SELECT sqlite_version() as version");

      if (result && result.rows && result.rows.length > 0) {
        return {
          success: true,
          version: result.rows[0].version as string,
          database: "Turso/libSQL",
        };
      }

      return {
        success: false,
        error: "No data returned from database",
      };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Close database connection
   * Useful for cleanup in scripts or tests
   */
  public async close(): Promise<void> {
    if (this.client) {
      this.client.close();
      this.client = null;
      this._db = null;
    }
  }
}

/**
 * Get singleton instance
 */
export const dbService = DbService.getInstance();

/**
 * Database getter with deferred initialization
 * Prevents TURSO_DATABASE_URL errors during Next.js build phase
 */
export const getDb = (
  options: GetDbOptions = {}
): Promise<LibSQLDatabase<typeof schema>> => {
  return dbService.getDb(options);
};

// Export service instance as default
export default dbService;

