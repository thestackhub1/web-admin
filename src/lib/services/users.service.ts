/**
 * Users Service
 * 
 * Business logic for user management.
 * Uses DbService for all database operations.
 */

import { dbService, type RLSContext } from './dbService';
import { eq, and, or, ilike, desc, inArray, sql } from 'drizzle-orm';
import { profiles, schools, classLevels } from '@/db/schema';
import { hashPassword } from '@/lib/auth/password';
import { generateId } from '@/db/utils/id';

export interface UserListOptions {
  page?: number;
  pageSize?: number;
  role?: string;
  search?: string;
  isActive?: boolean;
  schoolId?: string;
  classLevelId?: string;
  classLevelSlug?: string;
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

    // Handle classLevelId filter - need to resolve to slug
    if (options.classLevelId || options.classLevelSlug) {
      let classLevelSlug = options.classLevelSlug;
      
      if (options.classLevelId && !classLevelSlug) {
        // Fetch class level by ID to get the slug and name
        const [classLevel] = await db
          .select({ slug: classLevels.slug, nameEn: classLevels.nameEn })
          .from(classLevels)
          .where(eq(classLevels.id, options.classLevelId))
          .limit(1);
        
        if (classLevel) {
          // Match by slug or nameEn (some legacy data might use name)
          conditions.push(
            or(
              eq(profiles.classLevel, classLevel.slug),
              eq(profiles.classLevel, classLevel.nameEn)
            )!
          );
        }
      } else if (classLevelSlug) {
        conditions.push(eq(profiles.classLevel, classLevelSlug));
      }
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
      created_at: user.createdAt || null,
      updated_at: user.updatedAt || null,
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
    const db = await dbService.getDb();

    // Generate a new user ID
    const userId = generateId();

    // Hash password if provided
    let passwordHash: string | null = null;
    if (data.password) {
      passwordHash = await hashPassword(data.password);
    }

    // Create profile directly in database
    const [profile] = await db
      .insert(profiles)
      .values({
        id: userId,
        email: data.email,
        name: data.name,
        role: data.role,
        schoolId: data.schoolId,
        classLevel: data.classLevel,
        isActive: data.isActive ?? true,
        passwordHash: passwordHash,
        permissions: {},
      })
      .onConflictDoUpdate({
        target: profiles.id,
        set: {
          name: data.name,
          role: data.role,
          schoolId: data.schoolId,
          classLevel: data.classLevel,
          isActive: data.isActive ?? true,
          passwordHash: passwordHash,
          updatedAt: new Date().toISOString(),
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
    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.schoolId !== undefined) updateData.schoolId = data.schoolId;
    if (data.classLevel !== undefined) updateData.classLevel = data.classLevel;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.permissions !== undefined) updateData.permissions = data.permissions;
    if (data.email !== undefined) updateData.email = data.email;

    // 2. Hash and update password if provided
    if (data.password) {
      updateData.passwordHash = await hashPassword(data.password);
    }

    const [updatedProfile] = await db
      .update(profiles)
      .set(updateData)
      .where(eq(profiles.id, userId))
      .returning();

    return updatedProfile;
  }

  /**
   * Delete user (Soft delete by default)
   */
  static async delete(userId: string, hardDelete = false) {
    const db = await dbService.getDb();

    if (hardDelete) {
      // Hard delete from profiles table
      await db.delete(profiles).where(eq(profiles.id, userId));
      return true;
    } else {
      // Soft delete (deactivate)
      await db
        .update(profiles)
        .set({
          isActive: false,
          updatedAt: new Date().toISOString()
        })
        .where(eq(profiles.id, userId));

      return true;
    }
  }
}

