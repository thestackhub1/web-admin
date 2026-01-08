/**
 * Users Service
 * 
 * Business logic for user management.
 * Uses DbService for all database operations.
 */

import { dbService, type RLSContext } from './dbService';
import { eq, and, or, ilike, asc, desc, inArray, sql } from 'drizzle-orm';
import { profiles, schools, classLevels } from '@/db/schema';

export interface UserListOptions {
  page?: number;
  pageSize?: number;
  role?: string;
  search?: string;
  isActive?: boolean;
  schoolId?: string;
}

export interface UserListResult {
  items: any[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export class UsersService {
  /**
   * Get all users with pagination and filtering
   */
  static async getAll(options: UserListOptions = {}, rlsContext?: RLSContext): Promise<UserListResult> {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const page = options.page || 1;
    const pageSize = options.pageSize || 20;
    const offset = (page - 1) * pageSize;

    // Build where conditions
    const conditions = [];

    if (options.role) {
      conditions.push(eq(profiles.role, options.role));
    }

    if (options.isActive !== undefined) {
      conditions.push(eq(profiles.isActive, options.isActive));
    }

    if (options.search) {
      conditions.push(
        or(
          ilike(profiles.name, `%${options.search}%`),
          ilike(profiles.email, `%${options.search}%`)
        )!
      );
    }

    if (options.schoolId) {
      conditions.push(eq(profiles.schoolId, options.schoolId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)`.as('count') })
      .from(profiles)
      .where(whereClause);

    const totalItems = Number(countResult[0]?.count || 0);

    // Get paginated results
    let query = db
      .select({
        id: profiles.id,
        email: profiles.email,
        name: profiles.name,
        role: profiles.role,
        avatarUrl: profiles.avatarUrl,
        isActive: profiles.isActive,
        schoolId: profiles.schoolId,
        classLevel: profiles.classLevel,
        createdAt: profiles.createdAt,
        updatedAt: profiles.updatedAt,
      })
      .from(profiles)
      .where(whereClause)
      .orderBy(desc(profiles.createdAt))
      .limit(pageSize)
      .offset(offset);

    const users = await query;

    // Fetch related schools and class levels if needed
    const schoolIds = users.filter(u => u.schoolId).map(u => u.schoolId!);
    const schoolsMap = new Map();

    if (schoolIds.length > 0) {
      const schoolData = await db
        .select()
        .from(schools)
        .where(inArray(schools.id, schoolIds));

      schoolData.forEach(school => {
        schoolsMap.set(school.id, school);
      });
    }

    // Transform to API format
    const items = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar_url: user.avatarUrl,
      is_active: user.isActive,
      school_id: user.schoolId,
      class_level: null, // Would need to resolve from classLevel text
      created_at: user.createdAt?.toISOString(),
      updated_at: user.updatedAt?.toISOString(),
      schools: user.schoolId && schoolsMap.has(user.schoolId) ? {
        id: schoolsMap.get(user.schoolId).id,
        name: schoolsMap.get(user.schoolId).name,
      } : undefined,
    }));

    return {
      items,
      totalItems,
      page,
      pageSize,
      totalPages: Math.ceil(totalItems / pageSize),
    };
  }

  /**
   * Get user by ID
   */
  static async getById(userId: string, rlsContext?: RLSContext) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const [user] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    return user || null;
  }

  /**
   * Get user by email
   */
  static async getByEmail(email: string, rlsContext?: RLSContext) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const [user] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.email, email))
      .limit(1);

    return user || null;
  }

  /**
   * Create a new user (Auth + Profile)
   */
  static async create(data: {
    email: string;
    password?: string;
    name: string;
    role: string;
    schoolId?: string;
    classLevel?: string;
    isActive?: boolean;
  }) {
    // 1. Create user in Supabase Auth
    const { getSupabaseAdmin } = await import('@/lib/api/supabase-admin');
    const supabase = getSupabaseAdmin();

    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password || undefined, // If not provided, user needs to set it (invite)
      email_confirm: true, // Auto-confirm for admin-created users
      user_metadata: {
        name: data.name,
      },
    });

    if (authError) {
      throw new Error(`Auth creation failed: ${authError.message}`);
    }

    if (!authUser.user) {
      throw new Error('Auth creation failed: No user returned');
    }

    // 2. Create/Update profile
    // Use upsert in case a trigger already created the profile
    const db = await dbService.getDb();

    const [profile] = await db
      .insert(profiles)
      .values({
        id: authUser.user.id,
        email: data.email,
        name: data.name,
        role: data.role,
        schoolId: data.schoolId,
        classLevel: data.classLevel,
        isActive: data.isActive ?? true,
        permissions: {}, // Default permissions
      })
      .onConflictDoUpdate({
        target: profiles.id,
        set: {
          name: data.name,
          role: data.role,
          schoolId: data.schoolId,
          classLevel: data.classLevel,
          isActive: data.isActive ?? true,
          updatedAt: new Date(),
        },
      })
      .returning();

    return profile;
  }

  /**
   * Update user profile
   */
  static async update(userId: string, data: {
    name?: string;
    role?: string;
    schoolId?: string | null;
    classLevel?: string | null;
    isActive?: boolean;
    permissions?: any;
    email?: string;
    password?: string;
  }, rlsContext?: RLSContext) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    // 1. Update Profile
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.schoolId !== undefined) updateData.schoolId = data.schoolId;
    if (data.classLevel !== undefined) updateData.classLevel = data.classLevel;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.permissions !== undefined) updateData.permissions = data.permissions;
    if (data.email !== undefined) updateData.email = data.email;

    const [updatedProfile] = await db
      .update(profiles)
      .set(updateData)
      .where(eq(profiles.id, userId))
      .returning();

    // 2. Update Auth (if email/password provided)
    if (data.email || data.password) {
      const { getSupabaseAdmin } = await import('@/lib/api/supabase-admin');
      const supabase = getSupabaseAdmin();

      const authUpdates: any = {};
      if (data.email) authUpdates.email = data.email;
      if (data.password) authUpdates.password = data.password;

      const { error: authError } = await supabase.auth.admin.updateUserById(userId, authUpdates);

      if (authError) {
        // Log warning but don't fail the profile update
        console.warn(`Auth update failed for user ${userId}:`, authError);
      }
    }

    return updatedProfile;
  }

  /**
   * Delete user (Soft delete by default)
   */
  static async delete(userId: string, hardDelete = false) {
    if (hardDelete) {
      // Hard delete from Auth (cascades to profile usually)
      const { getSupabaseAdmin } = await import('@/lib/api/supabase-admin');
      const supabase = getSupabaseAdmin();

      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;

      // Also delete from profiles manually just in case cascade is missing
      const db = await dbService.getDb();
      await db.delete(profiles).where(eq(profiles.id, userId));

      return true;
    } else {
      // Soft delete (deactivate)
      const db = await dbService.getDb();
      await db
        .update(profiles)
        .set({
          isActive: false,
          updatedAt: new Date()
        })
        .where(eq(profiles.id, userId));

      return true;
    }
  }
}

