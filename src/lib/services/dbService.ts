/**
 * Database Service
 * 
 * Encapsulates all database operations following clean architecture principles.
 * Handles connection management, RLS impersonation, transactions, and query execution.
 * 
 * Usage:
 *   const dbService = DbService.getInstance();
 *   const db = await dbService.getDb({ userId: 'user-id', role: 'admin' }); // With RLS
 *   const db = await dbService.getDb(); // Without RLS (service role)
 */

import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import postgres, { type Sql } from "postgres";
import * as schema from "@/db/schema";

/**
 * Database Configuration
 */
export interface DatabaseConfig {
  url: string;
  isProduction: boolean;
  isSupabase: boolean;
}

/**
 * RLS Context for authenticated users
 */
export interface RLSContext {
  userId: string;
  role?: string;
  email?: string;
}

/**
 * Database Service Options
 */
export interface GetDbOptions {
  /**
   * RLS context for row-level security impersonation
   * When provided, sets Supabase JWT claims via set_config
   */
  rlsContext?: RLSContext;
  /**
   * Use direct connection (bypasses pooler)
   * Useful for migrations and seeds
   */
  direct?: boolean;
}

/**
 * Transaction callback type
 */
export type TransactionCallback<T> = (tx: PostgresJsDatabase<typeof schema>) => Promise<T>;

/**
 * Database Service
 * 
 * Singleton service managing all database connections and operations.
 * Provides RLS impersonation, transaction support, and connection pooling.
 */
export class DbService {
  private static instance: DbService;
  private config: DatabaseConfig | null = null;
  private client: Sql | null = null;
  private directClient: Sql | null = null;
  private _db: PostgresJsDatabase<typeof schema> | null = null;
  private _directDb: PostgresJsDatabase<typeof schema> | null = null;

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

    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "DATABASE_URL is required. Please set DATABASE_URL in your environment variables."
      );
    }

    const isProduction = process.env.NODE_ENV === "production";
    const isSupabase = url.includes("supabase.co") || url.includes("supabase.com");

    this.config = {
      url,
      isProduction,
      isSupabase,
    };

    return this.config;
  }

  /**
   * Create PostgreSQL client (pooled connection)
   */
  private createClient(): Sql {
    if (this.client) return this.client;

    const config = this.loadConfig();
    const { url, isProduction, isSupabase } = config;

    const postgresConfig: postgres.Options<Record<string, never>> = {
      max: isProduction ? 20 : 10,
      idle_timeout: isProduction ? 30 : 20,
      connect_timeout: 30,
      // Disable prefetch as it is not supported for "Transaction" pool mode (Supabase requirement)
      prepare: false,
      ssl: isSupabase || isProduction ? "require" : false,
      ...(isProduction && {
        connection: {
          application_name: "abhedya-admin-portal",
        },
      }),
    };

    this.client = postgres(url, postgresConfig);
    return this.client;
  }

  /**
   * Create direct PostgreSQL client (bypasses pooler)
   * Used for migrations and seeds
   */
  private createDirectClient(): Sql {
    if (this.directClient) return this.directClient;

    // Use DIRECT connection URL if available, otherwise fallback to regular URL
    const url = process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL or DATABASE_URL_DIRECT is required.");
    }

    const config = this.loadConfig();

    const postgresConfig: postgres.Options<Record<string, never>> = {
      max: 1, // Single connection for migrations
      prepare: false,
      ssl: config.isSupabase || config.isProduction ? "require" : false,
    };

    this.directClient = postgres(url, postgresConfig);
    return this.directClient;
  }

  /**
   * Get Drizzle database instance with optional RLS context
   * 
   * @param options - Database options including RLS context
   * @returns Drizzle database instance
   */
  public async getDb(
    options: GetDbOptions = {}
  ): Promise<PostgresJsDatabase<typeof schema>> {
    const { rlsContext, direct = false } = options;

    // Use direct connection if requested
    if (direct) {
      if (!this._directDb) {
        const client = this.createDirectClient();
        this._directDb = drizzle(client, { schema });
      }

      // Apply RLS if context provided
      if (rlsContext) {
        await this.setRLSContext(this._directDb, rlsContext);
      }

      return this._directDb;
    }

    // Use pooled connection
    if (!this._db) {
      const client = this.createClient();
      this._db = drizzle(client, { schema });
    }

    // Apply RLS if context provided
    if (rlsContext) {
      await this.setRLSContext(this._db, rlsContext);
    }

    return this._db;
  }

  /**
   * Set RLS context using Supabase JWT claims via set_config
   * This enables Row Level Security impersonation for authenticated users
   * 
   * @param db - Drizzle database instance
   * @param context - RLS context with user information
   */
  private async setRLSContext(
    db: PostgresJsDatabase<typeof schema>,
    context: RLSContext
  ): Promise<void> {
    try {
      // Set JWT claims for RLS
      // Supabase RLS functions expect these claims in the JWT
      // Set JWT claims using set_config which is parameter-safe
      // This is preferred over SET LOCAL ... = $1 which can cause syntax errors with some drivers

      // Set user ID
      await db.execute(
        sql`SELECT set_config('request.jwt.claim.sub', ${context.userId}, true)`
      );

      if (context.role) {
        await db.execute(
          sql`SELECT set_config('request.jwt.claim.role', ${context.role}, true)`
        );
      }

      if (context.email) {
        await db.execute(
          sql`SELECT set_config('request.jwt.claim.email', ${context.email}, true)`
        );
      }

      // Alternative approach: Set custom config variables
      // Some RLS policies may use custom config variables
      await db.execute(
        sql`SELECT set_config('app.current_user_id', ${context.userId}, true)`
      );

      if (context.role) {
        await db.execute(
          sql`SELECT set_config('app.current_user_role', ${context.role}, true)`
        );
      }
    } catch (error) {
      console.error("[DbService] Failed to set RLS context:", error);
      // Don't throw - some databases may not support RLS or config
      // This is a best-effort attempt
    }
  }

  /**
   * Execute a query with optional RLS context
   * 
   * @param queryFn - Query function that receives db instance
   * @param options - Database options including RLS context
   * @returns Query result
   */
  public async executeQuery<T>(
    queryFn: (db: PostgresJsDatabase<typeof schema>) => Promise<T>,
    options: GetDbOptions = {}
  ): Promise<T> {
    const db = await this.getDb(options);
    return queryFn(db);
  }

  /**
   * Execute a transaction with optional RLS context
   * 
   * @param callback - Transaction callback
   * @param options - Database options including RLS context
   * @returns Transaction result
   */
  public async withTransaction<T>(
    callback: TransactionCallback<T>,
    options: GetDbOptions = {}
  ): Promise<T> {
    const client = options.direct ? this.createDirectClient() : this.createClient();

    if (!client) {
      throw new Error("Database client not initialized");
    }

    // Start transaction using postgres-js transaction API
    return await client.begin(async (sqlTransaction) => {
      const txDb = drizzle(sqlTransaction, { schema });

      // Apply RLS context to transaction if provided
      if (options.rlsContext) {
        await this.setRLSContext(txDb, options.rlsContext);
      }

      return await callback(txDb);
    }) as Promise<T>;
  }

  /**
   * Get raw PostgreSQL client
   * Use with caution - prefer getDb() for most operations
   */
  public getClient(direct = false): Sql {
    return direct ? this.createDirectClient() : this.createClient();
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
    user?: string;
    error?: string;
  }> {
    try {
      const db = await this.getDb();
      const result = await db.execute(
        sql`SELECT version() as version, current_database() as database, current_user as user`
      );

      if (result && result.length > 0) {
        return {
          success: true,
          version: result[0].version as string,
          database: result[0].database as string,
          user: result[0].user as string,
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
   * Close all database connections
   * Useful for cleanup in scripts or tests
   */
  public async close(): Promise<void> {
    const promises: Promise<void>[] = [];

    if (this.client) {
      promises.push(this.client.end());
      this.client = null;
      this._db = null;
    }

    if (this.directClient) {
      promises.push(this.directClient.end());
      this.directClient = null;
      this._directDb = null;
    }

    await Promise.all(promises);
  }
}

/**
 * Get singleton instance
 */
export const dbService = DbService.getInstance();

/**
 * Lazy database getter with Proxy for deferred initialization
 * Prevents DATABASE_URL errors during Next.js build phase
 */
export const getDb = (options: GetDbOptions = {}): Promise<PostgresJsDatabase<typeof schema>> => {
  return dbService.getDb(options);
};

// Removed deprecated db export - use getDb() or dbService.getDb() instead

// Export service instance as default
export default dbService;

