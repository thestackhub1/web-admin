/**
 * Schools Service
 * 
 * Business logic for school management.
 * Uses DbService for all database operations.
 */

import { dbService, type RLSContext } from './dbService';
import { eq, and, or, ilike, asc, desc, sql } from 'drizzle-orm';
import { schools, profiles } from '@/db/schema';

export interface SchoolCreateData {
  name: string;
  locationCity?: string;
  locationState?: string;
  locationCountry?: string;
  createdBy?: string;
}

export interface SchoolUpdateData {
  name?: string;
  locationCity?: string;
  locationState?: string;
  locationCountry?: string;
  isVerified?: boolean;
  isUserAdded?: boolean;
}

export class SchoolsService {
  /**
   * Get all schools with optional filters, search and pagination
   */
  static async getAll(
    options?: {
      isVerified?: boolean;
      isUserAdded?: boolean;
      locationCity?: string;
      locationState?: string;
      search?: string;
      page?: number;
      pageSize?: number;
    },
    rlsContext?: RLSContext
  ) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const conditions = [];

    if (options?.isVerified !== undefined) {
      conditions.push(eq(schools.isVerified, options.isVerified));
    }

    if (options?.isUserAdded !== undefined) {
      conditions.push(eq(schools.isUserAdded, options.isUserAdded));
    }

    if (options?.locationState) {
      conditions.push(eq(schools.locationState, options.locationState));
    }

    if (options?.locationCity) {
      conditions.push(ilike(schools.locationCity, `%${options.locationCity}%`));
    }

    if (options?.search) {
      const searchTerm = options.search.toLowerCase().trim();
      conditions.push(
        or(
          ilike(schools.nameSearch, `%${searchTerm}%`),
          ilike(schools.locationCity, `%${searchTerm}%`),
          ilike(schools.locationState, `%${searchTerm}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Handle pagination
    const page = options?.page || 1;
    const pageSize = options?.pageSize || 50;
    const offset = (page - 1) * pageSize;

    // Total count for pagination
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schools)
      .where(whereClause);

    // Global stats (optional optimization: cache these)
    const [verifiedCountResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schools)
      .where(eq(schools.isVerified, true));

    const [unverifiedCountResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schools)
      .where(eq(schools.isVerified, false));

    const totalItems = Number(countResult?.count || 0);
    const totalPages = Math.ceil(totalItems / pageSize);

    const results = await db
      .select()
      .from(schools)
      .where(whereClause)
      .orderBy(asc(schools.name))
      .limit(pageSize)
      .offset(offset);

    return {
      items: results.map((school) => ({
        id: school.id,
        name: school.name,
        name_search: school.nameSearch,
        location_city: school.locationCity,
        location_state: school.locationState,
        location_country: school.locationCountry,
        is_verified: school.isVerified,
        is_user_added: school.isUserAdded,
        created_by: school.createdBy,
        student_count: school.studentCount,
        created_at: school.createdAt?.toISOString(),
        updated_at: school.updatedAt?.toISOString(),
      })),
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      stats: {
        totalItems, // This is filtered total
        totalVerified: Number(verifiedCountResult?.count || 0),
        totalUnverified: Number(unverifiedCountResult?.count || 0),
        totalOverall: Number(verifiedCountResult?.count || 0) + Number(unverifiedCountResult?.count || 0)
      }
    };
  }

  /**
   * Get school by ID
   */
  static async getById(schoolId: string, rlsContext?: RLSContext) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const [school] = await db
      .select()
      .from(schools)
      .where(eq(schools.id, schoolId))
      .limit(1);

    if (!school) {
      return null;
    }

    return {
      id: school.id,
      name: school.name,
      name_search: school.nameSearch,
      location_city: school.locationCity,
      location_state: school.locationState,
      location_country: school.locationCountry,
      is_verified: school.isVerified,
      is_user_added: school.isUserAdded,
      created_by: school.createdBy,
      student_count: school.studentCount,
      created_at: school.createdAt?.toISOString(),
      updated_at: school.updatedAt?.toISOString(),
    };
  }

  /**
   * Get school by ID with real-time student count
   */
  static async getByIdWithStudentCount(schoolId: string, rlsContext?: RLSContext) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const [school] = await db
      .select()
      .from(schools)
      .where(eq(schools.id, schoolId))
      .limit(1);

    if (!school) {
      return null;
    }

    // Get real-time student count
    const [countResult] = await db
      .select({ count: sql<number>`count(*)`.as('count') })
      .from(profiles)
      .where(and(
        eq(profiles.schoolId, schoolId),
        eq(profiles.role, 'student')
      ));

    const studentCount = Number(countResult?.count || 0);

    return {
      id: school.id,
      name: school.name,
      name_search: school.nameSearch,
      location_city: school.locationCity,
      location_state: school.locationState,
      location_country: school.locationCountry,
      is_verified: school.isVerified,
      is_user_added: school.isUserAdded,
      created_by: school.createdBy,
      student_count: studentCount,
      created_at: school.createdAt?.toISOString(),
      updated_at: school.updatedAt?.toISOString(),
    };
  }

  /**
   * Search schools by name
   */
  static async search(query: string, limit: number = 10, rlsContext?: RLSContext) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const searchTerm = query.toLowerCase().trim();

    const results = await db
      .select()
      .from(schools)
      .where(ilike(schools.nameSearch, `%${searchTerm}%`))
      .limit(limit)
      .orderBy(asc(schools.name));

    return results.map((school) => ({
      id: school.id,
      name: school.name,
      location_city: school.locationCity,
      location_state: school.locationState,
      location_country: school.locationCountry,
      is_verified: school.isVerified,
    }));
  }

  /**
   * Get school suggestions (for autocomplete)
   */
  static async suggest(query: string, limit: number = 5, rlsContext?: RLSContext) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const searchTerm = query.toLowerCase().trim();

    const results = await db
      .select({
        id: schools.id,
        name: schools.name,
        locationCity: schools.locationCity,
        locationState: schools.locationState,
      })
      .from(schools)
      .where(ilike(schools.nameSearch, `%${searchTerm}%`))
      .limit(limit)
      .orderBy(asc(schools.name));

    return results.map((school) => ({
      id: school.id,
      name: school.name,
      location: [school.locationCity, school.locationState].filter(Boolean).join(', '),
    }));
  }

  /**
   * Create a new school
   */
  static async create(data: SchoolCreateData, rlsContext?: RLSContext) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const nameSearch = data.name.toLowerCase().trim();

    const [school] = await db
      .insert(schools)
      .values({
        name: data.name,
        nameSearch: nameSearch,
        locationCity: data.locationCity,
        locationState: data.locationState,
        locationCountry: data.locationCountry || 'India',
        createdBy: data.createdBy,
        isUserAdded: !!data.createdBy,
        isVerified: false,
      })
      .returning();

    return {
      id: school.id,
      name: school.name,
      name_search: school.nameSearch,
      location_city: school.locationCity,
      location_state: school.locationState,
      location_country: school.locationCountry,
      is_verified: school.isVerified,
      is_user_added: school.isUserAdded,
      created_by: school.createdBy,
      student_count: school.studentCount,
      created_at: school.createdAt?.toISOString(),
      updated_at: school.updatedAt?.toISOString(),
    };
  }

  /**
   * Update a school
   */
  static async update(schoolId: string, data: SchoolUpdateData, rlsContext?: RLSContext) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) {
      updateData.name = data.name;
      updateData.nameSearch = data.name.toLowerCase().trim();
    }
    if (data.locationCity !== undefined) updateData.locationCity = data.locationCity;
    if (data.locationState !== undefined) updateData.locationState = data.locationState;
    if (data.locationCountry !== undefined) updateData.locationCountry = data.locationCountry;
    if (data.isVerified !== undefined) updateData.isVerified = data.isVerified;
    if (data.isUserAdded !== undefined) updateData.isUserAdded = data.isUserAdded;

    const [school] = await db
      .update(schools)
      .set(updateData)
      .where(eq(schools.id, schoolId))
      .returning();

    if (!school) {
      return null;
    }

    return {
      id: school.id,
      name: school.name,
      name_search: school.nameSearch,
      location_city: school.locationCity,
      location_state: school.locationState,
      location_country: school.locationCountry,
      is_verified: school.isVerified,
      is_user_added: school.isUserAdded,
      created_by: school.createdBy,
      student_count: school.studentCount,
      created_at: school.createdAt?.toISOString(),
      updated_at: school.updatedAt?.toISOString(),
    };
  }

  /**
   * Check if school name exists with same location
   */
  static async findDuplicate(
    name: string,
    locationCity?: string | null,
    locationState?: string | null,
    rlsContext?: RLSContext
  ) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const nameSearch = name.toLowerCase().trim();
    const conditions = [eq(schools.nameSearch, nameSearch)];

    if (locationCity) {
      conditions.push(eq(schools.locationCity, locationCity));
    } else {
      conditions.push(sql`${schools.locationCity} IS NULL`);
    }

    if (locationState) {
      conditions.push(eq(schools.locationState, locationState));
    } else {
      conditions.push(sql`${schools.locationState} IS NULL`);
    }

    const [result] = await db
      .select({
        id: schools.id,
        name: schools.name,
        locationCity: schools.locationCity,
        locationState: schools.locationState,
      })
      .from(schools)
      .where(and(...conditions))
      .limit(1);

    return result || null;
  }

  /**
   * Delete a school
   */
  static async delete(schoolId: string, rlsContext?: RLSContext) {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    await db
      .delete(schools)
      .where(eq(schools.id, schoolId));

    return { success: true };
  }

  /**
   * Check if school name exists
   */
  static async nameExists(name: string, excludeId?: string, rlsContext?: RLSContext): Promise<boolean> {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const nameSearch = name.toLowerCase().trim();
    const conditions = [eq(schools.nameSearch, nameSearch)];

    if (excludeId) {
      conditions.push(sql`${schools.id} != ${excludeId}`);
    }

    const [result] = await db
      .select({ id: schools.id })
      .from(schools)
      .where(and(...conditions))
      .limit(1);

    return !!result;
  }

  /**
   * Get student count for a school
   */
  static async getStudentCount(schoolId: string, rlsContext?: RLSContext): Promise<number> {
    const db = await dbService.getDb(rlsContext ? { rlsContext } : {});

    const [countResult] = await db
      .select({ count: sql<number>`count(*)`.as('count') })
      .from(profiles)
      .where(and(eq(profiles.schoolId, schoolId), eq(profiles.role, 'student')));

    return Number(countResult?.count || 0);
  }
}

